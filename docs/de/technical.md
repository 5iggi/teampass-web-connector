# Technische Dokumentation

**Menü:** [Start](README.md) · [Installation](installation.md) · [Anwendung](user-guide.md) · [Erstellen](build.md) · [Safari](safari.md) · [Technik](technical.md) · [Sicherheit](security.md) · [Fehlerbehebung](troubleshooting.md) · [English](../en/README.md)

---

## Architektur
Die Erweiterung ist eine WebExtension mit Manifest V3. Popup und Optionsseite senden Nachrichten an den Hintergrundprozess. Der Hintergrundprozess hält Konfiguration und Tresorzustand, spricht über `teampass-api.js` mit TeamPass und kommuniziert mit dem Content Script der aktiven Seite. Browserunterschiede werden über getrennte Manifeste und die `browser`/`chrome`-Abstraktion behandelt.

## Dateien
| Datei | Aufgabe |
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

## Datenfluss
1. `content.js` erkennt Seite und Felder.
2. `popup.js` fordert passende Einträge beim Hintergrundprozess an.
3. `background.js` prüft Tresor/Session und ruft `teampass-api.js` auf.
4. Ergebnisse werden normalisiert und im Popup angezeigt.
5. Nach Auswahl sendet der Hintergrundprozess nur den benötigten Datensatz an den aktiven Tab.

## Manifeste
`manifest.chromium.json` nutzt einen Service Worker. `manifest.firefox.json` nutzt Hintergrundskripte und enthält die Gecko-ID. Beide werden beim Build als `manifest.json` in getrennte Zielordner kopiert.

## Berechtigungen
`storage` speichert Einstellungen und verschlüsselte lokale Daten; `tabs`, `activeTab` und `scripting` koordinieren den aktiven Tab; `webRequest` und `webRequestAuthProvider` dienen der Netzwerkanmeldung; `alarms` der zeitgesteuerten Sperre. Die Host-Berechtigungen sind breit, weil beliebige Zielseiten und selbst gehostete TeamPass-URLs unterstützt werden. Für Store-Veröffentlichungen sollte diese Entscheidung ausdrücklich begründet werden.

## Tests
Node-Tests in `tests/` prüfen API-Schicht, Feldregeln, Ordnerlogik und mehrstufige Anmeldung. Python-Prüfungen validieren Optionen und Quellstruktur. `python3 build.py --check` führt alle Prüfungen ohne Paketbau aus.

---
**Menü:** [Start](README.md) · [Installation](installation.md) · [Anwendung](user-guide.md) · [Erstellen](build.md) · [Safari](safari.md) · [Technik](technical.md) · [Sicherheit](security.md) · [Fehlerbehebung](troubleshooting.md) · [English](../en/README.md)

---
