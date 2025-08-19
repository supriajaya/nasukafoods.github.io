// Konfigurasi Firebase Anda
const firebaseConfig = {
    apiKey: "AIzaSyDPJfJgUg8a_e1zS3nSbU8RqHj3TOALX2s",
    authDomain: "nasuka-fc780.firebaseapp.com",
    databaseURL: "https://nasuka-fc780-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "nasuka-fc780",
    messagingSenderId: "860641747257",
    appId: "1:860641747257:web:d1dc28bf34cc1f64ad48e8"
};

// Inisialisasi Firebase secara global.
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Map untuk menyimpan fungsi inisialisasi skrip dari setiap halaman.
const pageInitializers = {};

async function navigateTo(page) {
    try {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) {
            console.error("Elemen #main-content tidak ditemukan.");
            return;
        }

        mainContent.innerHTML = '';

        // Muat konten HTML untuk halaman yang diminta.
        const response = await fetch(`content/${page}.html`);
        if (!response.ok) {
            throw new Error(`Gagal memuat ${page}.html: ${response.statusText}`);
        }
        const html = await response.text();
        mainContent.innerHTML = html;

        // Muat skrip JavaScript yang sesuai jika belum dimuat.
        if (!pageInitializers[page]) {
            await loadScript(`js/${page}.js`);
        }

        // Panggil fungsi inisialisasi untuk halaman ini.
        if (pageInitializers[page]) {
            pageInitializers[page]();
        }

    } catch (error) {
        console.error('Navigasi gagal:', error);
    }
}

// Fungsi pembantu untuk memuat skrip secara dinamis.
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = () => {
            console.error(`Gagal memuat skrip: ${src}`);
            reject();
        };
        document.head.appendChild(script);
    });
}

// Tambahkan fungsi navigasi ke objek global `window` agar dapat diakses dari HTML.
window.navigateTo = navigateTo;
window.pageInitializers = pageInitializers; // Expose to be used by other scripts

document.addEventListener('DOMContentLoaded', () => {
    // Tentukan halaman awal saat aplikasi dimuat.
    const path = window.location.pathname.split('/').pop().replace('.html', '');
    const initialPage = (path === '' || path === 'index') ? 'home' : path;
    navigateTo(initialPage);
});
