import * as connection from '../connection.js'

export let Pin_1 = document.getElementById('drag1')
export let Pin_2 = document.getElementById('drag2')
export let Pin_3 = document.getElementById('drag3')
export let Pin_4 = document.getElementById('drag4')
export let Pin_5 = document.getElementById('drag5')
export let Pin_6 = document.getElementById('drag6')
export let Pin_7 = document.getElementById('drag7')
export let Pin_8 = document.getElementById('drag8')

export let Board_Pins = [Pin_1,Pin_2,Pin_3,Pin_4,Pin_5,Pin_6,Pin_7,Pin_8]
export let device = document.getElementById('device');


export let LiveText_1 = document.querySelector('#pin_display ._1')
export let LiveText_2 = document.querySelector('#pin_display ._2')
export let LiveText_3 = document.querySelector('#pin_display ._3')
export let LiveText_4 = document.querySelector('#pin_display ._4')
export let LiveText_5 = document.querySelector('#pin_display ._5')
export let LiveText_6 = document.querySelector('#pin_display ._6')
export let LiveText_7 = document.querySelector('#pin_display ._7')
export let LiveText_8 = document.querySelector('#pin_display ._8')

export let Live_Screen = [LiveText_1,LiveText_2,LiveText_3,LiveText_4,LiveText_5,LiveText_6,LiveText_7,LiveText_8]
let dragging, draggedOver;

function dragEvents(Board_Pins){
  for (let index_live = 0; index_live < Board_Pins.length; index_live++) {
    Board_Pins[index_live].draggable = true
    Board_Pins[index_live].addEventListener('drag', setDragging) 
    Board_Pins[index_live].addEventListener('dragover', setDraggedOver)
    Board_Pins[index_live].addEventListener('drop', compare)
  }
}


export function disableVccGnd(){
  for (let index = 0; index < Board_Pins.length; index++) {
    let name = Board_Pins[index].innerHTML;
    if(name.includes("VCC") || name.includes("GND") ){
      Board_Pins[index].draggable = false;
    }else{
      Board_Pins[index].draggable = true;
    }
    
  }
}
dragEvents(Board_Pins)


function setDraggedOver(e){
    e.preventDefault();
    draggedOver = e.target
  }
  
function setDragging(e){
    if(CheckVccGnd(e.target.id)){
      connection.wuartLog('CheckVccGnd drag');
      return
    }
    dragging = e.target

  }

function compare(e){
    if(CheckVccGnd(e.target.id)){
      connection.wuartLog('CheckVccGnd drop');
      return
    }
    var origin_index = Board_Pins.indexOf(dragging);
    connection.wuartLog('origin_index:'+origin_index)
    var destination_index = Board_Pins.indexOf(draggedOver);
    connection.wuartLog('destination_index:'+destination_index)
    
    let newBoard = Board_Pins.slice();
    newBoard[origin_index] = Board_Pins[destination_index]
    newBoard[destination_index] = Board_Pins[origin_index]


    Board_Pins = newBoard.slice();
    connection.wuartLog(Board_Pins.slice())
    draggedOver = '';
    dragging = '';
    renderItems()

  
  };

  export function renderItems(){
    let tempArray = Board_Pins;
    //fix classes in order
    for (let index_board = 0; index_board < tempArray.length; index_board++) {
      let counter = index_board + 1;
      let new_class = "_" + counter;
      tempArray[index_board].classList.remove('_1', '_2', '_3', '_4', '_5', '_6', '_7', '_8')
      tempArray[index_board].classList.add(new_class);
    }
    //print on DOM
    let pin_drag = document.getElementById('pin_drag');
    pin_drag.innerHTML = '';
    for (let index_board2 = 0; index_board2 < tempArray.length; index_board2++) {
      pin_drag.appendChild(tempArray[index_board2])
    }
    connection.wuartLog(Board_Pins)
    
  }

  function resetItems(){
    let tempArray = [];
    //rearrange based on id
    for (let index_temp = 0; index_temp < Board_Pins.length; index_temp++) {
      let counter = index_temp + 1;
      let idstring = Board_Pins[index_temp].id;
      let idnum = parseInt(idstring.replace('drag', ''));
      let id_index = idnum - 1;
      tempArray[id_index] = Board_Pins[index_temp];
      tempArray[id_index].classList.remove('_1', '_2', '_3', '_4', '_5', '_6', '_7', '_8')
      let new_class = "_" + idnum;
      tempArray[id_index].classList.add(new_class);
    }
    
    //print on DOM
    let pin_drag = document.getElementById('pin_drag');
    pin_drag.innerHTML = '';
    for (let index_board2 = 0; index_board2 < tempArray.length; index_board2++) {
      pin_drag.appendChild(tempArray[index_board2])
    }
  }


//Reset Pins and Live Screen in Wuart
export function ResetAll(){
    Board_Pins.forEach(Pin => {
      Pin.innerHTML = 'Pin'
    })
    Live_Screen.forEach(Livetext => {
      Livetext.innerHTML = " "
    })
}

export function cancelReorder(){
    resetItems()
    Board_Pins = []
    Pin_1 = document.getElementById('drag1')
    Pin_2 = document.getElementById('drag2')
    Pin_3 = document.getElementById('drag3')
    Pin_4 = document.getElementById('drag4')
    Pin_5 = document.getElementById('drag5')
    Pin_6 = document.getElementById('drag6')
    Pin_7 = document.getElementById('drag7')
    Pin_8 = document.getElementById('drag8')

    Board_Pins = [Pin_1,Pin_2,Pin_3,Pin_4,Pin_5,Pin_6,Pin_7,Pin_8]
    connection.wuartLog(Board_Pins)
    device.classList.remove('status_apply');
}




  //Checks if id is VCC or GND
  function CheckVccGnd(id){
    var name = document.getElementById(id).innerHTML
    connection.wuartLog(name)
    if(name.includes("VCC") || name.includes("GND") ){
      return true
    }
    else{
      return false
    }
  }

