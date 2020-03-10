const {app, BrowserWindow} = require('electron');

function createWindow() {
    let win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences : {
            nodeIntegration: true
        }
    });
    win.webContents.openDevTools();

    win.loadFile('index.html');
}

app.whenReady().then(createWindow);

