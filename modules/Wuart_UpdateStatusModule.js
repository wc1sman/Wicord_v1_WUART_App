import * as Wuart_ConfigureModule from './Wuart_ConfigureModule.js'
import * as StyleModules from './StylingModules.js'
import * as BoardModule from './BoardModule.js'
import * as connection from '../connection.js'
let device = document.getElementById('device');


let reorder = document.querySelector('#actions .reorder');
let cancel = document.querySelector('#actions .cancel');
let apply = document.querySelector('#actions .apply');

reorder.addEventListener('click', (e) => {
    device.classList.add('status_apply');
})
cancel.addEventListener('click', (e) => {
    BoardModule.cancelReorder();
})
apply.addEventListener('click', (e) => {
    //apply function goes here
    Wuart_ConfigureModule.new_pin_arrangement();
    

    //only when success hide
    
})
//Initiates Wuart Status Update
export function WuartUpdateStatus(Status){
    
    return new Promise((resolve,reject) =>{
        try{
            let Val = Status.replace(/\n/g, "")
            Val = Status.replace(/\r/g, "")
            connection.wuartLog("Wuart Update Status")
            Val = Status.slice(9,Status.length)
            Val = Val.split(':')
            let led = Val[0];
            let battery_status = Val[1];
            StyleModules.InternalBatteryStatusUpdate(battery_status);
            let battery_percentage = Val[2];
            StyleModules.BatteryPercentageUpdate(battery_percentage);
            connection.wuartLog('Status Target: '+Val[3])
            connection.setTarget(parseInt(Val[3]));
            let pins = Val[4];
            let pins_array = pins.split(',');
            
            
            StyleModules.LedStatusUpdate(led);
            connection.wuartLog(pins_array)

            UpdatePins(pins_array,battery_status)
            BoardModule.disableVccGnd();
            
            resolve();
            
            
            
        }
        catch(err){
            reject()
        }
    })

}



//Initiates Wuart Info Update
export function WuartUpdateInfo(info){
    return new Promise((resolve,reject) =>{
        try{
            let Info = info.split('-')[1]
            Info = Info.split(',');
            
            
            LedStatusUpdate(Info[0])
            ButtonStatusUpdate(Info[1])
            SdStatusUpdate(Info[2])
            InternalBatteryStatusUpdate(Info[3])
            FirmwareVersionUpdate(Info[5])
            BatteryPercentageUpdate(Info[4])
            resolve();
            
        }
        catch(err){
            connection.wuartLog(err)
            reject(err)
        }
    })
}

//Updates Firmware Version
function FirmwareVersionUpdate(Value){
    
    BatteryMonitor.UpdateFirmwareVersion(Value)
}


//Updates Sd Status
function SdStatusUpdate(Value){
    
    BatteryMonitor.UpdateSDStatus(Value)
    
}
function BatteryPercentageUpdate(Value){
    BatteryMonitor.UpdateBatteryPercentage(Value)
}
    
//Updates Led Status
function LedStatusUpdate(colour){  
    WuartStylingModule.Led_Colour(colour)

}

//Updates internal Battery Status
function InternalBatteryStatusUpdate(Value){
    BatteryMonitor.UpdateVoltage(Value)
}

//Updates Button Status
function ButtonStatusUpdate(mode){
    WuartStylingModule.ButtonStatus(mode)
    
}

//Updates new Pins
function UpdatePins(Pins_Array,Volt){
    
    let Pins = Pins_Array
    connection.wuartLog(Pins)
    connection.wuartLog('before reset');
    ResetJumpers();
    let counter = 0
   
    let i=0;
    connection.wuartLog('update pins function');
    connection.wuartLog(BoardModule.Board_Pins);
    Pins.forEach(Pin_code =>{
        let pluscounter = counter + 1;
        // BoardModule.Board_Pins[counter].innerHTML = GetPinName(Pin_code,counter+1,Volt)
        let pin_name = GetPinName(Pin_code,pluscounter)
        BoardModule.Board_Pins[counter].innerHTML = pin_name
        BoardModule.Board_Pins[counter].id = 'drag'+pluscounter;
        BoardModule.Live_Screen[counter].innerHTML = pin_name
        counter++
      
    })


}

//Reset All Jumpers
export function ResetJumpers(){
    connection.wuartLog('Reset Jumpers');
    device.classList.remove('r_1','r_2','r_3','r_4','r_5','r_6','r_7','r_8','b_1','b_2','b_3','b_4','b_5','b_6','b_7','b_8' );
}

//Create Jumpers
function ChangeJumper(Name,i){


    if(Name == "1"){
        //red jumper
        device.classList.add('r_'+i);
    }
    else{
        //black jumper
        device.classList.add('b_'+i);
    }
    
}

//Returns Pin Name
function GetPinName(Tag,i,Volt){


    if (Tag=="0"){
        return "NC"
    }
    else if (Tag=="1"){
        ChangeJumper(Tag,i)
        if(Volt!=undefined){
            return "VCC=" + (Volt*0.001).toFixed(1) + "V"}
        else{
            return "VCC"
        }
    }
    else if (Tag=="2"){
        ChangeJumper(Tag,i)
        return "GND"
    }
    else if(Tag=="3"){
        return 'MOSI'
    }
    else if(Tag=="4"){
        return 'MISO'
    }
    else if(Tag=="5"){
        return 'CS'
    }
    else if(Tag=="6"){
        return 'SCK'
    }
    else if(Tag=="7"){
        return 'TX'
    }
    else if(Tag=="8"){
        return 'RX'
    }
    else if(Tag=="9"){
        return 'RTS'
    }
    else if(Tag=="10"){
        return 'DTR'
    }
    else if(Tag=="11"){
        return 'CAP-DTR'
    }
    else if(Tag=="12"){
        return 'DIO'
    }
    else if(Tag=="13"){
        return 'RST'
    }
    else if(Tag=="14"){
        return 'CLK'
    }
    else if(Tag=="15"){
        return 'SCL'
    }
    else if(Tag=="16"){
        return 'SDA'
    }
    else if(Tag=="17"){
        return 'CLK'
    }
    else if(Tag=="18"){
        return 'CMD'
    }
    else if(Tag=="19"){
        return 'DATA0'
    }
    else if(Tag=="20"){
        return 'DATA1'
    }
    else if(Tag=="21"){
        return 'DATA2'
    }
    else if(Tag=="22"){
        return 'DATA3'
    }
    else if(Tag=="23"){
        return 'ANALOG_IN 1'   
    }
    else if(Tag=="24"){
        return 'ANALOG_IN 2'
    }
    else if(Tag=="25"){
        return 'DIGITAL_IN 1'
    }
    else if(Tag=="26"){
        return 'DIGITAL_IN 2'
    }
    else if(Tag=="28"){
        return 'ΙΟ0'
    }
    else if(Tag=="29"){
        return 'EN'
    }
    else if(Tag=="44"){
        return 'DEBUG1'
    }
    else if(Tag=="45"){
        return 'DEBUG2'
    }
    else{
        return 'DEBUG'
    }

}


//Returns Pin Tag Number
export function GetPinTag(Name){


    if(Name == "NC"){
        return 0;
    }
    else if(Name == "VCC"){
        return 1;
    }
    else if(Name == "GND"){
        return 2;
    }
    else if(Name == 'MOSI'){
        return 3;
    }
    else if(Name == 'MISO'){
        return 4;
    }
    else if(Name == 'CS'){
        return 5;
    }
    else if(Name == 'SCK'){
        return 6;
    }
    else if(Name == 'TX'){
        return 7;
    }
    else if(Name == 'RX'){
        return 8;
    }
    else if(Name == 'RTS'){
        return 9;
    }
    else if(Name == 'DTR'){
        return 10;
    }
    else if(Name == 'CAP-DTR'){
        return 11;
    }
    else if(Name == 'DIO'){
        return 12;
    }
    else if(Name == 'RST'){
        return 13;
    }
    else if(Name == 'CLK'){
        return 14;
    }
    else if(Name == 'SCL'){
        return 15;
    }
    else if(Name == 'SDA'){
        return 16;
    }
    else if(Name == 'CLK'){
        return 17;
    }
    else if(Name == 'CMD'){
        return 18;
    }
    else if(Name == 'DATA0'){
        return 19;
    }
    else if(Name == 'DATA1'){
        return 20;
    }
    else if(Name == 'DATA2'){
        return 21;
    }
    else if(Name == 'DATA3'){
        return 22;
    }
    else if(Name == 'ANALOG_IN 1'){
        return 23;
    }
    else if(Name == 'ANALOG_IN 2'){
        return 24;
    }
    else if(Name == 'DIGITAL_IN 1'){
        return 25;
    }
    else if(Name == 'DIGITAL_IN 2'){
        return 26;
    }
    // else if(Name == 'DIGITAL_IN 3'){
    //     return 27;
    // }
    else if(Name == 'ΙΟ0'){
        return 28;
    }
    else if(Name == 'EN'){
        return 29;
    }
    else if(Name == 'DEBUG1'){
        return 44;
    }
    else if(Name == 'DEBUG2'){
        return 45;
    }
    else if(Name == 'DEBUG'){
        return 46;
    }
    else{
        connection.wuartLog('wrong pin name')
    }

}