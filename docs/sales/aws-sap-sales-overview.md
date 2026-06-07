# ProjeXtPal — Dedicated Hosting + SAP S/4HANA-koppeling
### Sales- & gespreksoverzicht (intern voorbereidingsdocument)

> Doel: in de meeting de klant meenemen in (A) hostingopties en (B) de SAP S/4HANA-factuurkoppeling,
> ophalen welke informatie we nodig hebben voor een onderbouwde begroting, en een **goedkope pilot**
> voorstellen om snel waarde + vertrouwen te bewijzen.
> Bedragen zijn **indicatief** (planningsdoel, geen offerte). Aannames: dev ~€800/dag, SAP-consultant ~€1.000–1.400/dag, infra eu-west-1.

---

## 1. Waar gaat dit over (in één zin)
We bieden ProjeXtPal aan als **dedicated/eigen omgeving** (AWS of on-premise) én koppelen het aan
**SAP S/4HANA** zodat goedgekeurde facturen automatisch en met audit-trail in de financiële kern landen — geen dubbele invoer, geen overtypen.

---

## 2. Waarom dit waardevol is voor de klant (sales angle)

| Thema | Klantvoordeel |
|---|---|
| **Data-soevereiniteit & security** | Eigen geïsoleerde omgeving, EU/NL-residency, voldoet aan AVG/ISO-eisen |
| **Compliance & audit** | Volledige audit-trail van factuur → goedkeuring → SAP-boeking |
| **Geen dubbel werk** | Factuurdata stroomt automatisch naar SAP; minder fouten, snellere doorlooptijd |
| **Performance & SLA** | Dedicated resources, voorspelbare prestaties, afgesproken uptime |
| **Schaalbaar** | Groeit mee met aantal projecten/gebruikers zonder herbouw |

---

## 3. De opties op hoofdlijnen (indicatief)

### A. Hosting
| Optie | Eenmalig | Per maand | Beste voor |
|---|---|---|---|
| **AWS managed** (single-tenant VPC) | €8k–13k | €250–400 | Snelste start, minste beheer — **aanrader als basis** |
| **AWS dedicated** (fysiek geïsoleerde hardware) | €10k–15k | €700–1.600 | Strikte compliance/licentie-isolatie |
| **On-premise** (eigen serverruimte) | €14k–22k + €8k–20k hardware | €200–600 opex | Data moet fysiek in eigen huis blijven |

### B. SAP S/4HANA-factuurkoppeling
| Scope | Effort | Indicatie |
|---|---|---|
| **Push-only** — goedgekeurde factuur → SAP via OData (geen middleware) | 25–40 dagen dev + 8–12 dagen SAP | €25k–45k |
| **Bidirectioneel + CPI** — push + statusterugkoppeling + master-data-sync | 40–60 dagen dev + 15–25 dagen SAP | €50k–90k+ |

> **Boodschap voor de meeting:** start klein (AWS managed + SAP push-only via pilot), schaal daarna op.

---

## 4. Welke informatie hebben we nodig voor een goede begroting (discovery)

> Dit is de **belangrijkste uitkomst van de meeting**: deze antwoorden bepalen of het €25k of €90k wordt.
> Neem dit als checklist mee.

### 4A. Hosting
1. **Aantal gebruikers / tenants** nu en verwachte groei (1 jaar / 3 jaar)?
2. **SLA-eisen**: gewenste uptime (bv. 99,5% / 99,9%), onderhoudsvensters?
3. **Data residency / compliance**: EU/NL verplicht? ISO 27001, NIS2, branche-eisen?
4. **Bestaande infra**: hebben ze al een AWS-account / landing zone / eigen datacenter?
5. **Backup & DR**: gewenste RPO/RTO (hoeveel dataverlies / hoe snel weer up)? Off-site kopie nodig?
6. **Security**: SSO/identity provider (Azure AD/Okta)? Pentest-eisen? Encryptie-eisen (at-rest/in-transit)?
7. **Beheer**: willen zij zelf beheren, of nemen wij het als **managed service** (recurring fee)?
8. **Integraties & piekbelasting**: andere systemen die koppelen? Piekmomenten (maandafsluiting)?

### 4B. SAP S/4HANA
1. **Welke variant?** S/4HANA **Cloud (public/private)** of **on-premise**? Welke release/versie?
2. **Welke facturen?** Leveranciersfacturen (AP) en/of verkoop (AR)? **Volume per maand?**
3. **Richting**: alleen **push** (ProjeXtPal → SAP) of **bidirectioneel** (statusterugkoppeling)?
4. **Beschikbare API's / licenties**: OData (bv. `API_SUPPLIERINVOICE_PROCESS_SRV`), SAP **Integration Suite/CPI**, BAPI/RFC, IDoc — wat is aanwezig én gelicenseerd?
5. **Master data**: leveranciers, grootboekrekeningen, kostenplaatsen/WBS, btw-codes, valuta — **welk systeem is leidend** en hoe synchroniseren we?
6. **Authenticatie & netwerk**: OAuth2 / client-certificaat / technische user? SAP **Cloud Connector**, VPN of Direct Connect nodig?
7. **Goedkeuringsproces**: waar wordt goedgekeurd — in ProjeXtPal of in SAP?
8. **Bestaande middleware/iPaaS** al in gebruik?
9. **Wie levert de SAP-kant?** Eigen SAP-team of externe partner — beschikbaarheid + planning?
10. **Test-/QA-systeem (sandbox)** beschikbaar om veilig tegenaan te bouwen?
11. **Non-functioneel**: foutafhandeling, reconciliatie/aansluiting, idempotentie, retentie/audit-eisen?

---

## 5. Pilot-voorstel (snelle waarde, lage kosten)

> Idee: bewijs eerst **connectiviteit + waarde** met een afgebakende, vaste-prijs pilot vóór de grote investering.
> Looptijd ~**4–6 weken**, duidelijke **go/no-go** naar productie.

### Pilot A — Hosting PoC
- Kleine **AWS managed staging-omgeving** (single-AZ, compact) — lage infra (~€150–250/mnd) + paar dagen setup.
- Of een **EC2 lift-and-shift** van de huidige Docker-stack als snelle PoC.
- **Bewijst**: de app draait in hun gewenste regio/omgeving, performance, security-basis.
- **Indicatie**: ~3–5 dagen setup + lage maand-infra.

### Pilot B — SAP push-only PoC
- **Eén factuurtype**, happy-path, **één OData-endpoint**, **géén** CPI, **géén** master-data-sync.
- Tegen hun **SAP-sandbox/QA-systeem**.
- **Bewijst**: authenticatie, netwerkverbinding (Cloud Connector/VPN), veldmapping factuur → SAP, succesvolle boeking + terugkoppeling van het document-ID.
- **Indicatie**: ~10–15 dagen, **vaste prijs**.

### Pilot-randvoorwaarden (wat we van de klant nodig hebben)
- Toegang tot SAP-sandbox + technische user + (indien nodig) Cloud Connector.
- Eén SAP-contactpersoon voor mapping-vragen.
- Voorbeeldfacturen + verwachte boekingsregels.

### Succescriteria (vooraf afspreken)
- [ ] App bereikbaar in gewenste regio met SSO-login (Pilot A)
- [ ] 1 testfactuur volledig geboekt in SAP-sandbox met audit-trail (Pilot B)
- [ ] Foutscenario netjes afgehandeld (geen dubbele boeking)
- [ ] Go/no-go-beslissing + scope + prijs voor productie

---

## 6. Voorgestelde aanpak / next steps
1. **Discovery-workshop** (½ dag) — checklist §4 doornemen.
2. **Pilot-offerte** (vaste prijs) op basis van discovery — Pilot A en/of B.
3. **Pilot uitvoeren** (4–6 weken) → go/no-go.
4. **Productie-fasering**: Fase 1 hosting → Fase 2 SAP push → Fase 3 bidirectioneel.

---

## 7. Talking points voor de meeting
- "We hoeven niet alles in één keer te bouwen — we **bewijzen het eerst in een goedkope pilot**."
- "De **grootste prijsbepaler** is jullie SAP-landschap (Cloud vs on-prem) en of het push-only of bidirectioneel moet — daar willen we vandaag duidelijkheid over."
- "Hosting kan **stap voor stap**: start managed/single-tenant, groei naar dedicated als compliance dat vraagt."
- "Alles met **audit-trail en idempotentie** — geen dubbele boekingen, volledig herleidbaar."
- Vraag actief door op **volume, richting, en beschikbare API's** — dat is 80% van de scoping.
