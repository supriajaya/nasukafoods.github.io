// Konfigurasi dan Inisialisasi Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDPJfJgUg8a_e1zS3nSbU8RqHj3TOALX2s",
    authDomain: "nasuka-fc780.firebaseapp.com",
    databaseURL: "https://nasuka-fc780-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "nasuka-fc780",
    messagingSenderId: "860641747257",
    appId: "1:860641747257:web:d1dc28bf34cc1f64ad48e8"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Data Pengguna Lokal
const localUser = {
    Username: localStorage.getItem("Username"),
    Perak: parseInt(localStorage.getItem("Perak")) || 0,
};

if (!localUser.Username) {
    console.log("Username tidak ditemukan di localStorage. Silakan login.");
}

const userRef = db.ref(`users/${localUser.Username}`);

// Mendengarkan perubahan nilai Perak dari database
userRef.on('value', (snapshot) => {
    const userData = snapshot.val();
    if (userData !== null) {
        localUser.Perak = userData.Perak || 0;
        localStorage.setItem("Perak", localUser.Perak);
        updatePerakDisplay();
        console.log(""); // Konsol log kosong seperti di kode asli
    }
});

// Fungsi Utilitas
function updatePerakDisplay() {
    $('#perakBalance').text(localUser.Perak.toLocaleString('id-ID'));
}

function showErrorMessage(message) {
    $('#errorMessage').text(message).fadeIn().delay(3000).fadeOut();
}

function showCustomAlert(message, type = 'info') {
    const alertDiv = document.getElementById('customAlert');
    const alertMessage = document.getElementById('alertMessage');
    const alertIcon = document.getElementById('alertIcon');

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
