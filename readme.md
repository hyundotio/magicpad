# EasyOPGP

EasyOPGP is an OpenPGP encryption / decryption tool for beginners. It is designed to be run standalone via the browser or as an executable (Electron).
![](demo.gif)

## Installation

You can run EasyOPGP three ways:
1. Run `main.html` via web browser
2. Build and run executable
```
npm install electron-packager -g
electron-packager ./ EasyOPGP --electronVersion=5.0.2 --platform=darwin --arch=x64
electron-packager ./ EasyOPGP --electronVersion=5.0.2 --platform=win32 --arch=x64
electron-packager ./ EasyOPGP --electronVersion=5.0.2 --platform=linux --arch=x64
```
3. Run Electron via Node from terminal
```
npm install
npm start
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
