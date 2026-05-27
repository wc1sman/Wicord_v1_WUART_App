import * as Api from '../Api.js'
import * as connection from '../../connection.js'
import * as SaveModule from '../SaveModule.js'
import * as TabsModule  from '../TabsModule.js';





let Plot = document.querySelector('.i-o-checker .checker_options button.plot_toggle')


var ProcessedValue
var DesiredLength
var loop;
var PressedValue
var ButtonPressed = false
let requestedPressed = ""
var waitingforACK = false
var waitingtoSTOP = false

let SaveΙΟLog = document.getElementById('create_iochecker_log')
let ButtonToggle = document.querySelector('.i-o-checker .pin_group .pin_toggle')
let ButtonPress = document.querySelector('#plot5 .plot_header .pin')
// let PinErrorMessage = document.querySelector('#plot5 .plot_header .pin_error_message')
let Selected_Hz = document.querySelector('.i-o-checker .checker_options .form_options_group select.frequency')
let IO_Settings = document.querySelector('button.io_settings')
let MinMax1 = document.querySelector('#plot1 .form_options_group.min_max_range');
let MinMax2 = document.querySelector('#plot2 .form_options_group.min_max_range');
let MinMax_Form1 = document.getElementById('minmax_form1');
let MinMax_Form2 = document.getElementById('minmax_form2');
let Min1 = document.getElementById('min_1');
let Max1 = document.getElementById('max_1');
let Min2 = document.getElementById('min_2');
let Max2 = document.getElementById('max_2');

let checker_options = document.querySelector('.i-o-checker .checker_options')
let Value 
let AckValue
let BufferValue 
let AckBuffer
let Plotter1_Activate = document.querySelector('#plot1 .form_options_group .switch')
let Plotter1_Flag =  true
let Plotter2_Activate = document.querySelector('#plot2 .form_options_group .switch')
let Plotter2_Flag = true
let Plotter3_Activate = document.querySelector('#plot3 .form_options_group .switch')
let Plotter3_Flag = true
let Plotter4_Activate = document.querySelector('#plot4 .form_options_group .switch')
let Plotter4_Flag = true
let yaxis_min1 = 0;
let yaxis_min2 = 0;
let yaxis_max1 = 4096;
let yaxis_max2 = 4096;

IO_Settings.addEventListener('click', (e) => {
    e.preventDefault();
    if(IO_Settings.classList.contains('options_show')){
        checker_options.classList.add('hidechecker')
        IO_Settings.classList.remove('options_show')
    }else{
        IO_Settings.classList.add('options_show')
        checker_options.classList.remove('hidechecker')
 
    }
    
})

let layout_options = document.querySelectorAll('.i-o-checker .checker_options .layout_options button');
for (let indej = 0; indej < layout_options.length; indej++) {
    layout_options[indej].addEventListener('click', (e) => {
        e.preventDefault();
        let button = e.target;
        layoutMode(button);
    })   
}
function layoutMode(button){
    let ioChecker_div = button.parentElement.parentElement.parentElement.parentElement;
    ioChecker_div.classList.remove('layout_mode_row', 'layout_mode_column');
    if(button.classList.contains('layout_row')){
        ioChecker_div.classList.add('layout_mode_row');
    }else{
        ioChecker_div.classList.add('layout_mode_column');
    }
}

let grid_options = document.querySelectorAll('.i-o-checker .checker_options .grid_options button');
for (let indek = 0; indek < grid_options.length; indek++) {
    grid_options[indek].addEventListener('click', (e) => {
        e.preventDefault();
        let button = e.target;
        gridMode(button);
    })   
}
function gridMode(button){
    let ioChecker_div = button.parentElement.parentElement.parentElement.parentElement;
    ioChecker_div.classList.remove('grid_mode_off', 'grid_mode_5', 'grid_mode_10');
    if(button.id == 'grid_10'){
        ioChecker_div.classList.add('grid_mode_10');
    }else if(button.id == 'grid_5'){
        ioChecker_div.classList.add('grid_mode_5');
    }else{
        ioChecker_div.classList.add('grid_mode_off');
    }
}
ButtonToggle.addEventListener('click', (e) => {
    connection.wuartLog('Button Toggle clicked');
    e.preventDefault();
    let plot5 = document.querySelector('.i-o-checker #plot5');
    if(plot5.classList.contains('enabled')){
        ButtonToggle.classList.remove('toggle_open');
        plot5.classList.remove('enabled')
    }else{
        ButtonToggle.classList.add('toggle_open');
        plot5.classList.add('enabled')
    }
})

SaveΙΟLog.addEventListener('click' , (e)=>{
    connection.wuartLog(e.target);
    if(SaveΙΟLog.textContent == 'START LOG'){
        SaveModule.CreateΙΟDebuggerLog()
        SaveΙΟLog.textContent = 'STOP LOG';
        SaveΙΟLog.classList.add("start");
    }else{
        SaveModule.resetΙΟLog();
        SaveΙΟLog.textContent = 'START LOG';
        SaveΙΟLog.classList.remove('start');
    }
    
})

let myChart = document.querySelector('#plot1 canvas').getContext('2d');
let myChart2 = document.querySelector('#plot2 canvas').getContext('2d');
let myChart3 = document.querySelector('#plot3 canvas').getContext('2d');
let myChart4 = document.querySelector('#plot4 canvas').getContext('2d');
let myChart5 = document.querySelector('#plot5 canvas').getContext('2d');

Plotter1_Activate.addEventListener('click',(e)=>{
    e.preventDefault();
    connection.wuartLog('Plot 1 Switch Clicked')
    let plotter_wrapper = e.target.parentElement.parentElement.parentElement;
    connection.wuartLog(plotter_wrapper);
    let plot_label = e.target.parentElement.querySelector('label');
    if (Plotter1_Flag){
        Plotter1_Flag = false
        connection.wuartLog('Plot Disabled')
        plotter_wrapper.classList.remove('enabled');
    }
    else{
        Plotter1_Flag = true
        connection.wuartLog('Plot Enabled')
        plotter_wrapper.classList.add('enabled');
    }
})

Plotter2_Activate.addEventListener('click',(e)=>{
    e.preventDefault();
    connection.wuartLog('Plot 2 Switch Clicked')
    let plotter_wrapper = e.target.parentElement.parentElement.parentElement;
    let plot_label = e.target.parentElement.querySelector('label');
    if (Plotter2_Flag){
        Plotter2_Flag = false
        connection.wuartLog('Plot Disabled')
        plotter_wrapper.classList.remove('enabled');
    }
    else{
        Plotter2_Flag = true
        connection.wuartLog('Plot Enabled')
        plotter_wrapper.classList.add('enabled');
    }
})

Plotter3_Activate.addEventListener('click',(e)=>{
    e.preventDefault();
    connection.wuartLog('Plot 3 Switch Clicked')
    let plotter_wrapper = e.target.parentElement.parentElement.parentElement;
    let plot_label = e.target.parentElement.querySelector('label');
    if (Plotter3_Flag){
        Plotter3_Flag = false
        connection.wuartLog('Plot Disabled')
        plotter_wrapper.classList.remove('enabled');
    }
    else{
        Plotter3_Flag = true
        connection.wuartLog('Plot Enabled')
        plotter_wrapper.classList.add('enabled');
    }
})

Plotter4_Activate.addEventListener('click',(e)=>{
    e.preventDefault();
    connection.wuartLog('Plot 4 Switch Clicked')
    let plotter_wrapper = e.target.parentElement.parentElement.parentElement;
    let plot_label = e.target.parentElement.querySelector('label');
    if (Plotter4_Flag){
        Plotter4_Flag = false
        connection.wuartLog('Plot Disabled')
        plotter_wrapper.classList.remove('enabled');
    }
    else{
        Plotter4_Flag = true
        connection.wuartLog('Plot Enabled')
        plotter_wrapper.classList.add('enabled');
    }
})


var Chart_1,Chart_2,Chart_3,Chart_4,Chart_5





var Chartjs = require('chart.js')

ButtonPress.onmousedown = () => {
    ButtonDown()
}
document.onkeydown = (e) => {
    if(TabsModule.currentTab == "i-o-checker"){
        
        if (e.code === "Space") {
            e.preventDefault()
            if(!e.repeat){
                ButtonDown();
            }
        }
    }
}



async function ButtonDown(){
    if(loop && !ButtonPressed){
        //only if not already high
        // PinErrorMessage.classList.remove('pin_error_show');
       
        requestedPressed = true
        waitingforACK = true
        await Api.WriteMessage(Api.ButtonPressed_command)
    }
}

ButtonPress.onmouseup = () => {
    ButtonUp()
}

document.addEventListener('keyup', (e) => {
    if(TabsModule.currentTab == "i-o-checker"){
        e.preventDefault()
        if (e.code === "Space") {
            
            ButtonUp();
        }
    }
});

async function ButtonUp(){
    if(loop && ButtonPressed){
        //only if not already low
        // PinErrorMessage.classList.remove('pin_error_show');
        
        requestedPressed = false
        waitingforACK = true
        await Api.WriteMessage(Api.ButtonUnPressed_command)
    }
}


Plot.addEventListener('click' , async(e)=>{
    connection.wuartLog('master plot clicked')
    Plot.classList.add('loading');
    if(Plot.classList.contains('on')){
        connection.wuartLog('switching off')
        waitingtoSTOP = true;
        let command = Api.GPIO_Hz_command + '0:' + Selected_Hz.value
        SetLoopFalse()
        await Api.WriteMessage(command).then(async()=>{
            ResetButtons();
            connection.wuartLog('waitingtoSTOP false after write')
            waitingtoSTOP = false;
        })
    }else{
        connection.wuartLog('switching on')
        if(Selected_Hz.value != undefined){
            Selected_Hz.disabled = true;
            connection.wuartLog('Start with Selected Frequency: '+Selected_Hz.value)
            let command = Api.GPIO_Hz_command + '1:' + Selected_Hz.value
            SetLoopFalse()
            await Api.WriteMessage(command).then(async()=>{
                var Result = await Api.ListenMessage("R", 6000);
                connection.wuartLog(Result)
                if (Result=="Error"){
                    connection.wuartLog('Start IO Checker Error');
                    alert('There was an error Starting I/O Checker Plot')
                }
                else{
                    Plot.classList.add('on');
                    Plot.querySelector('span').textContent = 'STOP'
                    Plot.classList.remove('loading');
                    ResetCharts();
                    Start_Plotter();
                    
                }
                
            })

        }
        else{
            alert("Please Select Hz!")
        }
    }
    

    
})

export function SetLoopFalse(){
    loop = false
}


//Reset Charts fot I/O Checker
export function ResetCharts(){
    ButtonPressed = false
    requestedPressed = ""
    waitingforACK = false
    ButtonPress.classList.remove('high');
    ButtonPress.innerHTML = 'LOW';

    if(Chart_1 != undefined){
        try{
            Chart_1.destroy()
            Chart_2.destroy()
            Chart_3.destroy()
            Chart_4.destroy()
            Chart_5.destroy()
        }
        catch(error){

        }
    }
}

export function ResetButtons(){
    Plot.classList.remove('on');
    Plot.querySelector('span').textContent = 'PLOT'
    Plot.classList.remove('loading');
    Selected_Hz.disabled = false;
    SaveModule.resetΙΟLog()
    SaveΙΟLog.textContent = 'START LOG';
    SaveΙΟLog.classList.remove('start');
}


//Start Plotters I/O Checker
export async function Start_Plotter(){
    let starting_time = ''
    let chunkYvalues 
    // let initial_data = []
    // let initial_labels = []
    // let initial_dig_data = []
    // let initial_dig_labels = []
    // for (let index_data = 0; index_data < 75; index_data++) {
    //     initial_data[index_data] = 0;
    //     initial_dig_data[index_data] = 'Low';
    //     initial_labels[index_data] = '';
    //     initial_dig_labels[index_data] = '';
        
    // }

     Chart_1 =new Chartjs.Chart(myChart, {
        type:'line', 
        data:{
           labels:[],
           
           datasets:[{
               data:[],
               showLine: true,
               backgroundColor : '#F78713',
               borderColor: '#F78713',
                borderWidth: 2,
                lineTension: 0.4,
                pointRadius: 2,

            }]
        },
       
       options:{
           
           animation:false,
           showLines: true,
           maintainAspectRatio	: false,
           plugins: {
            title: {
                display: false,
            },
            legend: {
                display: false,
            },
           },
           scales : {
                y : {
                    type: 'linear',
                    min: yaxis_min1,
                    max: yaxis_max1,
                    grid: {
                    	color: '#242424'
                    }
                    
                },
                x : {
                    grid: {
                    	color: '#242424'
                    }
                }
            }
       }
    });

    Chart_2 =new Chartjs.Chart(myChart2, {
        type:'line', 
        data:{
           labels:[],
           datasets:[{
               data:[],
               showLine: true,
               backgroundColor : '#F78713',
               borderColor: '#F78713',
                borderWidth: 2,
                lineTension: 0.4,
                pointRadius: 2,
              
               
               
            }],
           
           
        },
       
        options:{
           animation:false,
           showLine: true,
           maintainAspectRatio	: false,
           plugins: {
            title: {
                display: false,
            },
            legend: {
                display: false,
            },
           },
           scales : {
                y : {
                    type: 'linear',
                    min: yaxis_min2,
                    max: yaxis_max2,
                    grid: {
                    	color: '#242424'
                    }
                    
                },
                x : {
                    grid: {
                    	color: '#242424'
                    }
                }
            }
    
           
        }
    });    

    Chart_3 =new Chartjs.Chart(myChart3, {
        type:'line', 
        data:{
           labels:[],
           datasets:[{
               data:[],
               backgroundColor : '#F78713',
                borderColor: '#F78713',
                borderWidth: 2,
                borderJoinStyle: 'round',
                
                showLine: true,
               stepped : true,
               pointRadius: 2,
            }]
        },
       
       options:{
           animation:false,
           maintainAspectRatio	: false,
           plugins: {
            title: {
                display: false,
            },
            legend: {
                display: false,
            },
           },
           scales : {
                y : {
                    type: 'category',
                    labels: ['Low', 'High'],
                    grid: {
                    	color: '#242424'
                    },
                    reverse: true,
                    
                },
                x : {
                    grid: {
                    	color: '#242424'
                    }
                }
            }
    
           
       }
    });    
    Chart_4 =new Chartjs.Chart(myChart4, {
        type:'line', 
        data:{
           labels:[],
           datasets:[{
               data:[],
               backgroundColor : '#F78713',
                borderColor: '#F78713',
                borderWidth: 2,
                borderJoinStyle: 'round',
                showLine: true,
               stepped : true,
               pointRadius: 2,
            }]
        },
       
       options:{
           animation:false,
           maintainAspectRatio	: false,
           plugins: {
            title: {
                display: false,
            },
            legend: {
                display: false,
            },
           },
           scales : {
                y : {
                    type: 'category',
                    labels: ['Low', 'High'],
                    grid: {
                    	color: '#242424'
                    },
                    reverse: true,
                    
                },
                x : {
                    grid: {
                    	color: '#242424'
                    }
                }
            }
       }
    });   
       
    Chart_5 =new Chartjs.Chart(myChart5, {
        type:'line', 
        data:{
           labels:[],
           
           datasets:[{
               data:[],
               backgroundColor : '#F78713',
                borderColor: '#F78713',
                borderWidth: 2,
                showLine: true,
                stepped : true,
                pointRadius: 2,
            }]
          
           
        },
       
       options:{
           animation:false,
           maintainAspectRatio	: false,
           plugins: {
            title: {
                display: false,
            },
            legend: {
                display: false,
            },
           },
           scales : {
                y : {
                    type: 'category',
                    labels: ['Low', 'High'],
                    grid: {
                    	color: '#242424'
                    },
                    reverse: true,
                    
                },
                x : {
                    grid: {
                    	color: '#242424'
                    }
                }
            }
       }
    }); 
  
   var counter = 0
   DesiredLength = 0 
   Value = "" 
   loop = true
   BufferValue = ""
   AckBuffer = ""
   AckValue = ""

   
    while(loop){
        

      
        const {value,done} = await connection.reader.read()
        connection.wuartLog(value)
        
        Value += BufferValue
        Value += value
        connection.wuartLog(Value)

        if(hasEndLine(Value)){
            // Constructed New Value has \n
            connection.wuartLog('HAS End of line')
            //  keep message until first occurence of \n -> We have a complete message and save rest to buffer
            Value = GetFirstChunk(Value);
            connection.wuartLog('Value to be tested:'+Value)
            connection.wuartLog('waitingforACK:'+waitingforACK)
            connection.wuartLog('waitingtoSTOP:'+waitingtoSTOP)
            if(waitingtoSTOP && IsAck(Value)){
                connection.wuartLog('R_ACK to STOP RECEIVED!')
                ResetButtons();
                waitingtoSTOP = false;
            }else if(waitingforACK && IsAck(Value)){
                //We are waiting for ACK and complete message arrived is R_ACK
                connection.wuartLog('R_ACK RECEIVED!')
                if(requestedPressed){
                    ButtonPress.innerHTML = 'HIGH';
                    ButtonPress.classList.add('high');
                    ButtonPressed = true;
                }else{
                    ButtonPress.classList.remove('high');
                    ButtonPress.innerHTML = 'LOW';
                    ButtonPressed = false;
                }
                waitingforACK = false;
                Value = "";
                continue;
            }else if(waitingforACK && Discarded(Value)){
                //We are waiting for ACK and complete message arrived is R_DIS (or Command discarded)
                connection.wuartLog('R_DIS RECEIVED!')
                //print message
                // PinErrorMessage.classList.add('pin_error_show');
                // ButtonPressed = requestedPressed ? true : false
                waitingforACK = false;
                Value = "";
                continue;
            }else{
                //Data message, Validate Length
                if(CheckLength(Value)!=5){
                    connection.wuartLog('Length != 5, continue')
                    Value = "";
                    continue;
                }
            }
            

        }else{
            connection.wuartLog('No End of line, continue')
            BufferValue = ""
            continue;
        }


       

        

        chunkYvalues = ParseValues(Value);
        
        Value = ""
        DesiredLength = 0

        // PlotValues(chunkYvalues)

        if(!chunkYvalues.includes(NaN)  && !chunkYvalues.includes("S")){
            
            // if(isNaN(chunkYvalues[5])){
            //     continue;
            // }
            if(starting_time == '' || isNaN(starting_time)){
                starting_time = chunkYvalues[5];
                continue;
            }
            
            if(counter>75){
                
                Chart_1.data.labels.shift()
            Chart_1.data.datasets[0].data.shift()
                

                Chart_2.data.labels.shift()
                Chart_2.data.datasets[0].data.shift()
                

                Chart_3.data.labels.shift()
                Chart_3.data.datasets[0].data.shift()

                Chart_4.data.labels.shift()
                Chart_4.data.datasets[0].data.shift()

                Chart_5.data.labels.shift()
                Chart_5.data.datasets[0].data.shift()


            }
            
            Chart_1.options.scales.y.max = parseInt(yaxis_max1);
            Chart_1.options.scales.y.min = parseInt(yaxis_min1);

            Chart_2.options.scales.y.max = parseInt(yaxis_max2);
            Chart_2.options.scales.y.min = parseInt(yaxis_min2);

            let newtime = chunkYvalues[5] - starting_time;
            let newtimestring = newtime.toFixed(3).toString();
            connection.wuartLog(newtimestring);

            if(SaveModule.ΙΟDebuggerLogA1 != undefined && document.getElementById('plot1').classList.contains('enabled')){
                let A1Text = "Time: " + newtimestring + "s, Y Value: " + chunkYvalues[0];
                SaveModule.IOUpdateLog(SaveModule.ΙΟDebuggerLogA1, A1Text)
            }
            if(SaveModule.ΙΟDebuggerLogA2 != undefined && document.getElementById('plot2').classList.contains('enabled')){
                let A2Text = "Time: " + newtimestring + "s, Y Value: " + chunkYvalues[1];
                SaveModule.IOUpdateLog(SaveModule.ΙΟDebuggerLogA2, A2Text)
            }
            if(SaveModule.ΙΟDebuggerLogD1 != undefined && document.getElementById('plot3').classList.contains('enabled')){
                let D1Text = "Time: " + newtimestring + "s, Y Value: " + chunkYvalues[2];
                SaveModule.IOUpdateLog(SaveModule.ΙΟDebuggerLogD1, D1Text)
            }
            if(SaveModule.ΙΟDebuggerLogD2 != undefined && document.getElementById('plot4').classList.contains('enabled')){
                let D2Text = "Time: " + newtimestring + "s, Y Value: " + chunkYvalues[3];
                SaveModule.IOUpdateLog(SaveModule.ΙΟDebuggerLogD2, D2Text)
            }

            
            
            
            
            
            Chart_1.data.labels.push(newtimestring)
            Chart_1.data.datasets.forEach((dataset) => {
                dataset.data.push(chunkYvalues[0]);
            });

            Chart_2.data.labels.push(newtimestring)
            Chart_2.data.datasets.forEach((dataset) => {
                dataset.data.push(chunkYvalues[1]);
            });
            
            Chart_3.data.labels.push(newtimestring)
            Chart_3.data.datasets.forEach((dataset) => {
                let outvalue = chunkYvalues[2] ? 'High' : 'Low'
                dataset.data.push(outvalue);
            });

            Chart_4.data.labels.push(newtimestring)
            Chart_4.data.datasets.forEach((dataset) => {
                let outvalue = chunkYvalues[3] ? 'High' : 'Low'
                dataset.data.push(outvalue);
            });
            
            Chart_5.data.labels.push(newtimestring)
            Chart_5.data.datasets.forEach((dataset) => {
                let outvalue = chunkYvalues[4] ? 'High' : 'Low'
                dataset.data.push(outvalue);
            });
            counter++
            if(Plotter1_Flag){
                Chart_1.update() 
            }

            if(Plotter2_Flag){
                Chart_2.update()  
            }
            if(Plotter3_Flag){
                Chart_3.update() 
            }
            if(Plotter4_Flag){
                Chart_4.update()  
            }
            Chart_5.update() 
            
        } 
    }

}       

function ParseValues(Values){
    ProcessedValue = Values.trim().split(',')
    if(ButtonPressed){
        connection.wuartLog('button pressed')
        PressedValue = 1
    }
    else{
        connection.wuartLog('NOT button pressed')
        PressedValue = 0
    }
    let time_sec = parseFloat(ProcessedValue[0])/1000000;
    let time_sec_round = time_sec.toFixed(3);
    
    return([
        parseFloat(ProcessedValue[1]),
        parseFloat(ProcessedValue[2]),
        parseFloat(ProcessedValue[3]),
        parseFloat(ProcessedValue[4]),
        PressedValue,
        time_sec_round
    ])
}

// function CheckWhitespace(Value){
//     let valuesarray = Value.split(',');
//     let check_wsp = false
//     if( valuesarray.length == 5){
//         for (let index = 0; index < valuesarray.length; index++) {
//             if((valuesarray[index].match(/\n/g)||[]).length > 0){
//                 connection.wuartLog('contains whitespace');
//                 check_wsp = true;
//             }
//         }
//     }
//     if(check_wsp){
//         let newvalue = Value.split('\n');
//         if(newvalue.length > 1){
//             BufferValue = newvalue[1];
//             return newvalue[0];
//         }
//     }
//     BufferValue = "";
//     return Value
// }

function hasEndLine(Value){
    if(Value.indexOf('\n') != -1){
        return true
    }
    return false
}

function GetFirstChunk(Value){

    let before = Value.slice(0, Value.indexOf('\n'));
    let after = Value.slice(Value.indexOf('\n') + 1);
    BufferValue = after;
    return before;
}

function CheckLength(Value){
    
    let valuesarray = Value.split(',');
    return valuesarray.length;

}

// function CheckForAck(Value){
//     return new RegExp('[R_ACK]', 'g').test(Value)
// }
function IsAck(Value){
    return (Value.includes('R_ACK'))
}
function Discarded(Value){
    return (Value.includes('discarded') || Value.includes('R_DIS'))
}


// function CheckLength(Value){
//     let valuesarray = Value.split(',');
//     if( valuesarray.length == 5){
//         for (let index = 0; index < valuesarray.length; index++) {
            
//             if(valuesarray[index] == ''){
//                 return -1
//             }
            
//         }
//         return 5
//     }
//     else if( valuesarray.length > 5){
//         return valuesarray.length
//     }
//     else{
//         return -1
//     }
    
    
// }

let freq_range_1 = document.querySelector('.i-o-checker #plot1.plotter .form_options_group select.frequency');
freq_range_1.addEventListener('change', (e)=>{
    if(e.target.value == 'custom'){
        MinMax1.classList.add('show');
    }else{
        Min1.classList.remove('nonvalid');
        Max1.classList.remove('nonvalid');
        Min1.value = '';
        Max1.value = '';
        MinMax1.classList.remove('show');
        let newmax = parseInt(e.target.value);
        connection.wuartLog('new freq range: '+newmax)
        yaxis_max1 = newmax;
        yaxis_min1 = 0;
    }
})

MinMax_Form1.addEventListener('submit', (e)=> {
    e.preventDefault();
    let min1value = parseInt(Min1.value);
    let max1value = parseInt(Max1.value);
    Min1.classList.remove('nonvalid');
    Max1.classList.remove('nonvalid');
    let isnum_min = /^\d+$/.test(min1value);
    let isnum_max = /^\d+$/.test(max1value);
    if(isnum_min && isnum_max && min1value < max1value){
        yaxis_min1 = min1value;
        yaxis_max1 = max1value;
    }else{
        if(!isnum_min){
            connection.wuartLog('Min1 not a number')
            Min1.classList.add('nonvalid');
        }
        if(!isnum_max){
            connection.wuartLog('Max1 not a number')
            Max1.classList.add('nonvalid');
        }
        if(min1value >= max1value){
            connection.wuartLog('Min1 larger than Max1')
            connection.wuartLog('Min1:' + min1value)
            connection.wuartLog('Max1:' + max1value)
            Min1.classList.add('nonvalid');
            Max1.classList.add('nonvalid');
        }
    }
})

let freq_range_2 = document.querySelector('.i-o-checker #plot2.plotter .form_options_group select.frequency');
freq_range_2.addEventListener('change', (e)=>{
    if(e.target.value == 'custom'){
        MinMax2.classList.add('show');
       
    }else{
        Min2.classList.remove('nonvalid');
        Max2.classList.remove('nonvalid');
        Min2.value = '';
        Max2.value = '';
        MinMax2.classList.remove('show');
        let newmax2 = parseInt(e.target.value);
        connection.wuartLog('new freq range: '+newmax2)
        yaxis_max2 = newmax2;
        yaxis_min2 = 0;
    }
})


MinMax_Form2.addEventListener('submit', (e)=> {
    e.preventDefault();
    let min2value = parseInt(Min2.value);
    let max2value = parseInt(Max2.value);
    Min2.classList.remove('nonvalid');
    Max2.classList.remove('nonvalid');
    let isnum_min = /^\d+$/.test(min2value);
    let isnum_max = /^\d+$/.test(max2value);
    if(isnum_min && isnum_max && min2value < max2value){
        yaxis_min2 = min2value;
        yaxis_max2 = max2value;
    }else{
        if(!isnum_min){
            Min2.classList.add('nonvalid');
        }
        if(!isnum_max){
            Max2.classList.add('nonvalid');
        }
        if(min2value >= max2value){
            Min2.classList.add('nonvalid');
            Max2.classList.add('nonvalid');
        }
    }
})
    


