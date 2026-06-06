# Mac Studio production hardening (post 2026-06-06 incident)

On 2026-06-06 the Mac Studio crashed; on reboot Docker Desktop's **containerd
metadata (bbolt) was corrupted** and the engine refused to start. The only fix
was deleting `Docker.raw`, which wipes **all** Docker named volumes for **every**
app sharing the engine (ProjeXtPal, IQ Helix, …). ProjeXtPal recovered from a
pre-deploy SQL dump; IQ Helix survived because its DB is a **host bind-mount**.

These four measures reduce both the chance and the blast radius of a repeat.

## 1. Reliable, off-host Postgres backups  (`scripts/backup-postgres.sh`)
ProjeXtPal Postgres stays on a **named volume** (a host bind-mount of a Postgres
data dir is unreliable on macOS Docker Desktop — ownership/fsync issues). The
real protection is a *trustworthy* dump:
- dumps the live `projextpal-postgres-prod`, gzipped;
- **verifies >100 KB** (guards the 20-byte empty-dump failure mode);
- copies off-host to iCloud Drive;
- rotates (keep 14).

Cron (every 6h):
```
0 */6 * * *  /Users/sami/Desktop/ProjextPal/scripts/backup-postgres.sh >> /Users/sami/Desktop/ProjextPal/logs/db-backup.log 2>&1
```

## 2. Docker + stack watchdog  (`scripts/docker-watchdog.sh` + LaunchAgent)
After a reboot the engine did not auto-start. The watchdog (every 5 min):
- starts Docker Desktop if the engine is down;
- brings the ProjeXtPal stack up if `projextpal-nginx-prod` is missing.

Install:
```
cp scripts/com.inclufy.docker-watchdog.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.inclufy.docker-watchdog.plist
```
Also enable **System Settings → General → Login Items → Open at Login: Docker**,
and **auto-login** so a reboot yields a GUI session Docker Desktop can use.

## 3. External uptime monitoring (UptimeRobot)
Create monitors at https://uptimerobot.com:
- `https://projextpal.com` — HTTP(s), keyword check (e.g. expect 200).
- `https://api.projextpal.com/api/health/` — if exposed.
- `https://iq-helix.inclufy.com` — HTTP(s).
5-min interval, alert to email/SMS. Catches an outage before a customer does.

## 4. Keep the Mac Studio awake + auto-restart
```
sudo pmset -a sleep 0 disablesleep 1 autorestart 1 womp 1
```
- `sleep 0` / `disablesleep 1` — never sleep (the crash followed a sleep/outage).
- `autorestart 1` — power back on after a power failure.
- `womp 1` — wake on network.

Verify: `pmset -g | grep -E "sleep|autorestart|womp"`
