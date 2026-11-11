# Safari-Erweiterung unter macOS erstellen

**Menü:** [Start](README.md) · [Installation](installation.md) · [Anwendung](user-guide.md) · [Erstellen](build.md) · [Safari](safari.md) · [Technik](technical.md) · [Sicherheit](security.md) · [Fehlerbehebung](troubleshooting.md) · [English](../en/README.md)

---

> **Status:** Safari ist ein Portierungsziel. Version 1.0.0 wird primär für Chromium/Edge und Firefox gebaut. Die Safari-Ausgabe muss auf macOS mit Xcode erstellt, signiert und separat getestet werden.

## Voraussetzungen

- macOS mit aktueller, von Apple unterstützter Xcode-Version
- Xcode Command Line Tools
- Apple-ID; für Verteilung über App Store/TestFlight eine Mitgliedschaft im Apple Developer Program
- dieses Repository oder das Release-Paket `teampass-web-connector-safari-source-1.0.0.zip`

Prüfen:

```bash
xcode-select -p
xcodebuild -version
xcrun safari-web-extension-packager --help
```

Falls die Command Line Tools fehlen:

```bash
xcode-select --install
```

## Schnellweg mit dem enthaltenen Skript

```bash
git clone https://github.com/5iggi/teampass-web-connector.git
cd teampass-web-connector
python3 build.py
chmod +x tools/build_safari_macos.sh
./tools/build_safari_macos.sh
```

Das Skript:

1. prüft macOS, Xcode und den Chromium-WebExtension-Build,
2. führt `xcrun safari-web-extension-packager` aus,
3. erstellt unter `dist/safari-xcode/` ein Xcode-Projekt,
4. kopiert die WebExtension-Ressourcen, damit Änderungen am Chromium-Build das Safari-Projekt nicht unbemerkt verändern.

## Manueller Weg

```bash
python3 build.py
xcrun safari-web-extension-packager dist/chromium \
  --project-location dist/safari-xcode \
  --app-name "TeamPass Web Connector" \
  --bundle-identifier "io.github.5iggi.teampass-web-connector" \
  --swift \
  --macos-only \
  --copy-resources
```

Apple bezeichnete das Werkzeug früher als `safari-web-extension-converter`. Bei aktuellen Xcode-Versionen wird `safari-web-extension-packager` verwendet.

## Xcode konfigurieren

1. Das erzeugte `.xcodeproj` öffnen.
2. Unter **Signing & Capabilities** das eigene Team auswählen.
3. Prüfen, dass App und Extension eindeutige Bundle-Identifier besitzen.
4. macOS Deployment Target festlegen.
5. **Product → Build** ausführen.
6. Die erzeugte App starten.
7. Safari öffnen und unter **Safari → Einstellungen → Erweiterungen** aktivieren.
8. In Safari für die Erweiterung den Websitezugriff genehmigen.

## Testplan für Safari

Mindestens folgende Funktionen separat testen:

- TeamPass-Verbindung und Entsperren des lokalen Tresors
- Suche nach exakter URL, Origin und Hauptdomain
- klassischer Login mit Benutzername und Passwort
- zweistufige Anmeldung
- Shadow-DOM-/Web-Component-Felder
- Speichern und Aktualisieren eines Eintrags
- Ordnerauswahl und Ordnererstellung
- HTTP-Basic/.htaccess-Anmeldung
- Dark Mode und Deutsch/Englisch
- Sperren nach Browserneustart und Inaktivität

> `webRequest`, `webRequestAuthProvider`, Hintergrundprozesse und HTTP-Basic können sich in Safari anders verhalten als in Chromium und Firefox. Vor einer Freigabe sind echte Laufzeittests erforderlich.

## Verteilung

Für private Tests reicht ein lokal signierter Xcode-Build. Für eine öffentliche Verteilung sind Apple-Signierung, App Store Connect, App-Review und gegebenenfalls TestFlight erforderlich. Das Repository liefert bewusst kein fertiges oder signiertes `.app`-/`.pkg`-Paket.

## Aktualisieren des Safari-Projekts

Nach Änderungen zunächst den Chromium-Build neu erzeugen und das Projekt neu aufbauen:

```bash
python3 build.py
xcrun safari-web-extension-packager dist/chromium \
  --project-location dist/safari-xcode \
  --rebuild-project \
  --copy-resources
```

Wenn `--rebuild-project` mit der installierten Xcode-Version andere Parameter verlangt, zuerst `xcrun safari-web-extension-packager --help` prüfen.

---
**Menü:** [Start](README.md) · [Installation](installation.md) · [Anwendung](user-guide.md) · [Erstellen](build.md) · [Safari](safari.md) · [Technik](technical.md) · [Sicherheit](security.md) · [Fehlerbehebung](troubleshooting.md) · [English](../en/README.md)

---
