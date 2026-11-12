# Funktionen und Anwendung

**Menü:** [Start](README.md) · [Installation](installation.md) · [Anwendung](user-guide.md) · [Erstellen](build.md) · [Safari](safari.md) · [Technik](technical.md) · [Sicherheit](security.md) · [Fehlerbehebung](troubleshooting.md) · [English](../en/README.md)

## Hauptfunktionen

- Passende TeamPass-Einträge anhand der aktuellen Website suchen.
- Exakte URL, gleichen Server oder optional die registrierbare Hauptdomain berücksichtigen.
- Benutzername und Passwort in klassische, dynamische und mehrstufige Anmeldeformulare einfügen.
- HTTP-Basic- und `.htaccess`-Anmeldungen über ein eigenes Auswahlfenster bedienen.
- Erkannte Zugangsdaten als neuen Eintrag speichern oder einen bestehenden Eintrag aktualisieren.
- Zielordner auswählen und bei Bedarf einen Unterordner erstellen.
- Lokalen Tresor sperren, entsperren und nach Inaktivität automatisch sperren.

## Sprache

Die Erweiterung verwendet bei deutscher Browsersprache die deutsche Oberfläche. Für alle anderen oder nicht unterstützten Browsersprachen wird Englisch als Fallback verwendet.

Die Sprache richtet sich nach den Spracheinstellungen von Microsoft Edge, Chromium/Chrome, Firefox beziehungsweise Safari. Dies gilt auch für dynamisch erzeugte Fenster wie:

- Entsperrdialog,
- Eintragsauswahl,
- **In TeamPass speichern?**,
- HTTP-Basic-Anmeldung,
- Status-, Diagnose- und Fehlermeldungen.

Nach einer Änderung der Browsersprache die Erweiterung neu laden und bereits geöffnete Webseiten einmal aktualisieren.

## Empfohlener Ablauf

1. Zielseite aufrufen.
2. Bei Bedarf den lokalen Tresor entsperren.
3. Das TeamPass-Schlüsselsymbol oder das Erweiterungssymbol öffnen.
4. Treffer und gespeicherte URL kontrollieren.
5. Gewünschten Eintrag auswählen und das Formular prüfen.
6. Erst danach anmelden oder die optionale automatische Übermittlung verwenden.

## Neue Zugangsdaten speichern

Nach einer erkannten Anmeldung erscheint das rote `!` am Erweiterungssymbol oder, falls aktiviert, automatisch der Speicherdialog.

Im Dialog:

1. Titel, Benutzername/E-Mail, Passwort und URL prüfen.
2. Vorhandene Treffer nur dann aktualisieren, wenn es derselbe Zugang ist.
3. Zielordner auswählen oder einen Unterordner erstellen.
4. **Hinzufügen** beziehungsweise **Aktualisieren** wählen.

Ein erkannter Entwurf bleibt erhalten, wenn der Tresor gesperrt ist. Der Speicherdialog wird erst nach dem Entsperren geöffnet.

## Erweiterung aktualisieren oder neu laden

Nach dem Neuladen einer lokal installierten Erweiterung laufen in bereits geöffneten Tabs zunächst noch die alten Content-Scripts. Die Erweiterung beendet diese kontrolliert. Damit die neue Version aktiv wird, die betroffenen Webseiten einmal mit `Strg+F5` beziehungsweise durch erneutes Laden aktualisieren.

Bereits angezeigte Einträge unter **Fehler** in `edge://extensions` oder `chrome://extensions` bleiben als Historie sichtbar, bis sie dort gelöscht werden.

## Grenzen

Komplexe Single-Page-Apps, geschlossene Shadow DOMs, Passkeys, CAPTCHA und herstellerspezifische Formulare können zusätzliche Anpassungen benötigen. Die Erweiterung umgeht keine MFA-, CAPTCHA-, Passkey- oder Browser-Sicherheitsmechanismen.

**Menü:** [Start](README.md) · [Installation](installation.md) · [Anwendung](user-guide.md) · [Erstellen](build.md) · [Safari](safari.md) · [Technik](technical.md) · [Sicherheit](security.md) · [Fehlerbehebung](troubleshooting.md) · [English](../en/README.md)
