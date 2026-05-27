
var dialog = require('@electron/remote').dialog;
var remote = require('@electron/remote');
var fs = require('fs')

import * as connection from '../../connection.js'





//Reset Fields
export function ResetFields(){

    let binary_path_input = document.querySelectorAll('.device-programmer .firmware_path');
    for (let i = 0; i < binary_path_input.length; i++) {
        binary_path_input[i].value = '';        
    }
    let script_path_input = document.querySelectorAll('.device-programmer .script_path');
    for (let j = 0; j < script_path_input.length; j++) {
        script_path_input[j].value = '';        
    }
    let argument = document.querySelectorAll('.device-programmer .argument');
    for (let l = 0; l < argument.length; l++) {
        argument[l].value = '';        
    }
    let textareas = document.querySelectorAll('.device-programmer .textarea ul');
    for (let k = 0; k < textareas.length; k++) {
        textareas[k].innerHTML = '';        
    }
    let send_command = document.querySelectorAll('.device-programmer .send_command');
    for (let m = 0; m < send_command.length; m++) {
        send_command[m].disabled = true;        
    }
    let clipboard = document.querySelectorAll('.device-programmer .clipboard');
    for (let n = 0; n < clipboard.length; n++) {
        clipboard[n].disabled = true;        
    }
    let disconnect_option = document.querySelectorAll('.device-programmer .disconnect_option');
    for (let o = 0; o < disconnect_option.length; o++) {
        disconnect_option[o].disabled = true;        
    }

}


//Search for Binary Path
function FindBinaryPath(input){
    dialog.showOpenDialog(remote.getCurrentWindow(), {
        properties: ["openFile", "multiSelections"]
    }).then(result => {
        if (result.canceled === false) {
            connection.wuartLog("Selected binary file paths:" + result.filePaths)
           
            // BinaryPath = result.filePaths;
            input.value = result.filePaths;
            ValidateForm(input);

            
        }
    }).catch(err => {
        connection.wuartLog(err)
    });
}
// Search for Uart Path
function FindScriptPath(input){
    dialog.showOpenDialog(remote.getCurrentWindow(), {
        properties: ["openFile", "multiSelections"]
    }).then(result => {
        if (result.canceled === false) {
            connection.wuartLog("Selected file paths:")
            // ScriptPath = result.filePaths;
            input.value = result.filePaths;
            ValidateForm(input);

            
        }
    }).catch(err => {
        connection.wuartLog(err)
    });
}

function ValidateForm(input){
    let form = input.closest("form");
    let sendcommand = form.querySelector('.send_command');
    let inputs = form.querySelectorAll('input');
    let validation = true;
    for (let index = 0; index < inputs.length; index++) {
        if(inputs[index].value == ''){
            validation = false;
            
        }
        
    }
    if(validation){
        sendcommand.disabled = false;
        connection.wuartLog('validation true')
    }else{
        sendcommand.disabled = true;
        connection.wuartLog('validation false')
    }
}

//Copy to Clipboard
function CopyToClipBoard(button){
    let target = button.dataset.target;
    let r = document.createRange();
    r.selectNode(document.getElementById(target).querySelector('ul li'));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(r);
    try {
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
        connection.wuartLog('Successfully copied!');
        button.textContent = 'Copied!';
        setTimeout(() => {
            button.textContent = 'Copy to Clipboard';
        }, 3000);

    } catch (err) {
        connection.wuartLog('Unable to copy!');
        button.textContent = 'Error!';
        setTimeout(() => {
            button.textContent = 'Copy to Clipboard';
        }, 3000);
    }
    
}
//Creates Python  Command
function showCommand(showbutton){
    connection.wuartLog(showbutton);
    let ScriptPath = showbutton.parentElement.parentElement.querySelector('.script_path .script_path');
    let Arguments = showbutton.parentElement.parentElement.querySelector('.arguments .argument');
    let BinaryPath = showbutton.parentElement.parentElement.querySelector('.firmware_path .firmware_path');
    let FullPath = '' + ScriptPath.value + ' ' + Arguments.value + ' ' + BinaryPath.value + '';
    let textarea = showbutton.parentElement.parentElement.querySelector('.textarea ul');
    let clipboard = showbutton.parentElement.parentElement.querySelector('.clipboard');
    let disconnect = showbutton.parentElement.parentElement.querySelector('.disconnect_option');
    let message = '<li><span>' + FullPath + '</span></li>';
    textarea.innerHTML = message;
    clipboard.disabled = false;
    disconnect.disabled = false;

}
//Flash Device
function FlashDevice(){

}

let binary_path_buttons = document.querySelectorAll('.device-programmer .firmware_browse');
for (let i = 0; i < binary_path_buttons.length; i++) {
    binary_path_buttons[i].addEventListener("click" , (e)=>{
        e.preventDefault();
        let input = e.target.previousElementSibling;
        FindBinaryPath(input);  
    });
    
}

let script_path_buttons = document.querySelectorAll('.device-programmer .script_browse');
for (let j = 0; j < script_path_buttons.length; j++) {
    script_path_buttons[j].addEventListener("click" , (e)=>{
        e.preventDefault();
        let input = e.target.previousElementSibling;
        FindScriptPath(input);  
    });
    
}
let argument_inputs = document.querySelectorAll('.device-programmer .argument');
for (let m = 0; m < argument_inputs.length; m++) {
    argument_inputs[m].addEventListener("input" , (e)=>{
        ValidateForm(argument_inputs[m]);
    });
    
}
let disconnect_options = document.querySelectorAll('.device-programmer .disconnect_option');
for (let n = 0; n < disconnect_options.length; n++) {
    disconnect_options[n].addEventListener("click" , (e)=>{
        e.preventDefault();
        ResetFields();
        connection.Disconnect.click();
    });
    
}
let show_command_buttons = document.querySelectorAll('.device-programmer .send_command');
for (let k = 0; k < show_command_buttons.length; k++) {
    show_command_buttons[k].addEventListener("click" , (e)=>{
        e.preventDefault();
        let button = e.target;
        connection.wuartLog(e.target)
        showCommand(button);
        // alert("Copy the Command and then disconnect")
    });
    
}

let copyclipboard_buttons = document.querySelectorAll('.device-programmer .clipboard');
for (let l = 0; l < copyclipboard_buttons.length; l++) {
    copyclipboard_buttons[l].addEventListener("click" , (e)=>{
        e.preventDefault();
        let button = e.target;
        CopyToClipBoard(button);
        connection.wuartLog(button);
    });
    
}


