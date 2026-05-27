// main.js
require('@electron/remote/main').initialize();

// Modules to control application life and create native browser window
const { app,BrowserWindow,ipcMain} = require('electron')
const path = require('path')

const os = require('os');


var shell = os.platform() === "win32" ? "powershell.exe" : "bash";

let mainWindow

let numberOfCorrectDevices = 0;






const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 2000,
    height: 1500,
    minWidth: 480,
    icon: __dirname + '/appicon.icns',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      devTools: true
     
    
    }
  })

  require("@electron/remote/main").enable(mainWindow.webContents);

  console.log('ok')
  global.NumberofDevices = {
    total: 0,
    devices: []
 }
 global.Usb = {
  selected: false,
  device_index: 0
}
  mainWindow.webContents.session.on('select-serial-port', (event, portList, webContents, callback) => {
    event.preventDefault()
    if (portList && portList.length > 0) {
      //get port info, create variable with information
      global.NumberofDevices.total = portList.length
      let devicesarray = [];
      for (let index = 0; index < portList.length; index++) {
        let portinfo = portList[index];
        let deviceobject = {
          'number_id' : index,
          'portName' : portinfo.portName,
          'displayName' : portinfo.displayName,
        }
        devicesarray.push(deviceobject);
      }
      global.NumberofDevices.devices = devicesarray
      
      if (portList.length == 1) {
        //one correct device, connect
        callback(portList[0].portId);
      }else{
        //correct device >= 2
        if(global.Usb.selected){
          //user selected usb port, connect to it
          callback(portList[global.Usb.device_index].portId);
        }else{
           //user hasn't selected a usb port, throw error in order to display dropdown
          callback('')
        }
        
      }      
    } 
    else {
       //no correct device, throw error
      global.NumberofDevices.total = 0
      global.NumberofDevices.devices = []
      callback('') //Could not find any matching devices
    }
  })


  // and load the index.html of the app.
  mainWindow.loadFile('index.html');
  console.log('when ready');

  mainWindow.webContents.openDevTools();
  
  mainWindow.on('close', (e) => {
    if (mainWindow) {
      
      mainWindow.webContents.send('app-close');
      console.log("sent")
    }
});
  
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.




app.whenReady().then(() => {
  createWindow()
  

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


ipcMain.on('closed',()=>{
 
  if (process.platform !== 'darwin') app.quit()
})

