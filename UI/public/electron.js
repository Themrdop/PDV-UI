const path = require('path')
const fs = require('fs');
const {PosPrinter} = require("electron-pos-printer");

//const remoteMain = require('@electron/remote/main');
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

ipcMain.handle("showDialog", async () => {
    const result = await dialog.showOpenDialog(
      { 
        filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif'] }],
        properties: ['openFile'] 
      });

      if(!result.canceled){
        let file = result.filePaths[0];

        let fileName = path.basename(file);

        copyFileSync(file);

        return fileName;
    }
});

const data = [
  {
    type: 'table',
    // style the table
    style: {border: '0px solid #ddd'},
    // multi dimensional array depicting the rows and columns of the table body
    tableBody: [],
    // custom style for the table header
    tableHeaderStyle: { backgroundColor: 'white', color: '#000'},
    // custom style for the table body
    tableBodyStyle: {'border': '0px solid #ddd'},
    // custom style for the table footer
    tableFooterStyle: {backgroundColor: '#000', color: 'white'},
  }
]

const options = {
  preview: true,
  margin: '0 0 0 0',    
  copies: 1,
  printerName: 'XP-80C',
  timeOutPerLine: 400,
  pageSize: '80mm' // page size
}

ipcMain.handle("print-bill", async (event, arg) => {
  data.unshift({
    type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
    value: arg.commers.address,
    style: {fontWeight: "700", textAlign: 'center', fontSize: "24px"}
  });

  data.unshift({
    type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
    value: arg.commers.email,
    style: {fontWeight: "700", textAlign: 'center', fontSize: "24px"}
  });

  data.unshift({
    type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
    value: arg.commers.phone,
    style: {fontWeight: "700", textAlign: 'center', fontSize: "24px"}
  });

  data.unshift({
    type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
    value: arg.commers.cedula,
    style: {fontWeight: "700", textAlign: 'center', fontSize: "24px"}
  });

  data.unshift({
    type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
    value: arg.commers.name,
    style: {fontWeight: "700", textAlign: 'center', fontSize: "24px"}
  });

 console.log(data);
  arg.products.map(p => {
    data[5].tableBody.push([p.name, p.amount, p.price, p.price * p.amount]);
  });

  try {
    await PosPrinter.print(data, options)
  } catch (error) {
    console.error(error);
  }
  
});

function copyFileSync(src){
  let fileName = path.basename(src);
    let destFile = path.join(getPath(), fileName)

    if(!fs.existsSync(destFile)){
      fs.mkdirSync(getPath(), { recursive: true });
    }

    fs.copyFileSync(src, destFile, fs.constants.COPYFILE_EXCL);
}