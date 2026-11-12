# Build extensions from source

**Menu:** [Home](README.md) · [Installation](installation.md) · [Usage](user-guide.md) · [Build](build.md) · [Safari](safari.md) · [Technical](technical.md) · [Security](security.md) · [Troubleshooting](troubleshooting.md) · [Deutsch](../de/README.md)

## Requirements

- Python 3.10 or newer
- Node.js 18 or newer
- Git
- macOS and Xcode additionally required for Safari

## Validation

From the repository root:

```bash
python3 build.py --check
```

Validation covers API contracts, field policies, folder logic, multi-step sign-in, HTTP Basic character encoding, options-page structure, and internationalization.

Run the i18n test separately with:

```bash
node tests/test-i18n-completeness.js
```

The test requires identical German and English key sets and detects known hard-coded German UI text outside the locale files.

## Reproducible build

```bash
python3 build.py
```

Outputs:

```text
dist/teampass-web-connector-chromium-1.0.0.zip
dist/teampass-web-connector-firefox-1.0.0.xpi
dist/chromium/
dist/firefox/
```

## Chromium and Microsoft Edge

For local testing, load `dist/chromium` through **Load unpacked** in `chrome://extensions` or `edge://extensions`. Refresh already open websites once after rebuilding the extension.

## Firefox

For development, open `about:debugging#/runtime/this-firefox` and load `dist/firefox/manifest.json` as a temporary add-on. Permanent public installation normally requires signing through Mozilla Add-ons.

## Safari on macOS

See [Build the Safari extension on macOS](safari.md). The Xcode project must be created, signed, and tested separately on macOS.

**Menu:** [Home](README.md) · [Installation](installation.md) · [Usage](user-guide.md) · [Build](build.md) · [Safari](safari.md) · [Technical](technical.md) · [Security](security.md) · [Troubleshooting](troubleshooting.md) · [Deutsch](../de/README.md)
