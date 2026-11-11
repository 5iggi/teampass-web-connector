# Erweiterungen aus den Quellen erstellen

**Menü:** [Start](README.md) · [Installation](installation.md) · [Anwendung](user-guide.md) · [Erstellen](build.md) · [Safari](safari.md) · [Technik](technical.md) · [Sicherheit](security.md) · [Fehlerbehebung](troubleshooting.md) · [English](../en/README.md)

---

## Reproduzierbarer Build
Voraussetzung: Python 3.10+ und Node.js 18+. Im Repository-Stamm:

```bash
python3 build.py --check
python3 build.py
```

Ergebnisse: `dist/teampass-web-connector-chromium-1.0.0.zip`, `dist/teampass-web-connector-firefox-1.0.0.xpi` und entpackte Verzeichnisse für lokale Tests.

## Chromium/Edge
Das ZIP enthält `manifest.chromium.json` als `manifest.json` plus `src/`. Für Store-Uploads das ZIP verwenden; für lokale Tests `dist/chromium` laden.

## Firefox
Das XPI ist technisch ein ZIP mit Firefox-Manifest. Eine dauerhafte Installation erfordert normalerweise eine Signatur über Mozilla Add-ons; für Entwicklung `about:debugging` verwenden.

## Safari unter macOS
1. Zuerst den Chromium-Build erzeugen.
2. Xcode auf dem Mac installieren.
3. Ausführen:
```bash
xcrun safari-web-extension-packager dist/chromium \
  --project-location safari-build \
  --app-name "TeamPass Web Connector" \
  --bundle-identifier "io.github.5iggi.teampass-web-connector" \
  --swift --macos-only --copy-resources
```
4. Projekt in Xcode öffnen, Signing Team auswählen, bauen und in Safari unter **Einstellungen → Erweiterungen** aktivieren.

Safari ist ein optionales Portierungsziel. Netzwerk-Authentifizierung, Berechtigungen und alle Kernabläufe müssen auf einem Mac separat getestet werden; ein automatisch signierbares Safari-Paket kann außerhalb von Xcode/Apple Developer nicht erzeugt werden.

---
**Menü:** [Start](README.md) · [Installation](installation.md) · [Anwendung](user-guide.md) · [Erstellen](build.md) · [Safari](safari.md) · [Technik](technical.md) · [Sicherheit](security.md) · [Fehlerbehebung](troubleshooting.md) · [English](../en/README.md)

---
