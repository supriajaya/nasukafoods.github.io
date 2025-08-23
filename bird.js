 function showCustomAlert(message, type = 'info') {
    const alertDiv = document.getElementById('customAlert');
    const alertMessage = document.getElementById('alertMessage');
    const alertIcon = document.getElementById('alertIcon');
    const alertOverlay = document.getElementById('alertOverlay');

    alertMessage.textContent = message;
    
    switch(type) {
        case 'success':
            alertIcon.textContent = '';
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
    if (alertOverlay) {
        alertOverlay.style.display = 'block';
    } else {
        const newOverlay = document.createElement('div');
        newOverlay.style.position = 'fixed';
        newOverlay.style.top = '0';
        newOverlay.style.left = '0';
        newOverlay.style.width = '100%';
        newOverlay.style.height = '100%';
        newOverlay.style.background = 'rgba(0,0,0,0.5)';
        newOverlay.style.zIndex = '999';
        newOverlay.id = 'alertOverlay';
        document.body.appendChild(newOverlay);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const alertDiv = document.getElementById('customAlert');
    const alertOkBtn = document.getElementById('alertOkBtn');
    const alertOverlay = document.createElement('div');
    alertOverlay.id = 'alertOverlay';
    alertOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 999;
        display: none;
    `;
    document.body.appendChild(alertOverlay);

    alertOkBtn.addEventListener('click', () => {
        alertDiv.style.display = 'none';
        alertOverlay.style.display = 'none';
    });

    const limitReachedDiv = document.getElementById("limitReached");
    const wrapper = document.querySelector('.wrapper');
    const selesaiBtn = document.getElementById("selesaiBtn");
    
    const totalPerakSpan = document.getElementById("total-perak");
    let totalPerak = 0;
    
    const inputs = document.querySelectorAll('.input-circle');
    inputs.forEach(input => {
        input.addEventListener('change', () => {
            if (input.checked) {
                totalPerak++;
                totalPerakSpan.textContent = totalPerak;
            }
        });
    });

    selesaiBtn.addEventListener("click", () => {
        if (localUser.Username && totalPerak > 0) {
            const usersRef = db.ref('users');
            usersRef.orderByChild('Username').equalTo(localUser.Username).once('value')
            .then(snapshot => {
                if (snapshot.exists()) {
                    snapshot.forEach(childSnapshot => {
                        const userId = childSnapshot.key;                      
                        
                        let currentPerak = childSnapshot.val().Perak ? parseInt(childSnapshot.val().Perak) : 0;
                        let newPerak = currentPerak + totalPerak;
                        
                        return db.ref('users/' + userId).update({ Perak: newPerak })
                        .then(() => {
                            showCustomAlert(` ${totalPerak} Perak berhasil diklaim!`, "success");
                            totalPerak = 0;
                            totalPerakSpan.textContent = totalPerak;
                            inputs.forEach(input => input.checked = false);
                        });
                    });
                } else {
                    showCustomAlert("Pengguna tidak ditemukan.", "error");
                }
            })
            .catch(error => {
                console.error("Gagal mengirim perak:", error);
                showCustomAlert("Gagal mengirim perak. Silakan coba lagi.", "error");
            });
        } else {
            showCustomAlert("Tidak ada perak yang di klaim", "info");
        }
    });
});
