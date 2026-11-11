# Technical documentation

**Menu:** [Home](README.md) · [Installation](installation.md) · [Usage](user-guide.md) · [Build](build.md) · [Safari](safari.md) · [Technical](technical.md) · [Security](security.md) · [Troubleshooting](troubleshooting.md) · [Deutsch](../de/README.md)

---

## Architecture
The extension is a Manifest V3 WebExtension. Popup and options pages send messages to the background process. The background process owns configuration and vault state, calls TeamPass through `teampass-api.js`, and communicates with the active page content script. Separate manifests and the `browser`/`chrome` abstraction handle browser differences.

## Files
| File | Responsibility |
|---|---|
| `background-loader.js` | Chromium service-worker loader |
| `background.js` | central message, session, vault, search, save and network-auth orchestration |
| `teampass-api.js` | TeamPass HTTP/API adapter and response normalization |
| `content.js` | page-side login-field discovery, fill and credential detection |
| `field-policy.js` | field classification and allow/deny policy |
| `i18n.js` | runtime German/English strings |
| `popup.html / popup.js` | toolbar user interface and entry selection |
| `options.html / options.js` | configuration, connection test, import/export and policies |
| `network-auth.*` | HTTP authentication prompt |
| `theme.css / style.css` | shared and popup presentation |
| `icons/` | extension icons |

## Data flow
1. `content.js` detects the page and fields.
2. `popup.js` asks the background process for matching items.
3. `background.js` checks vault/session state and calls `teampass-api.js`.
4. Results are normalized and displayed in the popup.
5. After selection, the background process sends only the required record to the active tab.

## Manifests
`manifest.chromium.json` uses a service worker. `manifest.firefox.json` uses background scripts and carries the Gecko ID. The build copies each one as `manifest.json` into a separate target directory.

## Permissions
`storage` stores settings and encrypted local data; `tabs`, `activeTab`, and `scripting` coordinate the active tab; `webRequest` and `webRequestAuthProvider` support network authentication; `alarms` provides timed locking. Host permissions are broad because arbitrary target sites and self-hosted TeamPass URLs are supported. Store submissions should explicitly justify this design.

## Tests
Node tests in `tests/` cover the API layer, field rules, folder logic, and multi-step login. Python checks validate options and source structure. `python3 build.py --check` runs checks without packaging.

---
**Menu:** [Home](README.md) · [Installation](installation.md) · [Usage](user-guide.md) · [Build](build.md) · [Safari](safari.md) · [Technical](technical.md) · [Security](security.md) · [Troubleshooting](troubleshooting.md) · [Deutsch](../de/README.md)

---
