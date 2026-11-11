<p align="center"><img src="src/icons/icon128.png" width="96" alt="TeamPass Web Connector icon"></p>

# TeamPass Web Connector

[![Version](https://img.shields.io/badge/version-1.0.0-2563eb)](VERSION) [![License](https://img.shields.io/badge/license-MPL--2.0-7c3aed)](LICENSE) [![Browsers](https://img.shields.io/badge/browsers-Chromium%20%7C%20Edge%20%7C%20Firefox-0f766e)](docs/README.md)

**Deutsch:** Browser-Erweiterung zur Verbindung von Webseiten mit einer selbst gehosteten TeamPass-Instanz. Sie sucht passende Einträge, füllt Anmeldedaten, unterstützt das Speichern und schützt lokale Geheimnisse mit einem sperrbaren Tresor.

**English:** Browser extension connecting websites to a self-hosted TeamPass instance. It finds matching entries, fills credentials, supports saving, and protects local secrets with a lockable vault.

## Deutsch

### Funktionen
- Chromium/Chrome, Microsoft Edge und Firefox aus einer gemeinsamen Codebasis
- TeamPass-Suche passend zur aktuellen Website
- Ausfüllen und Speichern von Zugangsdaten
- Ordner-, URL- und Feldregeln sowie mehrstufige Anmeldung
- Lokaler, automatisch sperrbarer Tresor
- Deutsch/Englisch, dunkles/helles Design und Netzwerk-Authentifizierung

### Schnellstart
```bash
python3 build.py --check
python3 build.py
```
Danach `dist/chromium` als entpackte Erweiterung laden oder `dist/firefox/manifest.json` über `about:debugging` öffnen. Vollständige Anleitung: [Deutsche Dokumentation](docs/de/README.md).

### Sicherheit
Nur mit HTTPS und einem dedizierten TeamPass-Konto mit minimalen Berechtigungen einsetzen. Niemals Kennwörter oder Tokens in Issues veröffentlichen. Siehe [Sicherheitsrichtlinie](SECURITY.md).

---

## English

### Features
- Chromium/Chrome, Microsoft Edge, and Firefox from one codebase
- TeamPass lookup matched to the current website
- Credential filling and saving
- Folder, URL, and field policies plus multi-step sign-in
- Local vault with automatic locking
- German/English UI, light/dark themes, and network authentication

### Quick start
```bash
python3 build.py --check
python3 build.py
```
Then load `dist/chromium` as an unpacked extension or open `dist/firefox/manifest.json` through `about:debugging`. Full guide: [English documentation](docs/en/README.md).

### Security
Use HTTPS and a dedicated least-privilege TeamPass account. Never publish passwords or tokens in issues. See the [security policy](SECURITY.md).

## Documentation / Dokumentation
- [Documentation entry / Doku-Einstieg](docs/README.md)
- [Build Chromium, Edge, Firefox and Safari](docs/en/build.md)
- [Technical architecture](docs/en/technical.md)
- [Technischer Aufbau](docs/de/technical.md)

## Project
Repository: https://github.com/5iggi/teampass-web-connector

Licensed under the [Mozilla Public License 2.0](LICENSE). TeamPass is a separate project; this repository does not imply endorsement or official affiliation.
