import * as Api from '../Api.js'
import * as connection from '../../connection.js'
import * as SaveModule from '../SaveModule.js'
import * as UartDebugger from './Uart_debugger.js'


let VoltageMonitor = document.getElementById('voltage_monitor')
let CurrentMonitor = document.getElementById('current_monitor')
let cur_dir = document.getElementById('current_direction');

var ProcessedValue=[]
var ChartBattery_1 ,ChartBattery_2
var CheckBatteryStatus
let yaxis_max3 = 500;
let yaxis_min3 = -500;
let MinMax3 = document.querySelector('#current_plot .form_options_group.min_max_range');
let MinMax_Form3 = document.getElementById('minmax_form3');
let Min3 = document.getElementById('min_3');
let Max3 = document.getElementById('max_3');

let SaveLog = document.getElementById('create_battery_log')
let Battery_Plot = document.querySelector('.current-monitor .checker_options button.plot_toggle')
let Selected_Hz = document.querySelector('.current-monitor .checker_options select.frequency')
let Selected_Range = document.querySelector('.current-monitor #current_plot select.frequency')
let Value
let BufferValue
let loop
export let BatteryMonitorConfigClicked = false

export function BatteryMonitorConfigClickedSetTrue(){
    BatteryMonitorConfigClicked = true
}
export function BatteryMonitorConfigClickedSetFalse(){
    BatteryMonitorConfigClicked = false
}

var Chart_js = require('chart.js')

let myBattetyChart = document.querySelector('#voltage_plot canvas').getContext('2d');
let myBatteryChart2 = document.querySelector('#current_plot canvas').getContext('2d');



//Create Log Button - Creates files
SaveLog.addEventListener('click' , (e)=>{
    connection.wuartLog(e.target);
    if(SaveLog.textContent == 'START LOG'){
        SaveModule.CreateBatteryDebuggerLog()
        SaveLog.textContent = 'STOP LOG';
        SaveLog.classList.add("start");
    }else{
        SaveModule.resetBatteryLog();
        SaveLog.textContent = 'START LOG';
        SaveLog.classList.remove('start');
    }
    
})


//Reset Charts for Battery Monitor
export function DestroyCharts(){
    if(ChartBattery_1 !=undefined & ChartBattery_2 != undefined ){
        try{
           
            ChartBattery_1.destroy()
            ChartBattery_2.destroy()
        }
        catch(err){
            console(err)
        }
    }
    return
}

export function ResetButtons(){
    Battery_Plot.classList.remove('on');
    Battery_Plot.querySelector('span').textContent = 'PLOT'
    Battery_Plot.classList.remove('loading');
    Selected_Hz.disabled = false;
}


//Y-Axis Range Change
Selected_Range.addEventListener('change', (e)=>{
    if(e.target.value == 'custom'){
        MinMax3.classList.add('show');
    }else{
        Min3.classList.remove('nonvalid');
        Max3.classList.remove('nonvalid');
        Min3.value = '';
        Max3.value = '';
        MinMax3.classList.remove('show');
        let newmax = e.target.value;
        let selectedoption_element = e.target.options[ e.target.selectedIndex ];
        let newmin = selectedoption_element.dataset.min;
        connection.wuartLog('new freq range: '+newmax)
        yaxis_max3 = newmax;
        yaxis_min3 = newmin;
    }
})

//Y-Axis Custom Range Change
MinMax_Form3.addEventListener('submit', (e)=> {
    e.preventDefault();
    let min3value = parseInt(Min3.value);
    let max3value = parseInt(Max3.value);
    Min3.classList.remove('nonvalid');
    Max3.classList.remove('nonvalid');
    let isnum_min = /^[-+]?\d+$/.test(min3value);
    let isnum_max = /^[-+]?\d+$/.test(max3value);
    if(isnum_min && isnum_max && min3value < max3value){
        yaxis_min3 = min3value;
        yaxis_max3 = max3value;
    }else{
        if(!isnum_min){
            connection.wuartLog('Min3 not a number')
            Min3.classList.add('nonvalid');
        }
        if(!isnum_max){
            connection.wuartLog('Max3 not a number')
            Max3.classList.add('nonvalid');
        }
        if(min3value >= max3value){
            connection.wuartLog('Min3 larger than Max3')
            connection.wuartLog('Min3:' + min3value)
            connection.wuartLog('Max3:' + max3value)
            Min3.classList.add('nonvalid');
            Max3.classList.add('nonvalid');
        }
    }
})


//Start/Stop Plot Click
Battery_Plot.addEventListener('click',async(e)=>{
    connection.wuartLog('clicked')
    Battery_Plot.classList.add('loading');
    e.preventDefault()
    if(Battery_Plot.classList.contains('on')){
        //Stop Plot
        SetLoopFalse()
        let command = Api.BatteryMonitorPlotter_command + '0:' + Selected_Hz.value
        SetLoopFalse()
        await Api.WriteMessage(command).then(async()=>{
            ResetButtons()
        })
        
    }else{
        //Start Plot
        SetLoopFalse()
        await UartDebugger.StopListen()
        DestroyCharts()
        if(Selected_Hz.value == undefined){
            alert("Please Choose Hz for Plotter!")
        }
        else{
            Selected_Hz.disabled = true;
            Battery_Plot.classList.add('on');
            connection.wuartLog('Hz selected')
            let command = Api.BatteryMonitorPlotter_command + '1:' + Selected_Hz.value
            await Api.WriteMessage(command)
            .then(async()=>{
                var Result = await Api.ListenMessage("R", 6000);
                connection.wuartLog(Result)
                if (Result=="Error"){
                    connection.wuartLog('Start Battery Monitor Error');
                    alert('There was an error Starting Battery Monitor Plot')
                }
                else{
                    Battery_Plot.classList.add('on');
                    Battery_Plot.querySelector('span').textContent = 'STOP'
                    Battery_Plot.classList.remove('loading');
                    StartPlotters()
                }
                
            })

            
        }
    }
})

//Pause Plot
export function SetLoopFalse(){
    loop = false
}


//Current Direction -+
function CurrentDirection(value){
    let dir = "";
    if(value < 0){
        dir = "Current Consumption";
    }else if(value > 0){
        dir = "Charging Current";
    }
    // value = Math.abs(value)
    cur_dir.innerHTML = dir;
    return value;
}


//Plot Function
export async function StartPlotters(){
    
    let chunkYvalues
    
     ChartBattery_1 =new Chart_js.Chart(myBattetyChart, {
        type:'line', 
        data:{
           labels:[],
           datasets:[{
               data:[],
               backgroundColor : '#F78713',
               

            }]
        },
        options:{
           
            animation:false,
            maintainAspectRatio	: false,
            showLine: true,
            backgroundColor : '#F78713',
            borderColor: '#F78713',
            borderWidth: 2,
            lineTension: 0.4,
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
                     min: 2000,
                     max: 5000,
                     grid: {
                         color: '#242424'
                     }
                     
                 },
                 x : {
                    min : 0,
                    max : 3600,
                    ticks: {
                        includeBounds : true
                    }
                }
             }
        }
    });


        ChartBattery_2 =new Chart_js.Chart(myBatteryChart2, {
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
                type: 'linear',
                min: yaxis_max3,
                max: yaxis_min3,
                grid: {
                    color: '#242424'
                }
                
            },
            x : {
               min : 0,
               max : 3600,
               
           }
        }
    }
       });


    let counter = 0
    
    Value=""
    BufferValue = ""
    loop = true
   
    while(loop){
        const {value,done} = await connection.reader.read()
        connection.wuartLog(value)
        Value += BufferValue
        Value += value
        connection.wuartLog(Value)
        if(hasEndLine(Value)){
            connection.wuartLog('HAS End of line')
            Value = GetFirstChunk(Value);
            if(CheckLength(Value)!=2){
                connection.wuartLog('Length != 2, continue')
                Value = "";
                continue;
            }

        }else{
            connection.wuartLog('No End of line, continue')
            BufferValue = ""
            continue;
        }



        // Value = CheckWhitespace(Value);
        // if(CheckLength(Value)!=2){
        //     if(CheckLength(Value)>2){
        //         let tempvalue = Value.split('\n');
        //         if(tempvalue.length > 1){
        //             Value =  tempvalue[0];
        //             BufferValue = ""
        //         }else{
        //         connection.wuartLog('continue1')
        //            Value = ""
        //         }
        //     }else{
        //         connection.wuartLog('continue2')
        //         continue
        //     }
        // }
          
            
            
            chunkYvalues = ParseValues(Value);
            CheckBatteryStatus = CheckStatus(chunkYvalues)
            Value = ""
        
            if(!chunkYvalues.includes(NaN)  & !chunkYvalues.includes("S") & CheckBatteryStatus==false){
                if(counter>40){
                    ChartBattery_1.data.labels.shift()
                    ChartBattery_1.data.datasets[0].data.shift()


                    ChartBattery_2.data.labels.shift()
                    ChartBattery_2.data.datasets[0].data.shift()
                    

                }
                ChartBattery_2.options.scales.y.max = parseInt(yaxis_max3);
                ChartBattery_2.options.scales.y.min = parseInt(yaxis_min3);

                let Text = chunkYvalues[0] + " mV " + ", " + chunkYvalues[1] + " mA"
                // connection.wuartLog(Text)
                SaveModule.BatteryUpdateLog(Text)
                ShowValues(chunkYvalues)

                ChartBattery_1.data.labels.push(counter)
                ChartBattery_1.data.datasets.forEach((dataset) => {
                    dataset.data.push(chunkYvalues[0]);
                });

                ChartBattery_2.data.labels.push(counter)
                ChartBattery_2.data.datasets.forEach((dataset) => {
                    dataset.data.push(chunkYvalues[1]);
                });


                counter +=1 

                ChartBattery_1.update()
                ChartBattery_2.update()
            }
          
        }
            
        
    

}       





//Parser
function ParseValues(Values){
    ProcessedValue = Values.trim().split(',')
    return([parseFloat(CurrentDirection(ProcessedValue[0])),parseFloat(CurrentDirection(ProcessedValue[1]))])
}


function ShowValues(Array,bool){
    if(bool){
        VoltageMonitor.innerHTML = "n/a"
        CurrentMonitor.innerHTML = "n/a"
    }else{
        VoltageMonitor.innerHTML = Array[0] + " mV"
        CurrentMonitor.innerHTML = Array[1] + " mA"
    }
}

function CheckStatus(Array){
    if(Array[0] == -9999999 | Array[1]==-9999999){
        ShowValues("",true)
        return true
    }
    else{
        return false
    }
}

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
    // if( valuesarray.length == 2){
    //     for (let index = 0; index < valuesarray.length; index++) {
    //         if(valuesarray[index] == '' || valuesarray[index] == '-'){
    //             return -1
    //         }
            
    //     }
    //     return 2
    // }
    // else{
    //     return -1
    // }
}
