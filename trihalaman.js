function showBurung() {  
           
 document.getElementById('rulle-container').style.display = 'none';
  document.getElementById('roll-container').style.display = 'none';
  document.getElementById('burung-container').style.display = 'block';
  
  
 document.getElementById('gameBody').classList.remove('roll-bg');
 
 document.getElementById('gameBody').classList.remove('rulle-bg');
  document.getElementById('gameBody').classList.add('burung-bg');
}


             function showRoll() {



 document.getElementById('burung-container').style.display = 'none';
  document.getElementById('roll-container').style.display = 'block';

document.getElementById('rulle-container').style.display = 'none';



 document.getElementById('gameBody').classList.remove('burung-bg');
  document.getElementById('gameBody').classList.add('roll-bg');


document.getElementById('gameBody').classList.remove('rulle-bg');
}


           function showRulle() {
    
    document.getElementById('burung-container').style.display = 'none';
    document.getElementById('roll-container').style.display = 'none';
    document.getElementById('rulle-container').style.display = 'block';

    
    document.getElementById('gameBody').classList.remove('burung-bg');
    document.getElementById('gameBody').classList.remove('roll-bg');
    document.getElementById('gameBody').classList.add('rulle-bg');
}

           
