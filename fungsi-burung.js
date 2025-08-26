function showCustomAlert(message, type = 'info') {  
  const alertDiv = document.getElementById('customAlert');  
  const alertMessage = document.getElementById('alertMessage');  
  const alertIcon = document.getElementById('alertIcon');  

  alertMessage.textContent = message;  
  switch (type) {  
    case 'success':  
      alertIcon.textContent = '✔️';  
      alertDiv.style.border = '2px solid #4CAF50';  
      break;  
    case 'error':  
      alertIcon.textContent = '❌';  
      alertDiv.style.border = '2px solid #f44336';  
      break;  
    case 'warning':  
      alertIcon.textContent = '⚠️';  
      alertDiv.style.border = '2px solid #FFC107';  
      break;  
    default:  
      alertIcon.textContent = 'ℹ️';  
      alertDiv.style.border = '2px solid #2196F3';  
  }  

  alertDiv.style.display = 'block';  
  const overlay = document.createElement('div');  
  overlay.style.position = 'fixed';  
  overlay.style.top = '0';  
  overlay.style.left = '0';  
  overlay.style.width = '100%';  
  overlay.style.height = '100%';  
  overlay.style.background = 'rgba(0,0,0,0.5)';  
  overlay.style.zIndex = '1000';  
  overlay.id = 'alertOverlay';  
  document.body.appendChild(overlay);  
  document.getElementById('alertOkBtn').onclick = function() {  
    alertDiv.style.display = 'none';  
    document.getElementById('alertOverlay').remove();  
  };  
}  

$(document).ready(function() {  
 
  for (let i = 1; i <= 5; i++) createROLL($('#ring' + i));  
  $('#rotate').addClass('tilted');  
  $('.roll').addClass('backface-on');  

  setTimeout(() => {  
    $('#loading').fadeOut();  
  }, 2000);  

 
  let winAudio = document.getElementById('winAudio');  
  let userInteracted = false;  
  $('#spinButton').click(function() {  
    if (!userInteracted) {  
      winAudio.muted = true;  
      winAudio.play().then(() => {  
        winAudio.pause();  
        winAudio.currentTime = 0;  
        winAudio.muted = false;  
        userInteracted = true;  
      }).catch(error => {  
        console.error("Audio play blocked:", error);  
      });  
    }  

    if (!$(this).prop('disabled')) {  
      spin(true);  
    }  
  });  

  
  $('#startAutoSpinButton').click(startAutoSpin);  
  $('#stopAutoSpinButton').click(stopAutoSpin);  

 
  const totalPerakSpan = document.getElementById("total-perak");  
  let totalPerak = 0;  
  const inputs = document.querySelectorAll('.input-circle');  
  inputs.forEach(input => {  
    input.addEventListener('change', () => {  
      if (input.checked) {  
        totalPerak++;  
        totalPerakSpan.textContent = totalPerak;  
      } else {  
        totalPerak--;  
        totalPerakSpan.textContent = totalPerak;  
      }  
    });  
  });  

  const selesaiBtn = document.getElementById("selesaiBtn");  
  selesaiBtn.addEventListener("click", () => {  
    if (localUser.ID && totalPerak > 0) {  
      const usersRef = db.ref('users');  
      usersRef.orderByChild('ID').equalTo(localUser.ID).once('value')  
        .then(snapshot => {  
          if (snapshot.exists()) {  
            snapshot.forEach(childSnapshot => {  
              const userId = childSnapshot.key;  
              let currentPerak = childSnapshot.val().Perak ? parseInt(childSnapshot.val().Perak) : 0;  
              let newPerak = currentPerak + totalPerak;  

              return db.ref('users/' + userId).update({  
                  Perak: newPerak  
                })  
                .then(() => {  
                  showCustomAlert(` ${totalPerak} Perak successfully claimed!`, "success");  
                  totalPerak = 0;  
                  totalPerakSpan.textContent = totalPerak;  
                  inputs.forEach(input => input.checked = false);  
                });  
            });  
          } else {  
            showCustomAlert("User not found.", "error");  
          }  
        })  
        .catch(error => {  
          console.error("Failed to send Perak:", error);  
          showCustomAlert("Failed to send Perak. Please try again.", "error");  
        });  
    } else {  
      showCustomAlert("No Perak to claim.", "info");  
    }  
  });  

});
