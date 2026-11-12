# Features and usage

**Menu:** [Home](README.md) · [Installation](installation.md) · [Usage](user-guide.md) · [Build](build.md) · [Safari](safari.md) · [Technical](technical.md) · [Security](security.md) · [Troubleshooting](troubleshooting.md) · [Deutsch](../de/README.md)

## Main features

- Find matching TeamPass entries for the current website.
- Match the exact URL, the same server, or optionally the registrable main domain.
- Fill usernames and passwords in standard, dynamic, and multi-step sign-in forms.
- Handle HTTP Basic and `.htaccess` authentication through a dedicated selection window.
- Save detected credentials as a new item or update an existing item.
- Select a target folder and create a subfolder when required.
- Lock, unlock, and automatically lock the local vault after inactivity.

## Language

The extension uses German when the browser language is German. English is the fallback for all other or unsupported browser languages.

The language is determined by the language settings of Microsoft Edge, Chromium/Chrome, Firefox, or Safari. This includes dynamically generated interfaces such as:

- unlock dialog,
- entry chooser,
- **Save in TeamPass?**,
- HTTP Basic authentication,
- status, diagnostic, and error messages.

After changing the browser language, reload the extension and refresh already open websites once.

## Recommended workflow

1. Open the target website.
2. Unlock the local vault when required.
3. Open the TeamPass key icon or the extension toolbar icon.
4. Verify the matching entry and stored URL.
5. Select the entry and review the filled form.
6. Then sign in or use the optional automatic submission feature.

## Saving new credentials

After a detected sign-in, a red `!` appears on the extension icon or, when enabled, the save dialog opens automatically.

In the dialog:

1. Verify title, username/email, password, and URL.
2. Update an existing match only when it represents the same account.
3. Select the target folder or create a subfolder.
4. Choose **Add** or **Update**.

A detected draft remains available while the vault is locked. The save dialog opens only after the vault is unlocked.

## Updating or reloading the extension

After reloading a locally installed extension, already open tabs initially retain the old content script. The extension now shuts that script down cleanly. Refresh those pages once so the new version can be injected.

Existing entries under **Errors** in `edge://extensions` or `chrome://extensions` remain as history until manually cleared.

## Limitations

Complex single-page applications, closed Shadow DOMs, passkeys, CAPTCHA, and vendor-specific forms may require additional support. The extension does not bypass MFA, CAPTCHA, passkey, or browser security controls.

**Menu:** [Home](README.md) · [Installation](installation.md) · [Usage](user-guide.md) · [Build](build.md) · [Safari](safari.md) · [Technical](technical.md) · [Security](security.md) · [Troubleshooting](troubleshooting.md) · [Deutsch](../de/README.md)
