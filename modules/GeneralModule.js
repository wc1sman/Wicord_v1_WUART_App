import * as UartDebugger from './Modes/Uart_debugger.js'
export var While_boolean = true

//Reset All Fields
export function ResetFields(){
    DeviceProgrammer.ResetFields();
    UartDebugger.ResetFields();
    InterfaceChecker.ResetFields();
    SdSniffer.ResetFields();
}

//Resets Wuart Figure
export function ResetWuart(){
    BoardModule.ResetAll();
    WuartUpdate.ResetJumpers();
    WuartStylingModule.Led_Colour('0');
    WuartStylingModule.ButtonStatus('0')

}

export async function Delay(){
    return new Promise ((resolve)=>{
        setTimeout(() =>{
            resolve()
        },1500)

    })
}


export function SetWhilleTrue(){
    While_boolean = true
}

export function SetWhileFalse(){
    While_boolean = false
}