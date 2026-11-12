# Technische Dokumentation

**Menü:** [Start](README.md) · [Installation](installation.md) · [Anwendung](user-guide.md) · [Erstellen](build.md) · [Safari](safari.md) · [Technik](technical.md) · [Sicherheit](security.md) · [Fehlerbehebung](troubleshooting.md) · [English](../en/README.md)

## Architektur

TeamPass Web Connector ist eine Manifest-V3-WebExtension. Popup und Einstellungsseite kommunizieren über Runtime-Nachrichten mit dem Background-Prozess. Der Background-Prozess verwaltet Konfiguration, Tresorzustand, API-Aufrufe, HTTP-Basic-Anfragen und Sitzungs-Caches. Das Content-Script erkennt Formularfelder und blendet die Seitendialoge ein.

## Internationalisierung

Alle benutzersichtbaren Texte gehören in:

```text
src/_locales/de/messages.json
src/_locales/en/messages.json
```

Englisch ist im Manifest als `default_locale` festgelegt. `src/i18n.js` stellt `tpI18n.t()` bereit und wendet `data-i18n` sowie `data-i18n-placeholder` auf statische HTML-Elemente an. Dynamische Dialoge verwenden ebenfalls ausschließlich Übersetzungsschlüssel.

Platzhalter werden über die WebExtension-i18n-API ersetzt, zum Beispiel:

```javascript
tpI18n.t('matches', count)
tpI18n.t('storageLocation', folderName)
tpI18n.t('errorPrefix', errorMessage)
```

Bei neuen UI-Texten müssen immer beide Sprachdateien aktualisiert werden. Benutzertexte dürfen nicht direkt deutsch oder englisch in JavaScript fest codiert werden.

## Lebenszyklus der Content-Scripts

Beim Aktualisieren oder Neuladen einer Erweiterung verliert ein bereits injiziertes Content-Script seinen Extension-Kontext. `content.js` erkennt diesen Zustand, beendet Timer und MutationObserver und entfernt eigene UI-Elemente. Der Tab muss anschließend neu geladen werden, damit das neue Content-Script aktiv wird.

Ein gesperrter Tresor ist ein regulärer Zustand. Automatische Speichervorgänge lesen nur nicht geheime Optionen aus `storage.local`; API-Zugriffe und der Speicherdialog werden erst nach dem Entsperren ausgeführt.

## Wichtige Dateien

| Datei | Aufgabe |
|---|---|
| `background-loader.js` | Chromium-Service-Worker-Loader |
| `background.js` | Runtime-Nachrichten, Tresor, Suche, Speicherung, HTTP-Basic und Sitzungsstatus |
| `teampass-api.js` | zentrale TeamPass-API-Endpunkte, Methoden, Payloads und Antwortnormalisierung |
| `content.js` | Formularerkennung, Autofill, Seitendialoge und Zugangsdaten-Erkennung |
| `field-policy.js` | zentrale Erkennungs- und Ausschlussregeln für Loginfelder |
| `i18n.js` | Laufzeitübersetzung und englischer Fallback |
| `_locales/*/messages.json` | deutsche und englische Übersetzungen |
| `popup.*` | Symbolleisten-Popup und Trefferauswahl |
| `options.*` | Einstellungen, Diagnose und API-Selbsttest |
| `network-auth.*` | HTTP-Basic-Auswahl, Entsperrung und manuelle Eingabe |
| `theme.css` | zentrale Designwerte und Farben |
| `style.css`, `network-auth.css` | strukturelles Layout mit Theme-Variablen |
| `tests/test-i18n-completeness.js` | Abgleich der Sprachschlüssel und Schutz vor bekannten fest codierten deutschen UI-Texten |

## Sicherheitsrelevante Speicherbereiche

- `storage.local`: nicht geheime Einstellungen und verschlüsselte Tresordaten.
- `storage.session`: entsperrte Sitzungsdaten, kurzlebige Treffer und Caches.
- API-Queue: nur Steuerdaten; keine Kennwörter, Tokens, JWTs oder Request-Payloads.

## Tests

Der vollständige lokale Prüfpfad lautet:

```bash
python3 build.py --check
```

Für die Internationalisierung kann der Test separat ausgeführt werden:

```bash
node tests/test-i18n-completeness.js
```

Erwartete Ausgabe:

```text
i18n completeness: PASS
```

**Menü:** [Start](README.md) · [Installation](installation.md) · [Anwendung](user-guide.md) · [Erstellen](build.md) · [Safari](safari.md) · [Technik](technical.md) · [Sicherheit](security.md) · [Fehlerbehebung](troubleshooting.md) · [English](../en/README.md)
