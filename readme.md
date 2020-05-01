# MagicPad v1.0.6

MagicPad is an OpenPGP encryption / decryption tool for beginners to handle text messages, files, as well as embed and extract encrypted messages from images. It is designed to be run standalone via the browser or as an executable (Electron).
Using PGP as the main encryption engine, the encryption key generated in MagicPad are powerful 4096-bit keys.

![](demo.gif)

## Why MagicPad...

1. No data collection. Can be used offline. Available as a Chrome offline app, mobile progressive web app, and executables (Windows x64, macOS x64, .deb x64, .rpm x64). No server-side interaction.
2. Create, upload, and search for PGP keys.
3. Easy to understand language. You want to read, write, or attach a file?
4. Mobile friendly (Progressive web app). Can be saved to home screen. Tested on Android and iOS.
5. Store keys as images as well as hide and reveal encrypted messages in images.

## Changelog
[Changelog link](https://github.com/hyundotio/magicpad/blob/master/changelog.md)

## Installation

You can run MagicPad four ways:
1. Download executable at `https://www.magicpad.io`
2. Clone and run `./app/index.html` via web browser
3. Clone, build and run executable (saved at `./dist`):
```
npm install
npm run dist
```
To only build html/css/js without running electron, run: `npm run buildwebapp`
If building from Ubuntu, run this first:
```
sudo apt-get install rpm
```
4. Run Electron via Node from command line (you need Electron globally installed):
```
npm i -g magicpad
npm i -g electron
magicpad
```

## Build explained

In the build procedure, the following happens:
1. HTML files in the `./html_src` folder are combined into a single `index.html` file in `./app`.
2. JS files in `./app/js` are added as `<script>` tags after `</body>` tag in `index.html`. (Step 1 and 2 are controlled by `./build_magicpad.index.js`)
3. `index.html` is saved to `./app`.
4. All other files are static in `./app` and are not altered.
5. Electron executable is created in a `./dist` folder.

## Authoring executables

1. You need all of the Apple Developer certificates from the Apple Developer Program.
2. Create a Mac App provision profile in the Apple Developer website, download it, and name it as `embedded.provisionprofile` and place it in root.
3. Edit your `~/.bash_profile.rc` i.e. `nano ~/.bash_profile.rc` to include these parameters:
```
export CSC_LINK=FULL_LOCATION_TO_YOUR_APPLE_DEV_P12_CERT
export CSC_KEY_PASSWORD=CERT_PASSWORD
export CSC_NAME="NAME_OF_YOUR_CERT"
export CSC_IDENTITY_AUTO_DISCOVERY=false
export CSC_KEYCHAIN=login
export appleId=YOUR_APPLE_ID
export appleIdPassword=YOUR_APPLE_ID_PASSWORD_OR_ONETIME_PASSWORD
```
then run `source ~/.bash_profile` to refresh.
4. Go to `./src/mac_build/entitlements.mas.plist` and replace application name to yours from Apple Developer website. You may have to replace the application name in `package.json` as well as the `appId` variable in `notarize.js`.
5. There is a bug in `electron-osx-sign` module and you need to go to `./node_modules/electron-osx-sign/sign.js` then comment out this block:
```
if (opts.platform === 'darwin' && opts['gatekeeper-assess'] !== false) {
  promise = promise
    .then(function () {
      debuglog('Verifying Gatekeeper acceptance for darwin platform...')
      return execFileAsync('spctl', [
        '--assess',
        '--type', 'execute',
        '--verbose',
        '--ignore-cache',
        '--no-cache',
        opts.app
      ])
    })
}
```

## PWA Config

If you want to host your own MagicPad PWA, you must edit the `"start_url"` property `manifest.json` file in `/src`

## Packages

Software used:
1. [Node.js](https://nodejs.org)
2. url, path, fs-extra, ncp, and jsdom packages
3. [Electron](https://electronjs.org/), [Electron Context Menu](https://github.com/sindresorhus/electron-context-menu), and [Electron builder](https://www.electron.build/)
4. [Openpgp.js](https://github.com/openpgpjs/openpgpjs)
5. [Steganography.js](https://github.com/petereigenschink/steganography.js/)
6. [jQuery](https://jquery.com/)
7. [Font and design styling by IBM](https://www.ibm.com/design/language/)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
