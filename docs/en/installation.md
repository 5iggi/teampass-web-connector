# Installation

**Menu:** [Home](README.md) · [Installation](installation.md) · [Usage](user-guide.md) · [Build](build.md) · [Safari](safari.md) · [Technical](technical.md) · [Security](security.md) · [Troubleshooting](troubleshooting.md) · [Deutsch](../de/README.md)

---

## Requirements
- A reachable TeamPass instance served over HTTPS.
- API access, a user account, and appropriate folder/item permissions.
- A current Chromium-based browser or Firefox 109+.

## Chromium and Microsoft Edge, local
1. Run `python3 build.py`.
2. Open `chrome://extensions` or `edge://extensions`.
3. Enable Developer mode and select **Load unpacked**.
4. Select `dist/chromium`.

## Firefox, local
1. Run `python3 build.py`.
2. Open `about:debugging#/runtime/this-firefox`.
3. Select **Load Temporary Add-on** and open `dist/firefox/manifest.json`.

## Initial configuration
Enter the TeamPass base URL, user/API details, and search options. Test the connection, set the vault passphrase, and verify the setup with a non-privileged test account.

---
**Menu:** [Home](README.md) · [Installation](installation.md) · [Usage](user-guide.md) · [Build](build.md) · [Safari](safari.md) · [Technical](technical.md) · [Security](security.md) · [Troubleshooting](troubleshooting.md) · [Deutsch](../de/README.md)

---
