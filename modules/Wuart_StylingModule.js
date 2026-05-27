
let Led = document.getElementById('wuart-led')
let Wuart_Button = document.getElementById('wuart_button')



//Changes Wuart Led Colour
export function Led_Colour(colour){ 
    
    if (colour=='0'){
        
        Led.style.backgroundColor= 'grey' ;
    }
    else if(colour == '1'){
        Led.style.backgroundColor='red'
    }
    else if(colour == '2'){
        Led.style.backgroundColor = 'green'
        
    }
    else if (colour == '3'){
        Led.style.backgroundColor = 'blue'
    }
    else if (colour == '4'){
        Led.style.backgroundColor = 'purple'
    }
    else if( colour = '5'){
        Led.style.backgroundColor = 'yellow'
    }
    else{
        Led.style.backgroundColor = 'white'
    }
}

//Change Button Status
export function ButtonStatus(mode){
    if (mode=='0'){
        Wuart_Button.style.backgroundColor='grey'
    }
    else{
        Wuart_Button.style.backgroundColor='orange'
    }
}




