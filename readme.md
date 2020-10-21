# MagicPad v1.0.7

MagicPad is an OpenPGP encryption / decryption tool for beginners to handle text messages, files, as well as embed and extract encrypted messages from images. It is designed to be run standalone via the browser.
Using PGP as the main encryption engine, the encryption key generated in MagicPad are powerful 4096-bit keys.

![](demo.gif)

## Why MagicPad...

1. No data collection. Can be used offline. Available as a Chrome offline app, and mobile progressive web app. No server-side interaction.
2. Create, upload, and search for PGP keys.
3. Easy to understand language. You want to read, write, or attach a file?
4. Mobile friendly PWA (progressive web app). Can be saved to home screen. Tested on Android and iOS.
5. Store keys as images as well as hide and reveal encrypted messages in images.

## Changelog
[Changelog link](https://github.com/hyundotio/magicpad/blob/master/changelog.md)

## Installation

You can run / build MagicPad several ways:
1. Run it online, or as a PWA, or offline Chrome app on `https://www.magicpad.io`
2. Clone and run `./app/index.html` via web browser
3. Clone, build, and run via web browser
```
npm install
npm run dist
```

## Build explained

In the build procedure, the following happens:
1. HTML files in the `./html_src` folder are combined into a single `index.html` file in `./app`.
2. JS files in `./app/js` are added as `<script>` tags after `</body>` tag in `index.html`. (Step 1 and 2 are controlled by `./build_magicpad.index.js`)
3. `index.html` is saved to `./app`.
4. All other files are static in `./app` and are not altered.

## PWA Config

If you want to host your own MagicPad PWA, you must edit the `"start_url"` property `manifest.json` file in `/src`

## Packages

Software used:
1. [Node.js](https://nodejs.org)
2. url, path, fs-extra, ncp, and jsdom packages
4. [Openpgp.js](https://github.com/openpgpjs/openpgpjs)
5. [Steganography.js](https://github.com/petereigenschink/steganography.js/)
6. [jQuery](https://jquery.com/)
7. [Font and design styling by IBM](https://www.ibm.com/design/language/)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
