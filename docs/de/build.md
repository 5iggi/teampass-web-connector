# Erweiterungen aus den Quellen erstellen

**Menü:** [Start](README.md) · [Installation](installation.md) · [Anwendung](user-guide.md) · [Erstellen](build.md) · [Safari](safari.md) · [Technik](technical.md) · [Sicherheit](security.md) · [Fehlerbehebung](troubleshooting.md) · [English](../en/README.md)

## Voraussetzungen

- Python 3.10 oder neuer
- Node.js 18 oder neuer
- Git
- für Safari zusätzlich macOS und Xcode

## Prüfungen

Im Repository-Stamm:

```bash
python3 build.py --check
```

Die Prüfung umfasst API-Verträge, Feldregeln, Ordnerlogik, zweistufige Anmeldung, HTTP-Basic-Zeichenkodierung, Optionsseite und Internationalisierung.

Der i18n-Test kann separat gestartet werden:

```bash
node tests/test-i18n-completeness.js
```

Der Test verlangt identische Schlüssel in Deutsch und Englisch und erkennt bekannte fest codierte deutsche UI-Texte außerhalb der Sprachdateien.

## Reproduzierbarer Build

```bash
python3 build.py
```

Ergebnisse:

```text
dist/teampass-web-connector-chromium-1.0.0.zip
dist/teampass-web-connector-firefox-1.0.0.xpi
dist/chromium/
dist/firefox/
```

## Chromium und Microsoft Edge

Für lokale Tests `dist/chromium` unter `chrome://extensions` beziehungsweise `edge://extensions` mit **Entpackte Erweiterung laden** auswählen. Nach einem Neuaufbau bereits geöffnete Webseiten einmal aktualisieren.

## Firefox

Für Entwicklung `about:debugging#/runtime/this-firefox` öffnen und `dist/firefox/manifest.json` als temporäres Add-on laden. Eine dauerhafte öffentliche Installation erfordert normalerweise eine Signatur über Mozilla Add-ons.

## Safari unter macOS

Die vollständige Anleitung steht unter [Safari-Erweiterung unter macOS erstellen](safari.md). Das Xcode-Projekt muss auf macOS erstellt, signiert und separat getestet werden.

**Menü:** [Start](README.md) · [Installation](installation.md) · [Anwendung](user-guide.md) · [Erstellen](build.md) · [Safari](safari.md) · [Technik](technical.md) · [Sicherheit](security.md) · [Fehlerbehebung](troubleshooting.md) · [English](../en/README.md)
