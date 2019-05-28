const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu} = require('electron');

let mainWindow;
let addWindow;

app.on('ready',function(){
  mainWindow = new BrowserWindow({
    'minHeight':620,
    'minWidth':604,
    'height':620,
    'width':604
  });
  mainWindow.setMenuBarVisibility(false)
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'main.html'),
    protocol:'file:',
    slashes: true
  }));
})
