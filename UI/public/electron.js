const path = require('path')
const fs = require('fs');
const log = require('electron-log');

const printer = require('./printer.js');
//remoteMain.initialize();

const { app, BrowserWindow, protocol, ipcMain, dialog } = require('electron');
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
   //win.loadFile("index.html");
  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, './index.html')}`
  );
  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  //remoteMain.enable(win.webContents)
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
      log.info('darwin');
      return path.join(process.env.HOME, 'PDV', 'img');
    }
    case 'win32': {
      log.info('win32');
      return path.join(process.env.APPDATA, 'PDV', 'img');
    }
    case 'linux': {
      log.info('linux');
      return path.join(process.env.HOME, 'PDV', 'img');
    }
  }
}

ipcMain.handle("showDialog", async () => {
  log.info('showDialog called');
  const result = await dialog.showOpenDialog(
    { 
      filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif', 'jpeg', 'webp'] }],
      properties: ['openFile'] 
    });

    if(!result.canceled){
      let file = result.filePaths[0];
      log.info('File: ' + file);

      let fileName = path.basename(file);
      log.info('fileName: ' + fileName);

      copyFileSync(file);

      return fileName;
  }
});

/*ipcMain.handle("print-bill", async (event, arg) => {
  await printer.print(arg);
});*/

function copyFileSync(src){
  let fileName = path.basename(src);
  log.info('file name: '+fileName);
  let destFile = path.join(getPath(), fileName)

  log.info('file destination: ' + destFile);

  if(!fs.existsSync(destFile)){
    fs.mkdirSync(getPath(), { recursive: true });
    log.info('path created');
  }

  fs.copyFileSync(src, destFile, fs.constants.COPYFILE_FICLONE);
}