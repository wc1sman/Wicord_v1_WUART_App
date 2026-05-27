import * as BoardModule from './BoardModule.js'
import * as WuartUpdate from './Wuart_UpdateStatusModule.js'
import * as Api from './Api.js'
import * as UartDebugger from './Modes/Uart_debugger.js'
import * as StyleModules from './StylingModules.js'
import * as BatteryMonitor from './Modes/Battery_Monitor.js'
import * as IOChecker from './Modes/IO_Checker.js'
import * as connection from '../connection.js'
import * as TabsModule  from './TabsModule.js';



let Configure = document.getElementById('Config')
let StringToSend= "$PC02-"

//Configure Button 

export async function new_pin_arrangement(){
    if(CheckBoardIfSame()){
        //do nothing
        connection.wuartLog('pins have not changed')
    }else{
        StyleModules.site_wrapper.classList.add('loading_content');
        UartDebugger.SetLoopFalse()
        await UartDebugger.StopListen();
        IOChecker.SetLoopFalse()
        BatteryMonitor.SetLoopFalse()
        StringToSend="$PC02-";

        BoardModule.Board_Pins.forEach(Pin_span=>{
            let Pin_name = Pin_span.innerHTML;
            let pin_tag = WuartUpdate.GetPinTag(Pin_name);
            StringToSend+=pin_tag + ","
        })
        
        StringToSend = StringToSend.slice(0,StringToSend.length-1)
        connection.wuartLog(StringToSend)
        await Api.StartInterfaceHandShake(StringToSend).
        then(async()=>{
            BoardModule.device.classList.remove('status_apply');
            alert("WUART pin arrangement has been updated.");
            StringToSend="$PC02-";
            if(TabsModule.currentTab == "uart-content"){
                await UartDebugger.ChangeBaudrate()
                .then(async()=>{
                    TabsModule.enablePins();
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
                    TabsModule.enablePins();
                    let promiselisten = UartDebugger.ContinuousListenUart()
                    promiselisten.then(async()=>{

                    })
                    .catch(async()=>{
                        connection.wuartLog('lost device')
                    });
                    UartDebugger.setDefaultBaud();
                    UartDebugger.disableChangeBaud();
                    UartDebugger.resetListeningButtons();
                });
            }

            
        })
        .catch(()=>{
            BoardModule.device.classList.remove('status_apply');
            BoardModule.cancelReorder();
            alert("Error updating WUART")
            StringToSend="$PC02-";
        })
       
       
    }
        
}


//Checks if Pins are the same
function CheckBoardIfSame(){
    connection.wuartLog('CheckBoardIfSame')
    let same = true;
    for (let index = 0; index < BoardModule.Board_Pins.length; index++) {
        let id_index = index + 1;
        let compare_id = 'drag' + id_index;
        connection.wuartLog('id:')
        connection.wuartLog(BoardModule.Board_Pins[index].id)
        connection.wuartLog('position id:')
        connection.wuartLog(compare_id)
        if(BoardModule.Board_Pins[index].id != compare_id){
            same = false;
        }
        
    }
    return same
}


