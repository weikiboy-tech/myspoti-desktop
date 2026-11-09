# Contributing to Myspoti

## Windows desktop development

The active desktop implementation is in `desktop/`. Read [the desktop guide](desktop/README.md) and [current status](docs/STATUS.md) first. Node.js >=22 is required:

```powershell
cd desktop
npm test
npm run build
```

Browser tests additionally require `npm ci --ignore-scripts` and `MYSPOTI_TEST_BROWSER` pointing to an installed Chromium-family browser. Run `npm run test:browser`. This harness uses synthetic data; it does not prove live Spotify compatibility.

Desktop changes run the Windows CI workflow. The original Android workflows are retained as inactive references under `docs/upstream/workflows/`. Original Android guidance follows below; see [the original README](README.android.md).

Do not commit profiles, credentials, Spotify binaries, local backups or real-account screenshots. Preserve the upstream attribution and GPL notices. Keep partial implementations clearly marked; a visible button is not proof of functionality.

## Android upstream

Thanks for helping. Bug reports (with a diagnostic report from Settings), fixes and translations are all welcome.

## Build and test

Requirements: JDK 17+ and the Android SDK (compileSdk 37). The Android project is in `base/`.

```bash
cd base
./gradlew assembleDebug
./gradlew :app:testDebugUnitTest :api-spotify:test
```

Put your SDK path in `base/local.properties` (`sdk.dir=...`). The live API tests (`:host-cdp:test`) need a desktop Chrome signed in to the Web Player; see the README.

## Changes

- Keep a change focused, and write it like the code around it. Texts in the repository (code, comments, strings in `values/`, docs) are in English; translations go in the matching `values-xx/` folder.
- Add or update a unit test when you fix a bug or change a rule.
- Commit messages are one plain sentence in English that says what changes for the user (or what was wrong), not a list of files.

## Rules

- **Extensions API:** an extension call that is accepted today must never become an error. New fields and calls are fine; removing, renaming or tightening an existing one is not.
- **Spotify:** Myspoti talks to Spotify the way its Web Player does. No contribution may bypass, weaken or work around Spotify's protections (DRM, licences, attestation, rate limits), and none may add a Spotify audio download or decryption.
- **License:** Myspoti is GPL-3.0. Your contribution is released under the same license. If you reuse this code in another project, keep the notices, credit Myspoti (https://github.com/kota-zo/myspoti) and publish your complete source under GPL-3.0; closing the source or changing the license is a violation.
