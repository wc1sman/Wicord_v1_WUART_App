import * as Api from './modules/Api.js'
import * as IOChecker from './modules/Modes/IO_Checker.js'
import * as TabsModule  from './modules/TabsModule.js';
import * as StyleModules from './modules/StylingModules.js'
import * as SaveModule from './modules/SaveModule.js'
import * as WuartUpdate from './modules/Wuart_UpdateStatusModule.js'
import * as UartDebugger from './modules/Modes/Uart_debugger.js'


const baudrateArray = [
    "4800",
    "9600",
    "19200",
    "57600",
    "74880",
    "115200",
    "230400",
    "460800",
    "500000",
    "576000",
    "921600",
    "1000000"
];


const os = require("os"); // Comes with node.js

var controller;


const ipc = require('electron').ipcRenderer;
var dialog = require('@electron/remote').dialog;
var remote = require('@electron/remote');
var fs = require('fs');


//Defines Possible Vendor and Product Ids
const filters = [
    { usbVendorId: 0x10C4, usbProductId: 0xEA60 },
    { usbVendorId: 0x2341, usbProductId: 0x0001 }
  ];

//Define Basic Variables
let target = 0;
const vendorId = 4292; //modihive global id
let port ;
let firstconnection = true;    
export var writer;
var writableStreamClosed ;
export var reader;
export var readableStreamClosed;
export let BaudRate= 115200;
export var textEncoder;
export var textDecoder;
export let Connect = document.getElementById('connect');
let Autoconnect = document.getElementById('autoconnect');
let Orauto = document.getElementById('orauto');
wuartLog(Orauto);
wuartLog(Connect);
let Connect_Baudrate = document.getElementById('baudrate_connect');
let ToggleDevice = document.getElementById('toggle_device');
export let Disconnect = document.getElementById('power')
let ConnectionMessage = document.querySelector('#disconnected p');
let Tab_buttons = document.querySelectorAll('#navigation ul li button');
let Device_programmer_buttons = document.querySelectorAll('.device-programmer .subgroup button.main_sub');
let Interface_checker_buttons = document.querySelectorAll('.interface-checker .subgroup button.main_sub');
let infobuttons = document.querySelectorAll('.main_title button.info')
let mobilemenus = document.querySelectorAll('.main_title button.menu')
let menuoverlay = document.querySelector('#menuoverlay');
let usbdevices = document.getElementById('usb_devices')


// remote.getGlobal('usb_selected').prop = newValue;
export function setTarget(value){
    target = value;
}
for (let index_info = 0; index_info < infobuttons.length; index_info++) {
    infobuttons[index_info].addEventListener('click', (e) => {
        let main_title = e.target.parentElement.parentElement;
        if(main_title.classList.contains('expand')){
            main_title.classList.remove('expand')
        }else{
            main_title.classList.add('expand')
        }
    })
    
}
for (let index_menu = 0; index_menu < mobilemenus.length; index_menu++) {
    mobilemenus[index_menu].addEventListener('click', (e) => {
        
            StyleModules.site_wrapper.classList.add('mobilemenu')
    })
}

menuoverlay.addEventListener('click', (e) => {
    
        StyleModules.site_wrapper.classList.remove('mobilemenu')
        StyleModules.site_wrapper.classList.remove('device_show');
})

ToggleDevice.addEventListener('click', function(){
    StyleModules.ToggleDevice();
});


//Initiates Reader And Writer(Web Serial Api)

function InitiateReaderWriter(){
    
    InitiateWriter()
    InitiateReader()
    
}

export function InitiateWriter(){
    textEncoder = new TextEncoderStream();                         
    writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
    writer = textEncoder.writable.getWriter();
}
export function InitiateReader(){
    textDecoder = new TextDecoderStream();
    readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    reader = textDecoder.readable.getReader();
}


//DateTime Function -> For SaveLogs
export function GetDateTime(){
    let today = new Date();
    let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return date + " " + time;

}


//DateTime Function -> For Connect HandShake
function GetDateTimeOnConnect(){
    let today = new Date();
    let Month = ('0' +(today.getMonth()+1).toString()).slice(-2)
    let date = today.getDate() + '/' + Month + '/'+(today.getFullYear()).toString().slice(2);
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return date + "," + time;

}


//Style On PageLoad(Start Of The App)
document.addEventListener("DOMContentLoaded", async function() {
    wuartLog('DOMContentLoaded');
    StyleModules.ShowConnectButton();
    // General.ResetWuart()
    wuartLog(remote.app.getAppPath());
});

export async function connect(auto = false){
   if(remote.getGlobal('Usb').selected){
    remote.getGlobal('Usb').device_index = usbdevices.value;
   }
    Connect.classList.add('loading');
    ConnectionMessage.innerHTML = 'Selected Baudrate: ' + BaudRate + '. Connecting to Device...';
    ConnectionMessage.classList.remove('error');
    let breakpoint = false;
    wuartLog('auto:'+auto);
    
    for (let baudrate of baudrateArray) {
        wuartLog('baud option:'+baudrate);
        if(breakpoint || (!auto && baudrate != BaudRate)){
            wuartLog('return false');
            continue;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // await CloseConnection().then(async() => {
        //     wuartLog('connection has been')
            await openserialport().then(async() => {
                
                InitiateReaderWriter();
                
                firstconnection = false;
                
                await Api.ConnectDisconnectHandShake("$PC_CON-" + GetDateTimeOnConnect(),'C')
                .then(async ()=>{
                    breakpoint = true;
                    ConnectionMessage.innerHTML = 'Device Connected. Creating Log Folder...';
                    
                    // TabsModule.ChangeTab('uart-content');
                    // ToggleDevice.addEventListener('click', function(){
                    //     StyleModules.ToggleDevice();
                    // });
                    await SaveModule.CreateAppLogFolder(os.type())
                    .then(async ()=>{
                        wuartLog('Create Default Log Folder complete')
                        
                        // await SaveModule.CreateAppLog()
                        // .then(async ()=>{
                            // ConnectionMessage.innerHTML = 'Log Folder Ready. Retrieving Device Firmware and Battery Status...';
                            // return new Promise(resolve => {
                            //     setTimeout(async ()=>{
                            //         await updateBattery()
                            //         .then(async ()=>{
                        ConnectionMessage.innerHTML = 'Log Folder Ready. Starting UART Debugger Mode...';
                        await TabsModule.ChangeTab(TabsModule.latest_interface)
                        .then(() => {
                            // wuartLog(target);
                            if(target){
                                usbdevices.classList.remove('showusb')
                                ConnectionMessage.innerHTML = 'App Ready to use';
                                StyleModules.ChangeTab(TabsModule.latest_interface);
                                StyleModules.ShowDisconnectButton();
                                Connect.classList.remove('loading');
                            }else{
                                Connect.classList.remove('loading');
                                // TargetConect.classList.remove('hide');
                                // Connect.classList.add('hide');
                                disconnect(true, 'Target not found. Please connect the device to your desired target and click connect.');
                            }
                            
                        })
                        .catch((err) => {
                            Connect.classList.remove('loading');
                            // Disconnect.click();
                            disconnect(true, 'Could not connect to UART Debugger Interface. Please try again.');
                        })
                                    // })
                                    // .catch(async (err)=>{
                                    //     // Disconnect.click();
                                    //     wuartLog('failed update battery')
                                    //     Connect.classList.remove('loading');
                                    //     // ConnectionMessage.innerHTML = 'Can not get device & battery info.';
                                    //     disconnect(true, 'Can not get device & battery info.');
                                    // })
                            //     }, 3000)
                            // })
                                            
                        // })
                        // .catch((err) => {
                        //     Connect.classList.remove('loading');
                        //     // Disconnect.click();
                        //     alert('Can not create log file.')
                        // })
                        
                    })
                    .catch((err)=>{
                        Connect.classList.remove('loading');
                        // Disconnect.click();
                        alert('Can not create log folder.')
                    })
                
                })
                .catch(async (err) => {
                    Connect.classList.remove('loading');
                    await disconnect(false, 'Could not connect with the selected Baudrate. Please check if WUART bridge is still connected (green light indication), select the correct Baudrate and click Connect.');
                    // Connect.classList.add('hide');
                    // ConnectionMessage.innerHTML = 'Could not connect with the selected Baudrate. Please close the WUART APP, re-open it and select the correct Baudrate before connecting.';
                    ConnectionMessage.classList.add('error');
                    // Connect_Baudrate.classList.add('hide');
                    // Autoconnect.classList.remove('hide');
                    // Orauto.classList.remove('hide');
                    
                    // Disconnect.click();
                    wuartLog('Can not connect to device.');
                    
                    
                });
            }).catch((err) => {
                wuartLog('Could not open USB Serial Port.');
                Connect.classList.remove('loading');
                // Disconnect.click();
            });

        // }).catch((err) => {
        //     wuartLog(err);
        //     wuartLog('Could not Close Conection');
        //     Connect.classList.remove('loading');
        //     // Disconnect.click();
        // });
    }
    
}

//Connects to Device and Creates App-Log Folder and Files
Connect.addEventListener('click', () => {
    connect();
});

//Connects to Device and Creates App-Log Folder and Files
Autoconnect.addEventListener('click', () => {
    connect(true);
});

// BatteryUpdate.addEventListener('click',function(){
//     updateBattery();
// })

async function updateBattery(){
    // BatteryUpdate.classList.add('bat_loading');
    UartDebugger.SetLoopFalse();
    // BatteryMonitor.SetLoopFalse();
    // Api.Waiting.className="Waiting_Active"
    
    await Api.UpdateInfoHandShake(Api.Update_info_command)
    .then(()=>{
        wuartLog('upd success')
        // BatteryUpdate.classList.remove('bat_loading');
    })
    .catch((err)=> {
        wuartLog('upd error')
        // BatteryUpdate.classList.remove('bat_loading');
        reject();
        // alert(err)
    })
}


//Disconnect Function
Disconnect.addEventListener('click',async() => {
    disconnect();
});

async function disconnect(connected = true, message = 'The device is currently disconnected.'){
    StyleModules.site_wrapper.classList.remove('device_show');
    StyleModules.resetLedClasses();
    StyleModules.ResetInternalBatteryStatus();
    StyleModules.ResetFirmwareVersion();
    StyleModules.ResetBatteryPercentage();
    WuartUpdate.ResetJumpers();
    UartDebugger.SetLoopFalse();
    
    
    if(connected){
        await Api.WriteMessage("$PC_DIS-")
        .then(async()=>{
            await CloseConnection();
            // General.ResetWuart();
            // General.ResetFields();
            StyleModules.ShowConnectButton();
            ConnectionMessage.innerHTML = message;
            ConnectionMessage.classList.add('error');
            
            setTimeout(()=>{
                Connect.classList.remove('hide');
            },1500)
            

        })
        .catch(() => {
            alert("Error");
        })
    }else{
        await CloseConnection();
        // General.ResetWuart();
        // General.ResetFields();
        StyleModules.ShowConnectButton();
        ConnectionMessage.innerHTML = message;
        ConnectionMessage.classList.add('error');
        
        setTimeout(()=>{
            Connect.classList.remove('hide');
        },1500)
    }
    
}

export function changeConnectionMessage(message){
    ConnectionMessage.innerHTML = message;
}

for (let i = 0; i < Tab_buttons.length; i++) {
    Tab_buttons[i].addEventListener('click', function(e){
        e.preventDefault();
        StyleModules.site_wrapper.classList.remove('mobilemenu');
        let target = this.dataset.tab;
        TabsModule.ChangeTab(target).then(()=>{
            StyleModules.ChangeTab(target);
        })
        .catch((err)=> {
            alert(err)
        })
    })
    
}
for (let j = 0; j < Device_programmer_buttons.length; j++) {
    Device_programmer_buttons[j].addEventListener('click', function(e){
        e.preventDefault();
        let target = this.dataset.tab;
        TabsModule.ChangeTab(target);
        StyleModules.ChangeTab(target);
    })
    
}
for (let k = 0; k < Interface_checker_buttons.length; k++) {
    Interface_checker_buttons[k].addEventListener('click', function(e){
        e.preventDefault();
        let target = this.dataset.tab;
        TabsModule.ChangeTab(target);
        StyleModules.ChangeTab(target);
    })
    
}



//Device Serial Port Open
async function openserialport(){
    wuartLog('open serial');
    return new Promise (async(resolve,reject) => {
        if ('serial' in navigator) {
            try{
                
                
                port = await navigator.serial.requestPort({filters});
                await port.open({baudRate : BaudRate,
                                dataBits : 8,
                                stopBits : 1,
                                bufferSize : 255,
                                parity : 'none',
                                flowControl : 'none'            
                            });
                attachDisconnectPortEvent()
                wuartLog(port.getInfo());
                resolve();
                
            }
            catch(err){
                console.error(err);
                // let nodevices = appWindow.getNumberofDevices();
                let devicesobj = remote.getGlobal('NumberofDevices');
                wuartLog(devicesobj)
                let nodevices = devicesobj.total
                let message = "";
                ConnectionMessage.classList.remove('error');
                if(nodevices == 0){
                    usbdevices.classList.remove('showusb')
                    message = 'There was an error opening the Serial port: No Devices found!'; 
                    ConnectionMessage.innerHTML = message;
                    ConnectionMessage.classList.add('error');
                }else{
                    let select_html = ""
                    for (let index = 0; index < devicesobj.devices.length; index++) {
                        let device_obj = devicesobj.devices[index];
                        select_html += '<option value="' + device_obj.number_id + '">' + device_obj.displayName + ' (' + device_obj.portName + ')</option>';
                    }
                    usbdevices.innerHTML = select_html
                    usbdevices.classList.add('showusb')
                    message = 'Please select USB Device'; 
                    ConnectionMessage.innerHTML = message;
                    remote.getGlobal('Usb').selected = true
                    
                }

                
                reject('There was an error opening the Serial port!');
            }}
        else{
            reject("Web Serial is not enabled in your browser !")
        }    
    })
}




//Closes Serial Port 
export async function CloseConnection(){
    if(!firstconnection){
        wuartLog('not first connection');
        return new Promise(async(resolve,reject) => {
            try{
                wuartLog('dis1')
                
                await reader.cancel();
                wuartLog('dis2')
                // controller.abort();
                reader.releaseLock()
                wuartLog('dis2b')
                
                
                await readableStreamClosed.catch(() => { 
                    /* Ignore the error */ 
                    wuartLog('dis3')
                });
                wuartLog('dis4')
                await writer.close();
                wuartLog('dis5')
                await writableStreamClosed;
                wuartLog('dis6')
                await port.close()
                    .then(() => {
                        wuartLog('dis7');
                        reader = null;
                        readableStreamClosed = null;
                        writer = null;
                        writableStreamClosed = null;
                        port = null;
                        resolve();
                    })
                    .catch(() => {wuartLog('dis8');reject("There was a problem")});
            }
            catch(err){
                reject(err);
            }
        })
    }
        
}



//ReConnects to Serial Port
export async function ReConnect(){
    return new Promise(async(resolve,reject) => {
        
        reader.cancel();
        reader.releaseLock()
        await readableStreamClosed.catch(() => { /* Ignore the error */ });

        writer.close();
        await writableStreamClosed;

        await port.close()
                    .then(() => {
                        wuartLog('dis7');
                        reader = null;
                        readableStreamClosed = null;
                        writer = null;
                        writableStreamClosed = null;
                        resolve();
                    })
                    .catch(() => {wuartLog('dis8');reject("There was a problem")});
        // await port.close().then(() => {resolve();}).catch(() => {reject("There was a problem")});
        //port = await navigator.serial.requestPort({filters});
        await port.open({baudRate : BaudRate});
        
        InitiateReaderWriter();
    })
}

export function attachDisconnectPortEvent(){
    port.addEventListener("disconnect", async(event) => {
       wuartLog('Port Detached');
       await CloseConnection();
        // General.ResetWuart();
        // General.ResetFields();
        StyleModules.ShowConnectButton();
        let message = 'Device has been disconnected.'
        ConnectionMessage.innerHTML = message;
        ConnectionMessage.classList.add('error');
        
        setTimeout(()=>{
            Connect.classList.remove('hide');
        },1500)
       
    });
}

//ReConnects to Serial Port
export async function ReOpenPort(){
    return new Promise(async(resolve,reject) => {
        
        reader.cancel();
        reader.releaseLock()
        await readableStreamClosed.catch(() => { /* Ignore the error */ });

        writer.close();
        await writableStreamClosed;

        await port.close()
                    .then(() => {
                        wuartLog('dis7');
                        reader = null;
                        readableStreamClosed = null;
                        writer = null;
                        writableStreamClosed = null;
                        resolve();
                    })
                    .catch(() => {wuartLog('dis8');reject("There was a problem")});
        // await port.close().then(() => {resolve();}).catch(() => {reject("There was a problem")});
        //port = await navigator.serial.requestPort({filters});
        wuartLog('Reconnect Port with Baudrate: '+BaudRate)
        await port.open({baudRate : BaudRate});
        
    })
}



//Sends Disconnects when Closing the app window
ipc.on('app-close',()=>{
    if(port!=undefined){
        BatteryMonitor.SetLoopFalse()
        IOChecker.SetLoopFalse()
        UartDebugger.SetLoopFalse()
        Api.WriteMessage('$PC_DIS-')
    }
    ipc.send('closed')
})


//select baudrate on connect
Connect_Baudrate.addEventListener('change', function(e){
    let value = e.target.value;
    wuartLog(value);
    if(value != ''){
        BaudRate = value;
        Connect.disabled = false;
    }
});

export function showConnect(){
    Connect.classList.remove('hide');
}

export function SetBaudRate(newbaudrate){
    BaudRate = newbaudrate;
}

export function SetSelectBaudRate(){
    Connect_Baudrate.value = BaudRate;
}

export function wuartLog(message, log = true){
    if(log){
        console.log(message);
    }
}