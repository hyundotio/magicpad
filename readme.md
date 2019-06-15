# MagicPad v0.0.2

MagicPad is an OpenPGP encryption / decryption tool for beginners. It is designed to be run standalone via the browser or as an executable (Electron).

![](demo.gif)

## Installation

You can run MagicPad four ways:
1. Download executable at `https://www.magicpad.io`
2. Run `./app/index.html` via web browser
3. Build and run executable (saved at ./dist/):
```
npm i magicpad
npm install
npm run dist
```
If building from Ubuntu, run this first:
```
sudo apt-get install rpm
```
4. Run Electron via Node from command line:
```
npm i magicpad
npm install
npm start
```

## Packages

Software used:
1. Node.js
2. url, path, fs-extra, and jsdom packages
3. Electron, Electron Context Menu, and Electron builder
4. Openpgp.js
5. Steganography.js
6. jQuery
7. Font and design styling by IBM

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
