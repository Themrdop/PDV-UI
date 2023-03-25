const path = require('path')
const fs = require('fs');

const remoteMain = require('@electron/remote/main');
remoteMain.initialize();

const { app, BrowserWindow, protocol, ipcMain, ipcRenderer } = require('electron');
const isDev = require('electron-is-dev');

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    fullscreen: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule:true,
      contextIsolation: false,
    },
  });

  // and load the index.html of the app.
  // win.loadFile("index.html");
  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );
  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  remoteMain.enable(win.webContents)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
//app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bars to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {

  createWindow();
  // Create custom protocol for local media loading
  protocol.registerFileProtocol("media-loader", (request, callback) => {

    const filePath = request.url.replace("media-loader:/", getPath());

    try {
      return callback(filePath);
    } catch (err) {
      console.error(err);
      console.log("Error loading media file: " + filePath);
      return callback(404);
    }
  });
});

function getPath(){

  switch(process.platform) {
    case 'darwin': {
      return path.join(process.env.HOME, 'appName', 'img');
    }
    case 'win32': {
      return path.join(process.env.APPDATA, 'appName', 'img');
    }
    case 'linux': {
      return path.join(process.env.APPDATA, 'appName', 'img');
    }
  }
}

ipcMain.on('open-file-dialog', (event, arg) => {
    let fileName = path.basename(arg.src);
    let destFile = path.join(getPath(), fileName)

    if(!fs.existsSync(destFile)){
      fs.mkdirSync(getPath(), { recursive: true });
    }

    fs.copyFileSync(arg.src, destFile, fs.constants.COPYFILE_EXCL);
});