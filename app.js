const url = require('url');
const path = require('path');
const {app, BrowserWindow, Menu} = require('electron');
const contextMenu = require('electron-context-menu');

let mainWindow;
contextMenu({
    prepend: (defaultActions, params, browserWindow) => []
});

app.allowRendererProcessReuse = true;

app.on('ready',function(){
  mainWindow = new BrowserWindow({
    minHeight:594,
    minWidth:660,
    height:594,
    width:660,
    'backgroundColor': '#FFFFFF',
    title:'MagicPad',
    icon: __dirname +  '/src/icons_src/icons/appicon.icns'
  });
  mainWindow.setMenuBarVisibility(false)
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname,'/app/index.html'),
    protocol:'file:',
    slashes: true
  }));
})
