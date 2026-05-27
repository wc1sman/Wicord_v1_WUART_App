// import * as BatteryMonitor from './Modes/Battery_Monitor.js'

export let ConnectButton=document.getElementById('connect');
export let DisconnectButton=document.getElementById('Disconnect');
export let TabsSection = document.getElementById('Tabs_Section');
export let MainBody = document.getElementById('main_body');
export let UartCategory = document.getElementById('uart_category');
export let UartFlasherCategory = document.getElementById('uart_flasher_category');
export let Esp32FlasherCategory =document.getElementById('esp32_flasher_category');
export let SwdFlasherCategory = document.getElementById('swd_flasher_category');
export let UsbCategory = document.getElementById('usb_category');
export let DeviceProgammer = document.getElementById('deviceprogrammer');
export let InterfaceChecker = document.getElementById('interfacechecker');
export let SdCard = document.getElementById('sd_card');
export let ConfigButton = document.getElementById('Config');
export let UartFlasherModeButton = document.getElementById('UART_Flasher');
export let Esp32ModeButton = document.getElementById('ESP32_Programer');
export let SwdFlasherModeButton = document.getElementById('SWD_Flasher_Mode');
export let ArduinoFlasherMode = document.getElementById('Arduino_Flasher');
export let I2CMode = document.getElementById('I2C');
export let SPIMode = document.getElementById('SPI');
export let SdCardCategory = document.getElementById('sd_card_category');
export let SDIOMode = document.getElementById('SDIO');
export let SPI_SD_Mode = document.getElementById('SPI-sd');
export let I_O_Checker = document.getElementById('I_o_category');
export let Battery_Monitor = document.getElementById('battery_monitor_category');
export let battery_monitor_figure =document.getElementById('battery_monitor')
export let UartSubMenu = document.getElementById('new_section')
export let InfoButton = document.getElementById('Info')
export let DtrButton = document.getElementById('dtr')
export let CapDtrButton = document.getElementById('cap-dtr')
export let Hz1_button = document.getElementById('1Hz')
export let Hz10_button = document.getElementById('10Hz')
export let SPI_Dropdowns = document.getElementById('spi_dropdown')
export let site_wrapper = document.getElementById('site_wrapper')
export let connection_label = document.getElementById('connection_label')
export let led_light = document.getElementById('led_light')
export let sd_label = document.querySelector('#sd_status span');
export let battery_wrapper = document.getElementById('battery_wrapper')
export let battery_status = document.getElementById('battery_status')
export let battery_voltage_value = document.querySelector('#battery_voltage_value');
export let battery_charge_value = document.querySelector('#battery_charge_value');
export let firmware_version = document.querySelector('#firmware_version span');



export function ToggleDevice(){
    if(site_wrapper.classList.contains('device_show')){
        site_wrapper.classList.remove('device_show');
    }else{
        site_wrapper.classList.add('device_show');
    }
}
export function LedStatusUpdate(Value){
    resetLedClasses();
    let ledclass = '';
    if(Value == 1){
        ledclass = 'red';
    }else if(Value == 2){
        ledclass = 'green';
    }
    else if(Value == 3){
        ledclass = 'blue';
    }
    else if(Value == 4){
        ledclass = 'purple';
    }
    else if(Value == 5){
        ledclass = 'yellow';
    }
    else if(Value == 6){
        ledclass = 'white';
    }
    led_light.classList.add(ledclass);
}
export function resetLedClasses(){
    led_light.classList.remove('red', 'green', 'blue', 'purple', 'yellow', 'white');
}
export function SdStatusUpdate(Value){
    if(Value == 0){
        site_wrapper.classList.remove('sd_on');
        sd_label.innerHTML = 'SD Card OFF';
    }else{
        site_wrapper.classList.add('sd_on');
        sd_label.innerHTML = 'SD Card ON';
    }
}
export function InternalBatteryStatusUpdate(Value){
    if(Value > 0){
        battery_voltage_value.innerHTML = Value + 'mV';
    }
}
export function ResetInternalBatteryStatus(){
    battery_voltage_value.innerHTML = '-';
}
export function FirmwareVersionUpdate(Value){
    firmware_version.innerHTML = Value;
}
export function ResetFirmwareVersion(){
    firmware_version.innerHTML = 'x.x.x';
}
export function ResetBatteryPercentage(){
    battery_charge_value.innerHTML = '-';
}
export function BatteryPercentageUpdate(Value){
    // Value = 15;
    if(Value >= 0 && Value <= 100){
        if(Value == 0){
            battery_charge_value.innerHTML = '0%';
        }else{
            battery_charge_value.innerHTML = Value + '%';
        }
        battery_wrapper.classList.remove('high', 'low', 'dying');
        if(Value <= 20){
            battery_wrapper.classList.add('low');
            battery_status.classList.add('dying');
        }else if(Value >= 80){
            battery_wrapper.classList.add('high');
            battery_status.classList.remove('dying');
        }
    }
}





//Shows Info Button
export function ShowInfoButton(){
    InfoButton.style.visibility = "visible"
    InfoButton.style.opacity = '1'
}

//Shows Connect Button and Hides Disconnect Button
export function ShowConnectButton(){
    site_wrapper.classList.add('disconnected');
    ConnectButton.classList.remove('hide');
    connection_label.innerHTML = 'Disconnected';

}

//Shows Disconnect Button and Hides Connect Button
export function ShowDisconnectButton(){
    site_wrapper.classList.remove('disconnected');
    connection_label.innerHTML = 'Connected';
    ConnectButton.classList.add('hide');
}

//Shows Disconnect Button and Hides Connect Button
export function ChangeTab(activetab){
    let tabs = document.querySelectorAll('.main_content');
    for (let index = 0; index < tabs.length; index++) {
        tabs[index].classList.remove('content_show');
    }
    document.querySelector('#'+activetab).classList.add('content_show');
    let navs = document.querySelectorAll('#navigation ul li button');
    for (let j = 0; j < navs.length; j++) {
        navs[j].classList.remove('active');
    }
    let nav_activetab = activetab;
    if(activetab == 'device-programmer-uart-cap-dtr' || activetab == 'device-programmer-esp32'){
        nav_activetab = 'device-programmer-uart-dtr';
    }
    if(activetab == 'interface-checker-i2c-scanner' || activetab == 'interface-checker-spi'){
        nav_activetab = 'interface-checker-i2c-builder';
    }
    document.querySelector("#navigation ul li [data-tab='"+nav_activetab+"']").classList.add('active');
}
