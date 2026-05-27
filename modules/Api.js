import * as connection from '../connection.js'
import * as StyleModules from './StylingModules.js'
import * as WuartUpdate from './Wuart_UpdateStatusModule.js'
import * as UartDebugger from './Modes/Uart_debugger.js'
import * as General from './GeneralModule.js'
import * as InterfaceChecker from './Modes/Interface_Checker.js'

export const I2C_Scan = "$PC07-"
export const Uart_debugger_command = "$PC03-07";
export const Esp32_UDP_command= "$PC03-02"
export const Esp32_TCP_command = "$PC03-01"
export const Uart_flasher_command_dtr = "$PC03-11"
export const Uart_flasher_command_cap_dtr = "$PC03-14"
export const BatteryMonitorPlotter_command = "$PC10-"
export const I2C_command = "$PC03-06";
export const Gpio_command = "$PC03-08";
export const Current_monitor_command = "$PC03-09"
export const Update_info_command = "$PC05-"
export let Update_BaudRate_command = "$PC06-"
export const Time_command = "$PC10-"
export const ButtonPressed_command = "$PC08-"
export const ButtonUnPressed_command = "$PC09-"
export const GPIO_Hz_command = "$PC11-"
export const Registes_command = "$PC12-"
export const I2C_Config = "$PC13-"
export const SPI_Data = "$PC14-"
export const SPI_Config = "$PC15-"
export const Spi_command ="$PC03-10"
let Tool_Connect
export let StopReading;
export var expression





let device = document.getElementById('device');


export function SetExpressionFalse(){
    expression = false;
}

//Connect-Disconnect Handshake
export function ConnectDisconnectHandShake(command,mode){
    
    return new Promise(async(resolve,reject) =>{
        
        await WriteMessage(command)
        .then(async()=>{
            var Result = await ListenMessage("W", 4000);
           connection.wuartLog(Result)
            Tool_Connect = ConnectDisconnectCheckValue(Result , mode)
            if(Tool_Connect==true){
                // //Firmware Change
                let values = Result.replace("W-CONN-", "");
                values = values.split(":")
                connection.wuartLog(values);
                let fv = values[1];
                let sd = values[0];
                StyleModules.SdStatusUpdate(sd)
                StyleModules.FirmwareVersionUpdate(fv)
                StyleModules.LedStatusUpdate('2')
                resolve()
            }
            else{
                reject()
            }
            
        })})
            
        }       
               


// Update Info handshake
export async function UpdateInfoHandShake(command,mode){
    connection.wuartLog('UpdateInfoHandShake');
    
    return new Promise(async(resolve,reject) =>{
        
        await WriteMessage(command)
        .then(async()=>{
            
            var Result = await ListenMessage("I", 3000);
            connection.wuartLog(Result)
            if (Result=="Error"){
                reject();
            }
            else{
                Tool_Connect = await UpdateInfoCheckValue(Result)
                
                if(Tool_Connect == false){
                    connection.wuartLog(err)
                    reject(err)
                }
                else{
                    resolve();
                }
            }
            

        })
        
    })
}


// Update Info handshake
export async function UpdateBaudrateHandShake(command){
    connection.wuartLog('UpdateBaudrateHandShake');
    
    return new Promise(async(resolve,reject) =>{
        
        await WriteMessage(command)
        .then(async()=>{
            
            var Result = await ListenMessage("R", 6000);
            connection.wuartLog(Result)
            if (Result=="Error"){
                connection.wuartLog('UpdateBaudrateHandShake Listen Error');
                reject();
            }
            else{
                connection.wuartLog('UpdateBaudrateHandShake Listen Success');
                resolve();
                
            }
            

        })
        
    })
}

export async function InterfaceCheckerConfig(command, delay = 10000){
  
    return new Promise(async(resolve,reject) =>{
        
        await WriteMessage(command)
        .then(async()=>{
            
            var Result = await ListenMessage("R", delay);
            connection.wuartLog(Result)
            if (Result=="Error"){
                reject();
            }
            else{
                resolve()
            
            }
        
        })
    })
}


export async function InterfaceCheckerResponseHandShake(button, command, length, delay = 10000){
  
    return new Promise(async(resolve,reject) =>{
        await WriteMessage(command)
        .then(async()=>{
            
            var Result = await ListenMessage("RES", delay, length);
            connection.wuartLog(Result)
            if (Result=="Error"){
                reject();
                InterfaceChecker.ShowText(button, 'No Response')
            }
            else{
                InterfaceChecker.ShowResponseValues(button, Result)
                resolve()
            
            }
        
        })
    })
}




//Interface Start HandShake

export function StartInterfaceHandShake(command, delay = 10000){

    StyleModules.site_wrapper.classList.add('loading_content');
    return new Promise(async(resolve,reject) =>{
        connection.wuartLog(command)
        
        await UartDebugger.StopListen()
        General.Delay()
        await WriteMessage(command)
        .then(async()=>{
            
            connection.wuartLog("Message Sent")
            

            var Result = await ListenMessage("S", delay);
            connection.wuartLog(Result)
            if (Result == "Error"){
                alert("Could not enter interface. Please check if the light indicator in WUART bridge is green and try again.")
                StyleModules.site_wrapper.classList.remove('loading_content');
                reject();
            }
            else{
                connection.wuartLog('success listened message')
                StyleModules.site_wrapper.classList.remove('loading_content');
                Tool_Connect = await StartInterfaceCheckValues(Result);
                if(Tool_Connect==false){
                    
                    reject();
                }
                else{
                    connection.wuartLog('tool true')
                    resolve();
                }}
    })
})}






//Listens Port
export async function ListenMessage(Word, delay = 6000, length = 0){ // Reads Message fron the Serial
    var ReturnedValue = ""
    let check = false
    
    
    let Desired_length = ReturnDesiredLength(Word)
    connection.wuartLog('Desired_length: '+ Desired_length)
    let Incoming_length = 0
    
    const TimeOut = new Promise((resolve) => setTimeout(() => {
        resolve("Error")
    }, delay));

    const ListenPromise = new Promise(async(resolve,reject)=>{
       

        while(!Check_Length_S_Status(ReturnedValue, Word, length) && Incoming_length != Desired_length){
            
            await connection.reader.read({}).then(({value,done})=>{
                if(value){
                    connection.wuartLog(value)
                    connection.wuartLog(value.length)
                }
                if(check){
                    connection.wuartLog('check true')
                    let temp_returnvalue = value.trim()
                    ReturnedValue = ReturnedValue + temp_returnvalue
                    Incoming_length = Incoming_length + Check_Length(temp_returnvalue, Word)
                    connection.wuartLog('ReturnedValue: '+ ReturnedValue)
                    connection.wuartLog('Incoming_length: '+ Incoming_length)
                    
                }
                else if(value && value.trim().includes(Word)){
                    check = true
                    ReturnedValue = (value.substring(value.indexOf(Word[0]))).trim()
                    connection.wuartLog('ReturnedValue:'+ReturnedValue)
                    Incoming_length = Check_Length(ReturnedValue,Word)
                    connection.wuartLog('Incoming_length:'+Incoming_length)
                }
        
            })
        }
        connection.wuartLog('resolve listen message');
        
        resolve(ReturnedValue);

    })

    return  Promise.race([TimeOut,ListenPromise])

}





//Sends Message
export function WriteMessage(message){ //Write Message On The Serial
    connection.wuartLog("Message Sent :" + message)
    return new Promise(async(resolve,reject) => {
        var Message = message + "\n"
        
        
        await connection.writer.write(Message)
        .then(() =>{
            connection.wuartLog("Sent")
            resolve();            
                                
        })
        .catch(() => {
            connection.wuartLog("Message Not Sent")
            reject()});

    })

}


// Checks incoming value for connect/disconnect handshake
function ConnectDisconnectCheckValue(Value,mode){
    connection.wuartLog(Value)
    connection.wuartLog(mode)
    if (mode == 'C')
        if(Value[2]=='C'){
            return true
        }
        else{
            return false
        }
    else{
        return true
    }
}


//Checks incoming value from start interface handshake
async function StartInterfaceCheckValues(Value){

    var firstLine = Value.split('\n')[0];
    firstLine = Value.split('\r')[0];
    await WuartUpdate.WuartUpdateStatus(firstLine)
    .then(()=>{return true})
    .catch(()=>{return false})

}
//Initiates Wuart Info Update
function UpdateInfo(info){
    return new Promise((resolve,reject) =>{
        try{
            let Info = info.split('-')[1]
            let newInfo = Info.split(':');
            if(newInfo.length > 1 ){
                connection.wuartLog('new firmware with : separators');
                Info = Info.split(':');
            }else{
                connection.wuartLog('old firmware with , separators');
                Info = Info.split(',');
            }
            
            

            StyleModules.LedStatusUpdate(Info[0])
            StyleModules.SdStatusUpdate(Info[2])
            StyleModules.InternalBatteryStatusUpdate(Info[3])
            StyleModules.FirmwareVersionUpdate(Info[5])
            StyleModules.BatteryPercentageUpdate(Info[4])
            resolve();
            
        }
        catch(err){
            connection.wuartLog(err)
            reject(err)
        }
    })
}



//Checks incoming value from update info handshake
function UpdateInfoCheckValue(Value){
    return new Promise(async(resolve,reject)=>{

        await UpdateInfo(Value)
        .then(()=>{resolve(true)})
        .catch((err)=>{;
            resolve(err)})
        })
}


function Check_Length(Value,Key){
   if(Key.includes('S')){
    //    if (Value.length > 9){
    //        connection.wuartLog(Value.slice(9,Value.length).split(',').length)
    //        return(Value.slice(9,Value.length).split(',').length)

    //    }
       return Value.length
   }
   else if(Key.includes('W')){
       return Value.length
   }
   else if(Key.includes('I')){
       if(Value.length>7){
        return Value.slice(7,Value.length).split(':').length
       }
   }
   else if(Key.includes('R')){
       if(Value.length == 1){
        return -1
       }
       else if(Value.includes('R_ACK') || Value.includes('RES-') ){
        return 5
       }
       else{
           return Value.length
       }
       
   }
    
}

function Check_Length_S_Status(Value, Key, length){
    if(Key.includes('RES')){
        if(Value.includes('RES-')){
            Value = Value.replace('RES-', '');
            let newlength = length;
            if(Value.split(' ').length == newlength){
                return true
            }
        }
        
    }else if(Key.includes('S')){
        if(Value.slice(9,Value.length).split(',').length == 8){
            connection.wuartLog('Check_Length_S_Status true');
            return true
        }
    }
    return false

}

function ReturnDesiredLength(Key){
    if(Key.includes('W')){
        return 14
    }
    else if(Key.includes('I')){
        return 6
    }
    else if(Key.includes("S")){
       return 8
    }
    else if(Key.includes("R")){
        return 5
     }
    else{
        return 1
    }
 
}