import * as TabsModule from '../TabsModule.js'
import * as SaveModule from '../SaveModule.js'
import * as StyleModules from '../StylingModules.js'
import * as WuartUpdate from '../Wuart_UpdateStatusModule.js'


import * as Api from '../Api.js'
import * as connection from '../../connection.js'
// import * as General from '../GeneralModule.js'
export let uart_flag=false;
export let Send = document.querySelector('#uart-content #command button')
export let Form = document.querySelector('#uart-content form')
export let TextWrapper = document.getElementById('uart_response')
export let Text = document.querySelector('#uart_response ul')
export let InputText = document.getElementById('uart_command')
export let ToggleLog = document.getElementById('create_log')
export let BaudrateSelect = document.getElementById('uart_baudrate_select');
export let BaudApply = document.getElementById('baud_apply');
let autoscroll = document.getElementById('autoscroll');
let timestamp = document.getElementById('timestamp');

export let StopListening = document.getElementById('stop_listening')
export let UartDebuggerBoolean 
export let baudrate = document.getElementById('BaudOptions')
let clearScreen = document.getElementById('clear_terminal');
let loop 
let Update_BaudRate = document.getElementById('UpdateBaud')
let max_lines = 2000

let text_size_buttons = document.querySelectorAll('div.uart-content .inner_content .controls .text_size button');

for (let button_index = 0; button_index < text_size_buttons.length; button_index++) {
   let button =  text_size_buttons[button_index];
   button.addEventListener('click', (e) => {
        e.preventDefault();
        let id = e.target.id;
        changeFontSize(id);
   })
    
}
function changeFontSize(id){
    connection.wuartLog(id);
    TextWrapper.classList.remove('text_small', 'text_medium', 'text_large');
    for (let button_index2 = 0; button_index2 < text_size_buttons.length; button_index2++) {
        text_size_buttons[button_index2].classList.remove('font-active');
    }
    let active = document.getElementById(id);
    active.classList.add('font-active');
    TextWrapper.classList.add(id);
}



// Update_BaudRate.addEventListener('click',async()=>{
    
//     connection.wuartLog(Api.Update_BaudRate_command + baudrate.value)
    
//     await Api.WriteMessage(Api.Update_BaudRate_command + baudrate.value)
    
// })

export function setDefaultBaud(){
    BaudrateSelect.value = connection.BaudRate;
}

BaudrateSelect.addEventListener('change', (e) => {
    if(BaudrateSelect.value != connection.BaudRate){
        BaudApply.disabled = false;
    }else{
        BaudApply.disabled = true;
    }
});

async function changeBaudAndDis(){
    connection.wuartLog('disconnecting before changing baudrate')
    StyleModules.site_wrapper.classList.remove('device_show');
    WuartUpdate.ResetJumpers();    
    
    await ChangeBaudrate(BaudrateSelect.value)
    .then(()=>{
        connection.SetBaudRate(BaudrateSelect.value);
        connection.wuartLog('baudrate changed')
        connection.SetSelectBaudRate();
        
        connection.Disconnect.click();
        setTimeout(()=>{
            // connection.connect();
            connection.changeConnectionMessage('New BaudRate Value: '+BaudrateSelect.value+'. Click CONNECT to connect with the new Baudrate.');
            
            
        }, 1000)
        // connection.CloseConnection();
        // StyleModules.ShowConnectButton();
        
    })
    .catch(() => {
        connection.wuartLog('Could Not Change Baudrate')
        alert("Could Not Change Baudrate'");
    })
}

BaudApply.addEventListener('click', async(e) => {
    e.preventDefault();
    if(StopListening.classList.contains('on')){
        await stopListeningToPort()
        .then(async()=>{
            await StopListen()
            .then(()=>{
                changeBaudAndDis()
            })
        })
        // setTimeout(()=>{
        //     changeBaudAndDis()
        // }, 3000)
        

    }else{
        // Listening is stopped
        changeBaudAndDis()

    }
    
});


export function SetLoopFalse(){
    connection.wuartLog('uart loop false')
    loop = false
}
export function SetLoopTrue(){
    connection.wuartLog('uart loop false')
    loop = true
}

ToggleLog.addEventListener('click' , (e)=>{
    e.preventDefault()
    connection.wuartLog(e.target);
    if(ToggleLog.textContent == 'START LOG'){
        SaveModule.CreateUartDebuggerLog()
        ToggleLog.textContent = 'STOP LOG';
        ToggleLog.classList.add("start");
    }else{
        SaveModule.resetUartDebuggerLog();
        connection.wuartLog(SaveModule.UartDebuggerLog)
        ToggleLog.textContent = 'START LOG';
        ToggleLog.classList.remove('start');
    }
    
})

//Reset Fields
export function ResetFields(){
    Text.innerHTML="";
    InputText.value="";
}

timestamp.addEventListener('change', function() {
    if (this.checked) {
        Text.classList.remove('hidetimestamp');
    } else {
        Text.classList.add('hidetimestamp');
    }
  });

function GetUARTtimeStamp(){

    var today = new Date();
    var time = String(today.getHours()).padStart(2, '0') + ":" + String(today.getMinutes()).padStart(2, '0') + ":" + String(today.getSeconds()).padStart(2, '0') + "." + String(today.getMilliseconds()).padStart(3, '0');
    return '<span class="timestamp">' + time + '</span>';
    
}

export function ShowText(message_array, command = false){
    let logappend = '';
    // let formatted_message = '<li ';
    connection.wuartLog(message_array)
    connection.wuartLog('length:'+message_array.length)
    let lastlieol = false;
    let lastli = Text.lastChild;
    if(lastli !== null){
        if(lastli.classList.contains('eol')){
            lastlieol = true;
        }
    }else{
        lastlieol = true;
    }
    connection.wuartLog('lastlieol:'+lastlieol)
    for (let index = 0; index < message_array.length; index++) {
        let message = message_array[index];
        // message = message.trim();
        message = message.replace("\t", "&emsp;&emsp;");
        if(command || index > 0 || (index == 0 && lastlieol)){
            if(message == ""){
                //eol spotted, add to class
                if(Text.lastChild != null){
                    Text.lastChild.classList.add('eol');
                }
                
            }else{
                connection.wuartLog('command:'+command)
                connection.wuartLog('index:'+index)
                let newli = document.createElement("li");
                if(command){
                    // logappend = '\n';
                    newli.classList.add("command", "eol");
                }
                
                SaveModule.UartDebuggerUpdateLog(message)
                if(message == ""){
                    connection.wuartLog('empty message');
                    message = '&nbsp';
                }
                let formatted_message = GetUARTtimeStamp() + '<span>' +message+'</span>';
                newli.innerHTML = formatted_message;
                Text.appendChild(newli);
            }
        }else{
            connection.wuartLog('index 0');
            connection.wuartLog(Text.lastChild.lastChild);
            Text.lastChild.lastChild.innerHTML += message;
        }
        
    }
    if(autoscroll.checked){
        TextWrapper.scrollTop = TextWrapper.scrollHeight;
    }
    if(Text.children.length > max_lines){
        Text.firstElementChild.remove();  
    }
    
    
}

clearScreen.addEventListener('click', (e)=> {
    e.preventDefault();
    clearscreen()
    
})

function clearscreen(){
    connection.wuartLog('clear screen')
    TextWrapper.innerHTML = "<ul></ul>";
    Text = document.querySelector('#uart_response ul')
}


Form.addEventListener('submit', async(e)=>{
    e.preventDefault();
    if(Form.classList.contains('active')){
        if(InputText.value.trim() == 'w_clear'){
            clearscreen()
            return;
        }
        connection.wuartLog('send clicked');
        connection.wuartLog('command: '+InputText.value);
        let temp_array = [];
        temp_array.push(InputText.value);
        ShowText(temp_array, true)
        Api.WriteMessage(InputText.value);
        InputText.value = ""
    }else{
        //do nothing
    }
    //await StopListen().then(()=>{});
   
        
})


StopListening.addEventListener('click',()=>{
    
    stopListeningToPort();
})

async function stopListeningToPort(){
    if(StopListening.classList.contains('on')){
        //was listening, now it will switch off
        StopListening.classList.add('loading');
        SetLoopFalse()
        // await StopListen()
        // .then(()=>{
        StopListening.classList.remove('on');
        StopListening.querySelector('span').textContent = 'START LISTENING'
        StopListening.classList.remove('loading');            
        // })
    }else{
        StopListening.classList.add('loading');
        await StopListen()
        .then(()=>{
            //wasnt listening, now it will switch on
            ContinuousListenUart()
            resetListeningButtons()
            StopListening.classList.remove('loading');
        })
    }
}

export function resetListeningButtons(){
    Send.disabled = false;
    StopListening.querySelector('span').textContent = 'STOP LISTENING'
    Form.classList.add('active');
    StopListening.classList.add('on');
}


export async function ChangeBaudrate(newbaudrate = connection.BaudRate){
    connection.wuartLog('ChangeBaudrate');
    // BatteryMonitor.SetLoopFalse();
    // Api.Waiting.className="Waiting_Active"
    connection.wuartLog(Api.Update_BaudRate_command+newbaudrate);
    return new Promise(async(resolve,reject) =>{
        await Api.UpdateBaudrateHandShake(Api.Update_BaudRate_command+newbaudrate)
        .then(()=>{
            connection.wuartLog('Baudrate Changed')
            resolve();
        })
        .catch((err)=> {
            connection.wuartLog('Baudrate did not change')
            reject();
            // alert(err)
        })
    })
}

export function StopListen(){
    
    return new Promise(async(resolve) =>{  

        await connection.ReConnect().then(()=>{connection.wuartLog("Reconnected")});
        setTimeout(()=>{
            connection.wuartLog('stopped listening')
            resolve();
        },2000)

    }

    )
}

export function reBoot(){
    
    return new Promise(async(resolve) =>{  

        await connection.ReOpenPort().then(()=>{connection.wuartLog("Reopened Port")});
        setTimeout(()=>{
            connection.wuartLog('stopped listening - port opened')
            resolve();
        },2000)

    }

    )
}

export function disableChangeBaud(){
    // BaudrateSelect.disabled = true;
    BaudApply.disabled = true;
}


export function ContinuousListenUart(){
    

    let Word = ""
    let Buffer = ""
    loop = true
    return new Promise(async(resolve,reject) =>{
        connection.wuartLog("Listen")
        
        while(loop){
            
            const {value,done} = await connection.reader.read()
            if(loop){
                Word += Buffer
                Word += value
                connection.wuartLog('value:'+value)
                // connection.wuartLog('message:'+Word)
                
                let Vals = ValidateMessage(Word);
                Word = Vals[0]
                Buffer = Vals[1]
                
                if(Array.isArray(Word) &&  Word[0] != undefined){
                    connection.wuartLog('Will Show line')
                    ShowText(Word)
                    Word = ""
                }
            }
                
        
            
        }
        connection.wuartLog('stop continuous listening')
       resolve()
    })
     
}

function ValidateMessage(Word){
    if((Word.match(/\n/g)||[]).length > 0){
        connection.wuartLog('matches newline');
        
        if(Word.lastIndexOf('\n') != -1){
            connection.wuartLog('found newline');
            let beforearray = Word.split('\n');
            let after = "";
            // let before = Word.slice(0, Word.lastIndexOf('\n'));
            // let beforearray = before.split('\n');
            // let after = Word.slice(Word.lastIndexOf('\n') + 1);
            return [beforearray, after]
        }
    }else{
        let beforearray = Word.split('\n');
        let after = "";
        return [beforearray, after]
    }
    let buffertemp = "";
        
    return [Word, buffertemp]
}
