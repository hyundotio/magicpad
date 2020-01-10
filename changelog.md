# Changelog

All notable changes to this project will be documented in this file.

## [1.0.3 Hotfix 2C] - 2020-01-09

### Changed (Effects only web versions)
- Fixed a bug when posting to MagicPost from "Write" page.

## [1.0.3 Hotfix 2B] - 2020-01-09

### Changed (Effects only web versions)
- Added the ability to import from MagicPost to MagicPad in the "Read" page.

## [1.0.3 Hotfix 2A] - 2020-01-09

### Changed (Effects only web versions)
- Fixed a bug where changing iOS orientation will not follow the device's width and height.

## [1.0.3 Hotfix 2] - 2019-12-16

### Changed
- Updated logos and icons
- Fixed a bug where key converter will only use public key reference image.

## [1.0.3 Hotfix 1] - 2019-12-15

### Changed
- Ability to search for messages in MagicPost in "Read" section by private key (your) fingerprint. Goes to homepage if no private key is imported.

## [1.0.3] - 2019-12-15

### Changed
- Added "Paste new key" under Key server browser. The user now can bring a newly generated public key directly into the text field for upload. This removes an additional click or two. Did not implement paste from clipboard for potential privacy issues rather import from session object that contains newly generated key.
- Version 1.0.3 first release. Hotfixes 1.0.2 (security and UX) constitute a new version.

## [1.0.2 Hotfix 10] - 2019-12-13

### Changed
- Security update: Remove unused session data when quitting.

## [1.0.2 Hotfix 9] - 2019-12-11

### Changed
- Background color changed for checkbox area in key generation popup.

## [1.0.2 Hotfix 8] - 2019-12-11

### Changed
- Updated how session model for saved sessions is handle.

## [1.0.2 Hotfix 7] - 2019-12-11

### Changed
- Every file (such as keys, messages, attachments) are deleted when new versions are generated. (Ex: Generate key, reset form <- Original key is removed not just from session but from memory).
- iOS fix for downloading steg key from server browser.
- Ability to import private key from key generator popup at the same time when downloading.

## [1.0.2 Hotfix 5-6] - 2019-11-26

### Changed
- Added Hotfix version on About page.

## [1.0.2 Hotfix 2-4] - 2019-11-26

### Added
- Bug fixed where "Import Key" in Key Search popup did not disable when searched key was parsing.
- Added link to Changelog in About tab page.

### Changed
- File name for converted keys and searched keys are gone through an empty string check in-case user's name field for key is empty.

## [1.0.2 Hotfix 1] - 2019-11-25

### Added

- Added a minor feature. When a user creates an encrypted message, the "Post message to MagicPost anonymously" link contains the encrypted message, user and recipient's fingerprint for single-click submission in MagicPost.
- File names for converted keys and searched keys are named after the key owner's names.

### Removed

- Links to Firefox and Chrome extension as they need to be extensively reworked.

## [1.0.2] - 2019-11-25

### Added

- Added ability for the user to directly import a searched key to the session without downloading.
- Added ability for the user to convert keys both ways. .asc to .png and .png to .asc

## [1.0.1 Hotfix 15] - 2019-11-30

### Changed

- Changed a visual bug in key search popup.

## [1.0.1 Hotfix 11-14] - 2019-11-24

### Added

- Ability to browse various keys per user added in "Key server browser" feature.

## [1.0.1 Hotfix 10] - 2019-11-22

### Added

- Added "keys.magicpad.io" as primary key server.

## [1.0.1 Hotfix 3-9] - 2019-11-18

### Changed

- Fixed visual bugs in desktop sized view.
- Fixed visual bugs in mobile sized view.

## [1.0.1 Hotfix 1-3] - 2019-11-17

### Changed

- Bug fixed in Attachments section.
- Bug fixed related to checkbox behavior in persistent session and attachments.

## [1.0.1] - 2019-11-17

### Added

- Added ability to have persistent sessions.

## [1.0.0 Hotfix 1-2] - 2019-11-16

### Changed

- Cleaned up guide.
- Cleaned up code.

## [1.0.0] - 2019-11-16

### Added

- MagicPost links integrated.

### Changed

- Minor security vulnerability patched for links.
- Accessibility enhancements.
- Optimized steganography functions.
- Optimized build process.
- Changed from using URIs to BLOBs.
- Progressive web app "certified" using Google Chrome lighthouse.
- Viewport scaling fixed.
- Icons displaying correctly in major device platforms.
