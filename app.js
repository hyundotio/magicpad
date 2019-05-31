const url = require('url');
const path = require('path');
const {app, BrowserWindow, Menu} = require('electron');

let mainWindow;

app.on('ready',function(){

  mainWindow = new BrowserWindow({
    minHeight:594,
    minWidth:660,
    height:594,
    width:660,
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
