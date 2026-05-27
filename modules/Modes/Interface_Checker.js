import * as Api from '../Api.js'
import * as connection from '../../connection.js'
//Define Variables
let spiConfigform = document.querySelector('#interface-checker-spi .inner_content form.configform');
let i2cConfigform = document.querySelector('#interface-checker-i2c-builder .inner_content form.configform');


//Send Command
async function Send_Command(button){
    if(button.classList.contains('i2c_scan')){
        //I2C Scanner

        // await UartDebugger.StopListen()
        ShowText(button, 'Scanning...', true);
        await Api.WriteMessage(Api.I2C_Scan)
        .then(async()=>{
            
            let Addresses = await ListenMessageInterfaceChecker()
            PrintI2CValues(button, Addresses[1])
            
        })
        .catch(async()=>{
            
            ShowText(button, 'No Response');
            
        })
        // await UartDebugger.StopListen()
        
    }else if(button.classList.contains('spi_send')){
        //SPI

        let StringtoSend = ""
        let length = button.parentElement.querySelector('.length');
        // let lengthval = convertHexTwoDigit(length.value);
        let data = button.parentElement.querySelector('.value');
        let data_array = data.value.split(',');
        let fourDigitData = convertHexDataSPI(data.value);
        let StringtoShow = "S:" + data_array.length + "," + fourDigitData + ",R:" + length.value;
        StringtoSend = Api.SPI_Data + StringtoShow
        ShowText(button, StringtoShow, true);
        // await Api.WriteMessage(InputText.value);
        await Api.InterfaceCheckerResponseHandShake(button, StringtoSend, length.value, 5000)
        .then(()=>{
            connection.wuartLog('SPI Response Received')
        })
        .catch(()=>{
            connection.wuartLog('No SPI Response Received')
        })
        
    }else{
        //I2C
        let StringtoSend = ""
        let device = button.parentElement.querySelector('.device_address');
        let deviceval = convertHexTwoDigit(device.value);
        let length = button.parentElement.querySelector('.length');
        let target = button.parentElement.querySelector('.target_address');
        let targetval = convertHexTwoDigit(target.value);
        let data = button.parentElement.querySelector('.value');
        let twoDigitData = convertHexDataI2C(data.value);
        let StringtoShow = deviceval + "," +targetval + "," + twoDigitData + "," + length.value;
        StringtoSend = Api.Registes_command + StringtoShow
        ShowText(button, StringtoShow, true);
        await Api.InterfaceCheckerResponseHandShake(button, StringtoSend, length.value, 5000)
        .then(()=>{
            connection.wuartLog('I2C Response Received')
        })
        .catch(()=>{
            connection.wuartLog('No I2C Response Received')
        })
            
    }
}


export function ShowText(button, message, command = false){
    let logappend = '';
    message = message.trim();
    message = message.replace("\t", "&emsp;&emsp;");
    let newli = document.createElement("li");
    // let formatted_message = '<li ';
    if(command){
        logappend = '\n';
        newli.classList.add("command");
        // formatted_message += 'class="command"';
    }
    if(message == ""){
        connection.wuartLog('empty message');
        message = '&nbsp';
    }
    let formatted_message = '<span>'+message+'</span>';
    newli.innerHTML = formatted_message;
    let TextArea = button.parentElement.parentElement.querySelector('.textarea ul');
    // TextArea.innerHTML = formatted_message + TextArea.innerHTML;
    TextArea.appendChild(newli);
    let TextWrapper = button.parentElement.parentElement.querySelector('.textarea');
    TextWrapper.scrollTop = TextWrapper.scrollHeight;
}



          
export function ResetFields(){
    let length_fields = document.querySelectorAll('.interface-checker form .length');
    for (let i = 0; i < length_fields.length; i++) {
        length_fields[i].value = '';        
    }
    let device_address_fields = document.querySelectorAll('.interface-checker form .device_address');
    for (let j = 0; j < device_address_fields.length; j++) {
        device_address_fields[j].value = '';        
    }
    let target_address_fields = document.querySelectorAll('.interface-checker form .target_address');
    for (let k = 0; k < target_address_fields.length; k++) {
        target_address_fields[k].value = '';        
    }
    let value_fields = document.querySelectorAll('.interface-checker form .value');
    for (let l = 0; l < value_fields.length; l++) {
        value_fields[l].value = '';        
    }
    let textareas = document.querySelectorAll('.interface-checker form .textarea ul');
    for (let m = 0; m < textareas.length; m++) {
        textareas[m].innerHTML = '';        
    }
    //reset dropdowns?
}

//for I2C scanner
export function PrintI2CValues(button, Values){
    
    let Addresses = Values.split(':')
    connection.wuartLog(Addresses);
    let counter = 1
    Addresses = Addresses[1].split(',')
    if(Addresses.length > 1 || (Addresses.length == 1 && Addresses[0].trim() != '')){
        Addresses.forEach((address) =>{
            ShowText(button, `Device ${counter}: ` + address + '\n');
            counter += 1
        })
    }else{
        ShowText(button, 'No Addresses found.');
    }
    

}

async function ListenMessageInterfaceChecker(){
    var Addresses = ""
    return new Promise(async(resolve,reject)=>{
        while(!Addresses.includes("END")){
            await connection.reader.read().then(({value,done})=>{

                if(value!= undefined){
                    Addresses += value
                }
            })
        }
        resolve([true,Addresses])
    })
}

export function ShowResponseValues(button, Value){
    let Response = Value.split('-')[1]
    ShowText(button, Response)
    return
}


let send_command_forms = document.querySelectorAll('.interface-checker .inner_content form.sendform');

for (let index = 0; index < send_command_forms.length; index++) {
    send_command_forms[index].addEventListener('submit', (e)=>{
        e.preventDefault();
        connection.wuartLog(e.target);
        let button = e.target.querySelector('button');
        connection.wuartLog(button);
        Send_Command(button);
    });
    
}
let interfaceforms = document.querySelectorAll('.interface-checker .inner_content form input');
for (let j = 0; j < interfaceforms.length; j++) {
    interfaceforms[j].addEventListener('input', (e) => {
        e.preventDefault();
        let form = e.target.closest("form");
        let sendcommand = form.querySelector('.send_command');
        let inputs = form.querySelectorAll('input');
        let validation = ValidateForm(inputs);
        if(validation){
            sendcommand.disabled = false;
            connection.wuartLog('validation true')
        }else{
            sendcommand.disabled = true;
            connection.wuartLog('validation false')
        }
    })
}


spiConfigform.addEventListener('submit', (e)=>{
    e.preventDefault();
    let spi_clock = spiConfigform.querySelector('#spi_clock').value;
    let byte_order = spiConfigform.querySelector('#byte_order').value;
    let spi_mode = spiConfigform.querySelector('#spi_mode').value;

    if(spi_clock != '' && byte_order != '' & spi_mode!= ''){
        spiConfigform.querySelector('button.config span').textContent = '...';
        let command_string = 'F:' + spi_clock + ',B:' + byte_order + ',M:' + spi_mode
        spiConfigForm(command_string);
    }


})
i2cConfigform.addEventListener('submit', (e)=>{
    e.preventDefault();
    connection.wuartLog('submit i2cConfigform')
    let i2c_frequency = i2cConfigform.querySelector('#i2c_frequency').value;
    connection.wuartLog(i2c_frequency)
    if(i2c_frequency != ''){
        i2cConfigform.querySelector('button.config span').textContent = '...';
        i2cConfigForm(i2c_frequency);
    }


})


function ValidateForm(inputs){
    let result = true;
    for (let index = 0; index < inputs.length; index++) {
        connection.wuartLog('input validation: '+index)
        let trimmedvalue = inputs[index].value.replace(/ /g,'');
        let validate_type = inputs[index].dataset.validation;
        inputs[index].classList.remove('nonvalid');
        
        switch(validate_type) {
            case 'hex':
                if(!ValidateHex(trimmedvalue)){
                    inputs[index].classList.add('nonvalid');
                    connection.wuartLog('hex validation failed')
                    result = false;
                };
                break;
            case 'hexdata':
                if(!ValidateHexData(trimmedvalue)){
                    inputs[index].classList.add('nonvalid');
                    connection.wuartLog('hexdata validation failed')
                    result = false;
                };
                break;
            case 'int255':
            if(!ValidateInt255(trimmedvalue)){
                inputs[index].classList.add('nonvalid');
                connection.wuartLog('hexdata validation failed')
                result = false;
            };
            break;
            default:
                if(!ValidateHex(trimmedvalue)){
                    inputs[index].classList.add('nonvalid');
                    connection.wuartLog('default validation failed')
                    result = false;
                };
        }
    }
    
    return result
    
}

function ValidateHex(value){
    connection.wuartLog('ValidateHex')
    let regEx = /^[0-9a-fA-F]+$/;
    let isHex = regEx.test(value.toString());
    return isHex
}

function ValidateInt255(value){
    connection.wuartLog('ValidateInt')
    let regEx = /^[0-9]+$/;
    let isInt = regEx.test(value.toString());
    if(isInt && (value >= 0 && value <=255)){
        return true;
    }
    return false;
}

function ValidateHexData(value){
    connection.wuartLog('ValidateHexData')
    let data_array = value.split(',');
    for (let index = 0; index < data_array.length; index++) {
        connection.wuartLog('Data split: '+index);
        
        let newvalue =  data_array[index];
        connection.wuartLog('Data Value: '+newvalue);
        
        if(newvalue.length == 2){
            connection.wuartLog('Length 2');
            if(!ValidateHex(newvalue)){
                return false;
            }
        }else if(newvalue.length == 4){
            connection.wuartLog('Length 4');
            let code = newvalue.slice(0,2);
            let rest = newvalue.slice(2);
            if(code != '0x' || !ValidateHex(rest)){
                return false;
            }
        }else{
            return false;
        }
    }
    return true
}

async function spiConfigForm(command_string){
    let button = spiConfigform.querySelector('button.config span')
    await Api.InterfaceCheckerConfig(Api.SPI_Config + command_string)
    .then(()=>{
        button.textContent = 'OK!';
        setTimeout(()=>{
            button.textContent = 'CONFIG';
        },3000)
    })
    .catch(()=>{
        button.textContent = 'ERROR!';
        setTimeout(()=>{
            button.textContent = 'CONFIG';
        },3000)
    })
    
}

function convertHexDataI2C(value){
    let trimmed_data = value.replace(/ /g,'');
    let value_array = trimmed_data.split(",");
    let new_array = [];
    for (let index = 0; index < value_array.length; index++) {
        let thisvalue = value_array[index];
        if(thisvalue.length == 4){
            let rest = thisvalue.slice(2);
            new_array.push(rest);
        }else{
            new_array.push(thisvalue);
        }
        
    }
    return new_array.toString()
}

function convertHexDataSPI(value){
    let trimmed_data = value.replace(/ /g,'');
    let value_array = trimmed_data.split(",");
    let new_array = [];
    for (let index = 0; index < value_array.length; index++) {
        let thisvalue = value_array[index];
        if(thisvalue.length == 2){
            let rest = "0x"+thisvalue;
            new_array.push(rest);
        }else{
            new_array.push(thisvalue);
        }
        
    }
    return new_array.toString()
}
function convertHexTwoDigit(value){
    let trimmed_data = value.replace(/ /g,'');
    if(trimmed_data.length == 1){
        trimmed_data = "0"+trimmed_data;
    }
        
    return trimmed_data
}


async function i2cConfigForm(command_string){
    let button = i2cConfigform.querySelector('button.config span')
    connection.wuartLog(Api.I2C_Config + command_string)
    await Api.InterfaceCheckerConfig(Api.I2C_Config + command_string)
    .then(()=>{
        button.textContent = 'OK!';
        setTimeout(()=>{
            button.textContent = 'CONFIG';
        },3000)
    })
    .catch(()=>{
        button.textContent = 'ERROR!';
        setTimeout(()=>{
            button.textContent = 'CONFIG';
        },3000)
    })
}






