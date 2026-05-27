import * as connection from '../connection.js'

var dialog = require('@electron/remote').dialog;
var remote = require('@electron/remote');
var fs = require('fs')
const app = require('@electron/remote').app;
let CurrentPathAppLogs
let CurrentAppLog
let AppLogFileName
const path = require('path')
const CurrentPath = app.getPath('userData')
let logPath = CurrentPath+'/AppLogFiles/';
let shell = require("electron").shell;
let AppLogFolder = document.getElementById('applog_folder')

let ChangeLogFolder = document.getElementById('browse_log')
let UartDebuggerLog 
let BatteryDebuggerLog 
export let ΙΟDebuggerLogA1 
export let ΙΟDebuggerLogA2 
export let ΙΟDebuggerLogD1 
export let ΙΟDebuggerLogD2 
connection.wuartLog(logPath);
let ApplogText = AppLogFolder.querySelector('span');
updateAppLogText();

function updateAppLogText(){
    ApplogText.innerText = '..'+logPath.slice(-15);
}
AppLogFolder.addEventListener('click',()=>{
    shell.openPath(logPath)
})

ChangeLogFolder.addEventListener('click',()=>{
    ChangeLogDirectory();
})


function ChangeLogDirectory(){
    dialog.showOpenDialog(remote.getCurrentWindow(), {
        properties: [
            "openDirectory", 
            "createDirectory"
        ]
    }).then(result => {
        if (result.canceled === false) {
            connection.wuartLog("Selected log folder path:" + result.filePaths)
            logPath = result.filePaths[0];
            updateAppLogText();
        }
    }).catch(err => {
        connection.wuartLog(err)
    });
}

//Gets TimeStamp

function GetTimeStamp(){
    var today = new Date();
    var date = today.getFullYear().toString()+'-'+(today.getMonth()+1).toString()+'-'+today.getDate().toString();
    var time = today.getHours().toString() + "_" + today.getMinutes().toString() + "_" + today.getSeconds().toString();
    return date + "_" + time;
}


//Creates Log File and appends text to it

export function CreateUartDebuggerLog(){
    //omly timestamp
    
    UartDebuggerLog = logPath + '/Uart_' + GetTimeStamp() + '.txt'
    connection.wuartLog('start logging at')
    connection.wuartLog(UartDebuggerLog)
    fs.closeSync(fs.openSync(UartDebuggerLog, 'w'));
    UartDebuggerUpdateLog('Start Logging...')
    return

}


export function UartDebuggerUpdateLog(Text){
    if(UartDebuggerLog == undefined){
        connection.wuartLog('UartDebuggerLog undefined')
        return
    }
    else{

        let finaltext = GetTimeStamp() + ': ' + Text + '\n';
        fs.appendFile(UartDebuggerLog , finaltext  , (err)=>{
            if(err){
                connection.wuartLog('append file error')
                alert("Problem writing current log")
                
            }
            connection.wuartLog('append file correct')
            return
        })
    }
        
 }


 export function resetUartDebuggerLog(){
    UartDebuggerLog = undefined;
 }


 export function CreateBatteryDebuggerLog(){
    //omly timestamp
    
    BatteryDebuggerLog = logPath + '/Battery_' + GetTimeStamp() + '.txt'
    connection.wuartLog('start logging at')
    connection.wuartLog(BatteryDebuggerLog)
    fs.closeSync(fs.openSync(BatteryDebuggerLog, 'w'));
    BatteryUpdateLog('Start Logging...')
    return

}

 export function BatteryUpdateLog(Text){
    if(BatteryDebuggerLog == undefined){
        connection.wuartLog('Battery Log undefined')
        return
    }
    else{

        let finaltext = GetTimeStamp() + ': ' + Text + '\n';
        fs.appendFile(BatteryDebuggerLog , finaltext  , (err)=>{
            if(err){
                connection.wuartLog('append file error')
                alert("Problem writing current log")
                
            }
            return
        })
    }
        
 }


 export function resetBatteryLog(){
    BatteryDebuggerLog = undefined;
 }














 export function CreateΙΟDebuggerLog(){
    //omly timestamp
    
    ΙΟDebuggerLogA1 = logPath + '/IO_Analog1_' + GetTimeStamp() + '.txt'
    ΙΟDebuggerLogA2 = logPath + '/IO_Analog2_' + GetTimeStamp() + '.txt'
    ΙΟDebuggerLogD1 = logPath + '/IO_Digital1_' + GetTimeStamp() + '.txt'
    ΙΟDebuggerLogD2 = logPath + '/IO_Digital2_' + GetTimeStamp() + '.txt'
    fs.closeSync(fs.openSync(ΙΟDebuggerLogA1, 'w'));
    fs.closeSync(fs.openSync(ΙΟDebuggerLogA2, 'w'));
    fs.closeSync(fs.openSync(ΙΟDebuggerLogD1, 'w'));
    fs.closeSync(fs.openSync(ΙΟDebuggerLogD2, 'w'));
    let logger = [ΙΟDebuggerLogA1, ΙΟDebuggerLogA2, ΙΟDebuggerLogD1, ΙΟDebuggerLogD2];
    IOUpdateLog(logger, 'Start Logging...')
    return

}

 export function IOUpdateLog(logger, Text){
    if (logger.constructor.name != "Array") {
        connection.wuartLog('logger not Array');
       logger = [logger];
    }

    for (let index = 0; index < logger.length; index++) {
        if(logger[index] == undefined){
            connection.wuartLog('IO Checker Log undefined')
            continue;
        }
        else{
    
            let finaltext = GetTimeStamp() + ': ' + Text + '\n';
            fs.appendFile(logger[index] , finaltext  , (err)=>{
                if(err){
                    connection.wuartLog('append file error')
                    alert("Problem writing current log")
                    
                }
                return
            })
        }
    }
    return
    
        
 }


 export function resetΙΟLog(){
    let logger = ['ΙΟDebuggerLogA1', 'ΙΟDebuggerLogA2', 'ΙΟDebuggerLogD1', 'ΙΟDebuggerLogD2'];
    for (let index = 0; index < logger.length; index++) {
        let DebuggerLogVarName = logger[index]
        window[DebuggerLogVarName] = undefined;
    }
    
 }












//Creates AppLogs Folder if not exist 

export async function CreateAppLogFolder(os_version){
    connection.wuartLog(CurrentPath)
    return new Promise (async(resolve,reject) => {

        
            if (fs.existsSync(path.join(CurrentPath,"AppLogFiles"))){
                CurrentPathAppLogs = path.join(CurrentPath,"AppLogFiles")
                
                resolve();

            }
            else{
                fs.mkdir(path.join(CurrentPath,"AppLogFiles"), (err) =>{
                    if(err){
                        reject(err.message)
                    }
                    else{
                    CurrentPathAppLogs = path.join(CurrentPath,"AppLogFiles")
                    resolve();
                    }
                })

            }

        })
    
}

//Creates App Log file in inside AppLogs Folder

export async function CreateAppLog(){
    return new Promise(async(resolve,reject) =>{
        AppLogFileName = "AppLog" + "_" + GetTimeStamp() + ".txt";
        CurrentAppLog = path.join(CurrentPathAppLogs,AppLogFileName);
        fs.writeFile(CurrentAppLog , "" , (err)=>{
            if(err){
                reject(err.message)
            }
            else{
                resolve();
            }
            
        })
        

    })
}


//Appends Text to AppLog File

export function AppSaveLog(Text){
    
   if(CurrentAppLog == undefined){
       return
   }
   else{
       fs.appendFile(CurrentAppLog , Text + " \n \n" , (err)=>{
           if(err){
               alert("Problem writing current applog")
               
           }
           return
       })
   }
       
}




