# Build extensions from source

**Menu:** [Home](README.md) · [Installation](installation.md) · [Usage](user-guide.md) · [Build](build.md) · [Safari](safari.md) · [Technical](technical.md) · [Security](security.md) · [Troubleshooting](troubleshooting.md) · [Deutsch](../de/README.md)

---

## Reproducible build
Requirements: Python 3.10+ and Node.js 18+. From the repository root:

```bash
python3 build.py --check
python3 build.py
```

Outputs: `dist/teampass-web-connector-chromium-1.0.0.zip`, `dist/teampass-web-connector-firefox-1.0.0.xpi`, and unpacked directories for local testing.

## Chromium/Edge
The ZIP contains `manifest.chromium.json` as `manifest.json` plus `src/`. Use the ZIP for store submission and load `dist/chromium` for local tests.

## Firefox
The XPI is technically a ZIP with the Firefox manifest. Permanent installation normally requires signing through Mozilla Add-ons; use `about:debugging` during development.

## Safari on macOS
1. Build the Chromium target first.
2. Install Xcode on the Mac.
3. Run:
```bash
xcrun safari-web-extension-packager dist/chromium \
  --project-location safari-build \
  --app-name "TeamPass Web Connector" \
  --bundle-identifier "io.github.5iggi.teampass-web-connector" \
  --swift --macos-only --copy-resources
```
4. Open the project in Xcode, select a Signing Team, build, and enable it under **Safari → Settings → Extensions**.

Safari is an optional porting target. Network authentication, permissions, and all critical workflows require separate Mac testing; a signed Safari package cannot be produced independently of Xcode/Apple Developer.

---
**Menu:** [Home](README.md) · [Installation](installation.md) · [Usage](user-guide.md) · [Build](build.md) · [Safari](safari.md) · [Technical](technical.md) · [Security](security.md) · [Troubleshooting](troubleshooting.md) · [Deutsch](../de/README.md)

---
