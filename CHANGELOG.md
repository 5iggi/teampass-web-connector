# Changelog

## 1.0.0

### Added

- First public release of TeamPass Web Connector.
- Chromium/Microsoft Edge and Firefox packages from one source tree.
- German and English user, build, troubleshooting, security, privacy, and technical documentation.
- Repository link in extension metadata and user interfaces.
- MPL-2.0 license and GitHub community files.
- Automated localization completeness test for German and English UI text.

### Fixed

- Completed German and English localization of dynamically generated dialogs.
- Fixed mixed German/English text in the **Save in TeamPass?** dialog.
- Localized runtime messages in the popup, options page, unlock dialog, entry chooser, save dialog, and HTTP Basic window.
- Fixed named, numeric, nested HTML entities and common UTF-8/Windows-1252 mojibake in HTTP Basic entry titles and related fields.
- Prevented stale content scripts from reporting unhandled `Extension context invalidated` errors after an extension update or reload.
- Prevented an unhandled locked-vault error while automatically reopening detected credentials.
