import * as DeviceProgrammer from './Modes/Device_Programmer.js'
import * as Api from './Api.js'
import * as UartDebugger from './Modes/Uart_debugger.js'
import * as InterfaceChecker from './Modes/Interface_Checker.js'
import * as IOChecker from './Modes/IO_Checker.js'
import * as BatteryMonitor from './Modes/Battery_Monitor.js'
import * as connection from '../connection.js'





export let currentTab;
export let mode;
export let latest_interface = 'uart-content';


let adjust_pins = document.getElementById('toggle_device');
function disablePins(){
    connection.wuartLog('disabling pins')
    connection.wuartLog(adjust_pins)
    adjust_pins.disabled = true;
}
export function enablePins(){
    connection.wuartLog('enabling pins')
    connection.wuartLog(adjust_pins)
    adjust_pins.disabled = false;
}


//Enables Dtr Mode
async function DtrMode(){
    Api.StartInterfaceHandShake(Api.Uart_flasher_command_dtr)
    .then(()=>{
       //nothing, remove loading state/class
        
    })
    .catch(()=>{
        alert("Error Enabling Dtr Mode")
    });

}

//Enables Cap - Dtr Mode
async function CapDtrMode(){
    Api.StartInterfaceHandShake(Api.Uart_flasher_command_cap_dtr)
    .then(()=>{
        //nothing, remove loading state/class
    })
    .catch(()=>{
        alert("Error Enabling Cap-Dtr Mode")
    });
}

//Enables ESP32 mode
async function Esp32Mode(){
    // Connection.UpdateBaudRate(1152000)
    Api.StartInterfaceHandShake(Api.Esp32_TCP_command)
    .then(()=>{
        //nothing, remove loading state/class
    })
    .catch(()=>{
        alert("Error Enabling ESP32 Mode")
    });
}





//Change Tab
export async function ChangeTab(tab_name){
    connection.wuartLog('Changing Tab')
    disablePins();
    UartDebugger.SetLoopFalse();
    UartDebugger.ResetFields();
    DeviceProgrammer.ResetFields();
    InterfaceChecker.ResetFields();
    IOChecker.ResetCharts();
    IOChecker.ResetButtons();
    BatteryMonitor.DestroyCharts();
    BatteryMonitor.ResetButtons();
    currentTab = tab_name;
    connection.wuartLog('Requested Mode:' + tab_name)
    

    if (tab_name =="uart-content"){
        connection.wuartLog('Tab: UART DEBUGGER')
        await UartDebugger.StopListen();
        await Api.StartInterfaceHandShake(Api.Uart_debugger_command)
        .then(async()=>{
            await UartDebugger.ChangeBaudrate()
            .then(async()=>{
                enablePins();
                let promiselisten = UartDebugger.ContinuousListenUart()
                promiselisten.then(async()=>{

                })
                .catch(async()=>{
                    connection.wuartLog('lost device')
                });
                UartDebugger.setDefaultBaud();
                UartDebugger.disableChangeBaud();
                UartDebugger.resetListeningButtons();
            })
            .catch(async()=>{
                connection.wuartLog('lost device 3')
            });
            
        })
        .catch(async()=>{
            connection.wuartLog('lost device 2')
        });
    }
    else if(tab_name=="device-programmer-uart-dtr"){
        connection.wuartLog('Tab: DEVICE programmer')
        DtrMode();
        enablePins();
    }
    else if(tab_name=="device-programmer-uart-cap-dtr"){
        connection.wuartLog('Tab: DEVICE programmer')
        CapDtrMode();
        enablePins();
    }
    else if(tab_name=="device-programmer-esp32"){
        connection.wuartLog('Tab: DEVICE programmer')
        Esp32Mode();
        enablePins();
    }
    else if(tab_name=="interface-checker-i2c-builder"){
        connection.wuartLog('Tab: Interface Checker')
        if(latest_interface != 'interface-checker-i2c-scanner'){
            await Api.StartInterfaceHandShake(Api.I2C_command).then(()=>{
                enablePins();
            })
            .catch((err) => {
                alert(err)
            });
        }
           
    }
    else if(tab_name=="interface-checker-i2c-scanner"){
        connection.wuartLog('Tab: Interface Checker')
        if(latest_interface != 'interface-checker-i2c-builder'){
            await Api.StartInterfaceHandShake(Api.I2C_command).then(()=>{
                enablePins();
            })
            .catch((err) => {
                alert(err)
            });
        }
           
    }
    else if(tab_name=="interface-checker-spi"){
        connection.wuartLog('Tab: Interface Checker')
       await Api.StartInterfaceHandShake(Api.Spi_command).then(()=>{
        enablePins();
        })
        .catch((err) => {
            alert(err)
        });
           
    }
    else if(tab_name == "i-o-checker"){
        connection.wuartLog('Tab: I/O Checker')
        await Api.StartInterfaceHandShake(Api.Gpio_command, 15000).then(async()=>{
            enablePins();
        })
       
    }
    else if(tab_name == "current-monitor"){
        await Api.StartInterfaceHandShake(Api.Current_monitor_command).then(async()=>{
            
        })
            
    }
    latest_interface = tab_name;
    
 
    
    
}






