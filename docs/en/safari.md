# Build the Safari extension on macOS

**Menu:** [Home](README.md) · [Installation](installation.md) · [Usage](user-guide.md) · [Build](build.md) · [Safari](safari.md) · [Technical](technical.md) · [Security](security.md) · [Troubleshooting](troubleshooting.md) · [Deutsch](../de/README.md)

---

> **Status:** Safari is a porting target. Version 1.0.0 primarily builds Chromium/Edge and Firefox packages. The Safari output must be created, signed, and separately tested on macOS with Xcode.

## Requirements

- macOS with a current Apple-supported Xcode version
- Xcode Command Line Tools
- an Apple ID; Apple Developer Program membership for App Store/TestFlight distribution
- this repository or `teampass-web-connector-safari-source-1.0.0.zip`

Verify:

```bash
xcode-select -p
xcodebuild -version
xcrun safari-web-extension-packager --help
```

Install Command Line Tools if required:

```bash
xcode-select --install
```

## Quick path using the included script

```bash
git clone https://github.com/5iggi/teampass-web-connector.git
cd teampass-web-connector
python3 build.py
chmod +x tools/build_safari_macos.sh
./tools/build_safari_macos.sh
```

The script:

1. verifies macOS, Xcode, and the Chromium WebExtension build,
2. runs `xcrun safari-web-extension-packager`,
3. creates an Xcode project under `dist/safari-xcode/`,
4. copies WebExtension resources so Chromium build changes cannot silently alter the generated Safari project.

## Manual path

```bash
python3 build.py
xcrun safari-web-extension-packager dist/chromium \
  --project-location dist/safari-xcode \
  --app-name "TeamPass Web Connector" \
  --bundle-identifier "io.github.5iggi.teampass-web-connector" \
  --swift \
  --macos-only \
  --copy-resources
```

Apple previously called the tool `safari-web-extension-converter`. Current Xcode releases use `safari-web-extension-packager`.

## Configure Xcode

1. Open the generated `.xcodeproj`.
2. Select your team under **Signing & Capabilities**.
3. Verify unique bundle identifiers for the app and extension.
4. Set the macOS Deployment Target.
5. Run **Product → Build**.
6. Launch the generated app.
7. Open Safari and enable it under **Safari → Settings → Extensions**.
8. Grant the required website access in Safari.

## Safari test plan

Test at least:

- TeamPass connectivity and local-vault unlock
- exact URL, origin, and main-domain lookup
- standard username/password login
- multi-step sign-in
- Shadow DOM and web-component fields
- saving and updating an item
- folder selection and folder creation
- HTTP Basic/.htaccess authentication
- Dark Mode and German/English UI
- locking after browser restart and inactivity

> `webRequest`, `webRequestAuthProvider`, background execution, and HTTP Basic can behave differently in Safari. Real runtime tests are required before release.

## Distribution

A locally signed Xcode build is enough for private tests. Public distribution requires Apple signing, App Store Connect, App Review, and optionally TestFlight. The repository intentionally does not ship a ready-made or signed `.app`/`.pkg` package.

## Rebuild after source changes

Rebuild Chromium first, then rebuild the Xcode project:

```bash
python3 build.py
xcrun safari-web-extension-packager dist/chromium \
  --project-location dist/safari-xcode \
  --rebuild-project \
  --copy-resources
```

If the installed Xcode version requires different arguments for `--rebuild-project`, check `xcrun safari-web-extension-packager --help` first.

---
**Menu:** [Home](README.md) · [Installation](installation.md) · [Usage](user-guide.md) · [Build](build.md) · [Safari](safari.md) · [Technical](technical.md) · [Security](security.md) · [Troubleshooting](troubleshooting.md) · [Deutsch](../de/README.md)

---
