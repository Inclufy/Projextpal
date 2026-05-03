# Deploy Roadmap — Mobile Apps (Inclufy AI Finance + ProjeXtPal)

**Datum**: 2026-05-03
**Apps**: `InclufyAIFinance` (Finance) + `ProjeXtPal`
**Doel**: nieuwe versies naar TestFlight (iOS) + APK download (Android)
**Owner agent**: `mobile-deploy-engineer` (`~/.claude/agents/mobile-deploy-engineer.md`)

---

## Apps register

| App | Repo-pad | Branch | iOS workspace | ASC App ID |
|---|---|---|---|---|
| Inclufy AI Finance | `inclufy-auto-finance-main/mobile` | `main` | `mobile/ios/InclufyAIFinance.xcworkspace` | _missing in eas.json_ |
| ProjeXtPal | `projextpal/` | `master` | `ios/ProjeXtPal.xcworkspace` | `6758148054` |

---

## Pre-deploy checklist (lokaal — vereist Mac)

| # | Check | Commando | Pass-criterium |
|---|---|---|---|
| 1 | Expo SDK packages in sync | `npx expo install --check` | "Dependencies are up to date" |
| 2 | npm lockfile sync | `npm ci --dry-run` | geen `Missing: ... from lock file` |
| 3 | Podfile.lock RN-version klopt | `grep "(0.83." mobile/ios/Podfile.lock \| head` | alleen 1 versie, gelijk aan `package.json` |
| 4 | Android compileSdk | `grep compileSdkVersion mobile/app.json` | `36` (sinds 2026-05) |
| 5 | EAS-auth + project-link | `eas whoami; cat eas.json \| jq .build.production` | Logged in als `inclufy`, profile bevat env+ascAppId |
| 6 | Lokaal type-check | `npx tsc --noEmit` | exit 0 |

Als check 1 of 2 faalt: `npx expo install --fix` resp. `npm install`. Pull-apart commits per fix-categorie. Push **GitHub-only** (zie sectie 5).

---

## Build pipelines

### Path A — EAS Build + Submit (primair pad voor TestFlight)

```bash
cd <app-pad>

# iOS production naar TestFlight (auto-submit)
eas build --platform ios --profile production --auto-submit --non-interactive

# Android APK voor sideload-test
eas build --platform android --profile preview --non-interactive

# Android AAB voor Play Store
eas build --platform android --profile production --non-interactive
```

Build duurt 15-30 min. Auto-submit-step duurt nog 5-10 min Apple-side processing.

### Path B — Xcode Cloud (parallel iOS-pad)

Vereist:
- App Store Connect Xcode Cloud workflow geconfigureerd
- `ci_scripts/ci_post_clone.sh` aanwezig en executable
- Distribution-certificaat geldig

Trigger: `git push github main` of click "Start Build" in App Store Connect → Xcode Cloud → Builds.

Bekende valkuil: faalt regelmatig op **Code Signing** stap. Daarvoor zie sectie 6 (manual config in App Store Connect).

---

## Smoke test on device

### iOS — TestFlight Internal

1. Open **TestFlight** app op iPhone
2. Sign in met dezelfde Apple ID die op App Store Connect staat
3. Kies app (`Inclufy AI Finance` of `ProjeXtPal`)
4. Tab **Builds** → install nieuwste
5. Test:
   - Login flow (Supabase / API auth werkt)
   - Een data-load (factuurlijst / project-overzicht)
   - Camera/foto-pick (voor Finance scanner / ProjeXtPal docs)
   - Push-notificatie ontvangst (indien geconfigureerd)
6. Check Sentry-dashboard voor crashes binnen 5 min na install

### Android — APK direct sideload

1. Open EAS-build URL op Android-device of scan QR uit `eas build` output
2. Download APK
3. Sta unknown-source install toe (Settings → Security)
4. Install + open
5. Zelfde smoke-test als iOS

---

## Rollback

| Scenario | Actie |
|---|---|
| TestFlight-build crasht meteen | Verwijder build uit TestFlight Internal Testing group, vorige blijft gewoon |
| Productie-build heeft regression | App Store Connect → app → versie → "Reject Submission" voor app-review pendant; voor reeds-released: nieuwe patch-versie publish |
| EAS auto-submit landde verkeerde versie | `eas submit --platform ios --id <correcte-build-id>` |
| Code-signing in Xcode Cloud breekt prod-flow | Schakel Xcode Cloud-workflow tijdelijk uit; gebruik EAS-pad |

---

## Push-strategie — quota management

Per gebruiker-regel **GitLab-pushes spaarzaam, GitHub vrij**:

| Type wijziging | Push naar |
|---|---|
| Lockfile/deps fixes (`expo install --fix`, `npm install`) | **GitHub only** |
| `ci_post_clone.sh`-tweaks | **GitHub only** |
| Podfile.lock regenerations | **GitHub only** |
| Pre-release fix-iteratie (build-failures debug) | **GitHub only** |
| Productie-deploy (release-tag) | GitHub **+** GitLab |
| Security-fixes / data-leak fixes | GitHub **+** GitLab (CI-test gewenst) |

Reden: GitLab-namespace `inclufy` heeft 400 compute-min/maand quota; mobile-build-iteratie kan hard van die quota afsnoepen.

---

## Manual App Store Connect config (Xcode Cloud Code Signing)

Wanneer Xcode Cloud faalt op "Exporting for App Store Distribution failed":

1. App Store Connect → **app** → **Xcode Cloud** → **Manage Workflows**
2. Klik op `Default` workflow → **Edit**
3. **Distribute** stap:
   - Distribution Method = `App Store Connect`
   - Distribution Type = `TestFlight (Internal Testing Only)` (voor jouw test-installatie) of `App Store` (voor publieke release)
4. **Provisioning** = `Automatic`
5. Sign In = Apple ID die distributiecertificaat heeft (verloopt jaarlijks; check geldigheid)
6. Save → Run workflow opnieuw

EAS-flow heeft deze stap niet nodig — gebruikt EAS-managed credentials.

---

## Bekende patronen (lessons learned)

Zie `~/.claude/agents/mobile-deploy-engineer.md` voor de complete bibliotheek aan failure→fix mappings:

- **A.** Expo SDK packages out of sync → `EXSharedApplication not found in scope`
- **B.** package-lock.json drift → `Missing: <pkg> from lock file`
- **C.** Podfile.lock vs RN versie-mismatch → `React-Core-prebuilt could not resolve`
- **D.** Android compileSdk-mismatch → `:app:checkReleaseAarMetadata FAILED`
- **E.** Sentry source-map upload → `An organization ID or slug is required`
- **F.** Xcode Cloud ci_post_clone exit 1 → `brew install node` faalt op pre-genode image
- **G.** Xcode Cloud "Workspace .xcworkspace does not exist" → symlink in ci_post_clone
- **H.** Code Signing failure in Xcode Cloud → manual App Store Connect config

---

## Volgende deploy

| App | Platform | Build-ID | Submit | Status |
|---|---|---|---|---|
| ProjeXtPal | iOS | `production / latest` | auto → TestFlight | ✅ submitted 2026-05-03 ~20:30 |
| ProjeXtPal | Android | `preview` | APK download | ✅ ready 2026-05-03 ~20:33 |
| Finance | iOS | _in flight, retry post-Podfile.lock fix_ | auto → TestFlight | ⏳ |
| Finance | Android | `preview` | APK download | ✅ ready 2026-05-03 |

---

**Onderhoud van dit document**: na elke release de "Volgende deploy" tabel bijwerken; nieuwe failure-patronen toevoegen aan de mobile-deploy-engineer agent zodat ze hergebruikbaar zijn.
