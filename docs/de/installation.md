# Installation

**Menü:** [Start](README.md) · [Installation](installation.md) · [Anwendung](user-guide.md) · [Erstellen](build.md) · [Safari](safari.md) · [Technik](technical.md) · [Sicherheit](security.md) · [Fehlerbehebung](troubleshooting.md) · [English](../en/README.md)

---

## Voraussetzungen
- Erreichbare TeamPass-Instanz über HTTPS.
- API-Zugriff, Benutzerkonto und passende Ordner-/Eintragsrechte.
- Aktueller Chromium-basierter Browser oder Firefox 109+.

## Chromium und Microsoft Edge, lokal
1. `python3 build.py` ausführen.
2. `chrome://extensions` bzw. `edge://extensions` öffnen.
3. Entwicklermodus aktivieren und **Entpackte Erweiterung laden** wählen.
4. Verzeichnis `dist/chromium` auswählen.

## Firefox, lokal
1. `python3 build.py` ausführen.
2. `about:debugging#/runtime/this-firefox` öffnen.
3. **Temporäres Add-on laden** wählen und `dist/firefox/manifest.json` öffnen.

## Ersteinrichtung
In den Erweiterungseinstellungen TeamPass-Basis-URL, Benutzer/API-Daten und Suchoptionen hinterlegen. Verbindung testen, Tresor-Passphrase setzen und anschließend mit einem Testkonto ohne kritische Rechte prüfen.

---
**Menü:** [Start](README.md) · [Installation](installation.md) · [Anwendung](user-guide.md) · [Erstellen](build.md) · [Safari](safari.md) · [Technik](technical.md) · [Sicherheit](security.md) · [Fehlerbehebung](troubleshooting.md) · [English](../en/README.md)

---
