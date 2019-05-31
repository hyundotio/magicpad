const url = require('url');
const path = require('path');
const {app, BrowserWindow, Menu} = require('electron');

let mainWindow;

app.on('ready',function(){

  mainWindow = new BrowserWindow({
    minHeight:578,
    minWidth:640,
    height:578,
    width:640,
    'backgroundColor': '#FFFFFF',
    title:'MagicPad',
    icon: __dirname +  '/icons/appicon.icns'
  });
  mainWindow.setMenuBarVisibility(false)
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'main.html'),
    protocol:'file:',
    slashes: true
  }));
})
