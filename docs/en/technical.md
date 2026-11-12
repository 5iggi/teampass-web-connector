# Technical documentation

**Menu:** [Home](README.md) · [Installation](installation.md) · [Usage](user-guide.md) · [Build](build.md) · [Safari](safari.md) · [Technical](technical.md) · [Security](security.md) · [Troubleshooting](troubleshooting.md) · [Deutsch](../de/README.md)

## Architecture

TeamPass Web Connector is a Manifest V3 WebExtension. The popup and options page communicate with the background process through runtime messages. The background process owns configuration, vault state, API calls, HTTP Basic requests, and session caches. The content script discovers form fields and renders page-level dialogs.

## Internationalization

All user-visible text belongs in:

```text
src/_locales/de/messages.json
src/_locales/en/messages.json
```

English is defined as `default_locale` in the manifests. `src/i18n.js` provides `tpI18n.t()` and applies `data-i18n` and `data-i18n-placeholder` to static HTML elements. Dynamically generated dialogs also use translation keys exclusively.

Placeholders are resolved through the WebExtension i18n API, for example:

```javascript
tpI18n.t('matches', count)
tpI18n.t('storageLocation', folderName)
tpI18n.t('errorPrefix', errorMessage)
```

When adding UI text, update both locale files. User-visible German or English strings must not be hard-coded directly in JavaScript.

## Content-script lifecycle

When an extension is updated or reloaded, an already injected content script loses its extension context. `content.js` detects this state, stops timers and MutationObservers, and removes its UI elements. Refresh the tab afterwards so the new content script can be injected.

A locked vault is a normal operating state. Automatic save handling reads only non-secret options from `storage.local`; API access and the save dialog are deferred until the vault is unlocked.

## Key files

| File | Responsibility |
|---|---|
| `background-loader.js` | Chromium service-worker loader |
| `background.js` | runtime messaging, vault, lookup, saving, HTTP Basic, and session state |
| `teampass-api.js` | centralized TeamPass endpoints, methods, payloads, and response normalization |
| `content.js` | form discovery, autofill, page dialogs, and credential detection |
| `field-policy.js` | centralized sign-in field signatures and exclusion rules |
| `i18n.js` | runtime localization and English fallback |
| `_locales/*/messages.json` | German and English translations |
| `popup.*` | toolbar popup and entry selection |
| `options.*` | settings, diagnostics, and API self-test |
| `network-auth.*` | HTTP Basic selection, unlock, and manual input |
| `theme.css` | centralized design tokens and colors |
| `style.css`, `network-auth.css` | structural layout using theme variables |
| `tests/test-i18n-completeness.js` | locale-key parity and prevention of known hard-coded German UI text |

## Security-sensitive storage

- `storage.local`: non-secret settings and encrypted vault data.
- `storage.session`: unlocked session data, short-lived matches, and caches.
- API queue: control metadata only; never passwords, tokens, JWTs, or request payloads.

## Tests

Run the complete local validation with:

```bash
python3 build.py --check
```

Run the localization test separately with:

```bash
node tests/test-i18n-completeness.js
```

Expected output:

```text
i18n completeness: PASS
```

**Menu:** [Home](README.md) · [Installation](installation.md) · [Usage](user-guide.md) · [Build](build.md) · [Safari](safari.md) · [Technical](technical.md) · [Security](security.md) · [Troubleshooting](troubleshooting.md) · [Deutsch](../de/README.md)
