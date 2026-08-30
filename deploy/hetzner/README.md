# ProjeXtPal naar Hetzner

Draaiboek van een lege machine naar een draaiende productie. Geschreven op
30 augustus 2026, toen de stack nog op de Mac Studio stond.

Alles hier is gemeten, niet geschat. Waar een getal staat, komt het uit de
draaiende productie van die dag.

---

## 0. Wat er nu draait, en wat daaraan verandert

De productie op de Studio is met de hand neergezet: vijf `docker run`-opdrachten
met een `--env-file`. Er zaten geen compose-labels op de containers, dus geen
enkel compose-bestand kon ze beheren. De reverse proxy stond op een variant-naam
(`projextpal-nginx-prod2`) die in geen bestand voorkwam.

Wat er verandert:

| | Mac Studio | Hetzner |
|---|---|---|
| starten | vijf `docker run` met de hand | `docker-compose.hetzner.yml` |
| proxy | nginx, certificaat via Cloudflare-tunnel | Caddy, eigen Let's Encrypt |
| frontend-image | `ghcr.io/inclufy/projextpal-web` | `registry.gitlab.com/inclufy/projextpal/frontend` |
| image-versie | `latest`, of met de hand gebouwd | vastgezet op de commit-sha |
| architectuur | arm64 | amd64 |

Gemeten verbruik van de hele stack in rust:

```
backend    952 MB      database     47 MB
frontend    63 MB      postgres-vol 106 MB
redis       39 MB      media        leeg
postgres    30 MB      static       leeg
proxy       20 MB
────────────────
totaal    ~1,1 GB
```

## 1. De machine

Op basis van die meting is ProjeXtPal alleen genoeg aan een kleine machine.
Reken op ongeveer het dubbele zodra er een staging naast staat, en tel op wat
IQ Helix erbij nodig heeft als die meeverhuist.

- **Genoeg voor ProjeXtPal plus staging**: een CPX-machine met 8 vCPU en 16 GB.
- **Als het hele ecosysteem meekomt**: een AX-machine uit de dedicated lijn,
  met flink meer geheugen en eigen schijven.

Controleer de actuele prijzen zelf, die veranderen. Neem Debian 12 of
Ubuntu 24.04, en zet bij het bestellen meteen je publieke sleutel klaar zodat
er nooit een wachtwoord-login op de machine heeft bestaan.

## 2. De machine inrichten

```bash
# als root, eenmalig
adduser --disabled-password --gecos "" deploy
usermod -aG docker deploy          # na de docker-installatie hieronder
mkdir -p /home/deploy/.ssh && chmod 700 /home/deploy/.ssh
# plak de publieke deploy-sleutel:
nano /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
```

Docker volgens de officiële handleiding van Docker zelf, niet uit de
distributie-pakketbron, anders krijg je een oude compose-versie.

Firewall: alleen 22, 80 en 443 open.

```bash
ufw default deny incoming && ufw allow 22 && ufw allow 80 && ufw allow 443 && ufw enable
```

Zet in `/etc/ssh/sshd_config` daarna `PasswordAuthentication no` en
`PermitRootLogin no`, en herstart sshd.

De map waar alles komt te staan:

```bash
install -d -o deploy -g deploy /srv/projextpal
```

## 3. DNS

Drie namen naar het IP van de machine:

```
projextpal.com          A    <ip>
www.projextpal.com      A    <ip>
api.projextpal.com      A    <ip>
```

**Zet ze in Cloudflare op "DNS only", niet op "proxied", tot Caddy zijn
certificaat heeft.** Caddy bewijst het domein via een verbinding op poort 80.
Staat Cloudflare ertussen met een eigen certificaat, dan komt die verbinding
nooit bij Caddy aan en blijft de aanvraag hangen. Daarna mag de proxy weer aan.

## 4. De registry bereikbaar maken op de server

De images staan in de GitLab-registry en die is privé. De server heeft dus
eigen leesrechten nodig. Gebruik daarvoor een deploy token, geen persoonlijke
sleutel: die eerste kun je intrekken zonder dat er iets anders omvalt.

GitLab, `inclufy/projextpal`, Settings, Repository, Deploy tokens. Maak er een
met alleen **`read_registry`**. Dan op de server, eenmalig, als `deploy`:

```bash
docker login registry.gitlab.com
```

Op Linux bewaart Docker die inloggegevens in een bestand. Dat is precies waar
het op de Mac misging: Docker Desktop schrijft ze daar naar de sleutelhanger van
de ingelogde gebruiker, en een deploy-sessie kan daar niet bij.

## 5. De CI-variabelen

GitLab, `inclufy/projextpal`, Settings, CI/CD, Variables. Zet ze allemaal op
**Protected**, want `master` is sinds vandaag een beschermde branch en alleen
beschermde variabelen worden aan die pipelines doorgegeven.

| Variabele | Waarde | Masked |
|---|---|---|
| `SSH_PRIVATE_KEY_B64` | de private deploy-sleutel als base64 | ja |
| `SSH_KNOWN_HOSTS` | uitvoer van `ssh-keyscan -H <ip>` | nee |
| `DEPLOY_USER` | `deploy` | nee |
| `DEPLOY_HOST` | het IP of de hostnaam | nee |
| `DEPLOY_PATH` | `/srv/projextpal` | nee |
| `SITE_DOMAIN` | `projextpal.com` | nee |
| `VITE_SENTRY_DSN` | de Sentry-DSN van de frontend | ja |

De sleutel als base64, en waarom:

```bash
base64 -i ~/.ssh/id_projextpal_deploy | tr -d '\n' | pbcopy
```

GitLab mangelt de regeleindes van een meerregelige variabele. Dat is waarom de
deploy van 9 augustus 2026 faalde op `error in libcrypto: unsupported`, nog voor
er ook maar één verbinding was gelegd. Base64 heeft geen regeleindes en overleeft
het wel. De pipeline controleert de sleutel nu met `ssh-keygen -y` voordat hij
iets probeert, dus als dit misgaat zie je meteen waarom.

## 6. Het env-bestand

```bash
scp deploy/hetzner/env.example deploy@<ip>:/srv/projextpal/.env
ssh deploy@<ip> chmod 600 /srv/projextpal/.env
```

Vul hem daarna **op de server** in. Nooit via chat, nooit via een ticket, nooit
in git. De sleutels staan in `deploy/hetzner/env.example` met per stuk een
toelichting.

Drie dingen om niet over te nemen van de oude opzet:

- Het oude `backend.env` bevat `PATH`, `GPG_KEY` en `PYTHON_VERSION`. Die komen
  uit het image, iemand heeft ooit `docker inspect` naar een bestand geschreven.
  `PATH` is de gevaarlijkste: die overschrijft het pad in de container.
- Het Redis-wachtwoord stond op de Studio in het startcommando en was zichtbaar
  in `docker ps`. Kies een nieuwe waarde.
- `ALLOWED_HOSTS` moet `localhost` bevatten, anders geeft de gezondheidscontrole
  van de backend een 400 en blijft de container als "unhealthy" staan terwijl
  hij prima werkt.

## 7. De database meeverhuizen

De database is 47 MB, dus dit duurt seconden.

Op de Studio:

```bash
export PATH=/usr/local/bin:/opt/homebrew/bin:$PATH
docker exec projextpal-postgres-prod \
  pg_dump -U projextpal -d projextpal -Fc -f /backups/pxp-verhuizing.dump
```

Let op: die `/backups` in de container wijst op de Studio naar
`/Users/sami/Desktop/ProjextPal/backups`. Dat is de Desktop-map die macOS voor
ssh-sessies afschermt, dus haal het bestand op vanuit een venster waarin je
zelf bent ingelogd, of kopieer het eerst naar een map buiten Desktop.

Naar de server, en erin:

```bash
scp pxp-verhuizing.dump deploy@<ip>:/srv/projextpal/backups/
ssh deploy@<ip>
cd /srv/projextpal
docker compose -f docker-compose.hetzner.yml up -d postgres
docker exec -i projextpal-postgres-prod \
  pg_restore -U projextpal -d projextpal --no-owner --clean --if-exists \
  /backups/pxp-verhuizing.dump
```

Controleer daarna dat er echt iets in staat, want een lege restore die geen
foutmelding geeft is precies het soort stilte waar we vandaag al een paar keer
in zijn gelopen:

```bash
docker exec projextpal-postgres-prod psql -U projextpal -d projextpal \
  -c "select count(*) from auth_user"
```

De volumes `media_files` en `static_files` waren op 30 augustus leeg. Zijn ze
dat later niet meer, dan gaan ze met `docker run --rm -v ... tar` mee.

## 8. De eerste uitrol

Draai een pipeline op `master`, wacht tot `build:backend` en `build:frontend`
groen zijn, en druk dan pas op `deploy:production`. De job:

1. controleert de sleutel voordat hij verbinding maakt
2. stuurt de compose, de Caddyfile en `known_issues.json` mee, bij die commit
3. weigert als er geen `.env` op de server staat
4. trekt de images van die commit-sha en start de stack
5. wacht tot `https://<domein>/health/simple/` antwoordt, tot tien keer toe

Stap vijf is er omdat een groene deploy die een stukke site achterlaat geen
groene deploy is.

## 9. Terugdraaien

Een deploy zet de images vast op de commit-sha, dus terug is gewoon een oudere
sha. Op de server:

```bash
cd /srv/projextpal
PXP_TAG=<oudere-sha> docker compose -f docker-compose.hetzner.yml up -d
```

De tags staan in GitLab onder Deploy, Container Registry. Draai daarna wel de
bijbehorende commit opnieuw uit via de pipeline, anders staat de compose op de
server niet meer bij het image dat draait.

Let op wat dit niet terugdraait: de backend voert bij het starten `migrate` uit.
Een migratie die kolommen weghaalt, is met een oudere image niet ongedaan
gemaakt. Neem voor een risicovolle migratie eerst een dump.

## 10. Wat er ná de omschakeling nog moet

Deze horen bij het opruimen, niet bij het uitrollen. Doe ze pas als het nieuwe
adres werkt:

- **De image-push uit de GitHub-workflow halen.** `.github/workflows/ci.yml`
  bouwt nu `ghcr.io/inclufy/projextpal-web`. Zolang de Studio draait is dat het
  image dat daar in productie staat, dus het mag pas weg als niemand het meer
  trekt. Daarna: die stap verwijderen, de tests laten staan.
- **`ghcr.io/inclufy/projextpal-web` op privé zetten.** Hij staat nu publiek.
- **De Stripe-webhook omzetten** naar het nieuwe adres. Die wijst nu naar de
  Studio. Betalingsmeldingen komen anders niet aan, en dat merk je niet aan een
  foutmelding maar aan een abonnement dat niet wordt bijgewerkt.
- **Cloudflare weer op "proxied"** zetten, nadat Caddy zijn certificaat heeft.
- **De back-up inrichten** op de nieuwe machine, inclusief het `caddy_data`-
  volume. Daar zitten de certificaten in; raakt dat weg, dan vraagt Caddy alles
  opnieuw aan en loop je tegen de snelheidslimiet van Let's Encrypt aan.
- **De oude stack op de Studio stoppen**, niet verwijderen, tot het nieuwe adres
  een paar dagen goed heeft gedraaid.
