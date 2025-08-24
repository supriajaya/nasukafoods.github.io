function showHome() {
   
    document.getElementById('profile-konten').style.display = 'none';
    document.getElementById('payment-konten').style.display = 'none';
    document.getElementById('edit-profile-konten').style.display = 'none';
    document.getElementById('leaderboard-konten').style.display = 'none';
    document.getElementById('belanja-konten').style.display = 'none';
    document.getElementById('labirin-konten').style.display = 'none';
    document.getElementById('login-konten').style.display = 'none';
    document.getElementById('signup-konten').style.display = 'none';
    document.getElementById('saya-konten').style.display = 'none';
    document.getElementById('pasar-konten').style.display = 'none';
    document.getElementById('disclaimer-konten').style.display = 'none';
    document.getElementById('faq-konten').style.display = 'none';
    document.getElementById('return-policy-konten').style.display = 'none';
    document.getElementById('privacy-policy-konten').style.display = 'none';
    document.getElementById('term-konten').style.display = 'none';
   document.getElementById('home-konten').style.display = 'block';

    document.body.classList.remove('profile-bg', 'payment-bg', 'edit-profile-bg', 'leaderboard-bg', 'belanja-bg', 'labirin-bg', 'login-bg', 'signup-bg', 'saya-bg', 'pasar-bg', 'disclaimer-bg', 'faq-bg', 'return-policy-bg', 'privacy-policy-bg', 'term-bg');
    document.body.classList.add('home-bg');
}



function showProfil() {
    document.getElementById('home-konten').style.display = 'none';
    document.getElementById('payment-konten').style.display = 'none';
    document.getElementById('edit-profile-konten').style.display = 'none';
    document.getElementById('leaderboard-konten').style.display = 'none';
    document.getElementById('belanja-konten').style.display = 'none';
    document.getElementById('labirin-konten').style.display = 'none';
    document.getElementById('login-konten').style.display = 'none';
    document.getElementById('signup-konten').style.display = 'none';
    document.getElementById('saya-konten').style.display = 'none';
    document.getElementById('pasar-konten').style.display = 'none';
    document.getElementById('disclaimer-konten').style.display = 'none';
    document.getElementById('faq-konten').style.display = 'none';
    document.getElementById('return-policy-konten').style.display = 'none';
    document.getElementById('privacy-policy-konten').style.display = 'none';
    document.getElementById('term-konten').style.display = 'none';
    document.getElementById('profile-konten').style.display = 'block';

    document.body.classList.remove('home-bg', 'payment-bg', 'edit-profile-bg', 'leaderboard-bg', 'belanja-bg', 'labirin-bg', 'login-bg', 'signup-bg', 'saya-bg', 'pasar-bg', 'disclaimer-bg', 'faq-bg', 'return-policy-bg', 'privacy-policy-bg', 'term-bg');
    document.body.classList.add('profile-bg');
}




function showPayment() {
    document.getElementById('home-konten').style.display = 'none';
    document.getElementById('profile-konten').style.display = 'none';
    document.getElementById('edit-profile-konten').style.display = 'none';
    document.getElementById('leaderboard-konten').style.display = 'none';
    document.getElementById('belanja-konten').style.display = 'none';
    document.getElementById('labirin-konten').style.display = 'none';
    document.getElementById('login-konten').style.display = 'none';
    document.getElementById('signup-konten').style.display = 'none';
    document.getElementById('saya-konten').style.display = 'none';
    document.getElementById('pasar-konten').style.display = 'none';
    document.getElementById('disclaimer-konten').style.display = 'none';
    document.getElementById('faq-konten').style.display = 'none';
    document.getElementById('return-policy-konten').style.display = 'none';
    document.getElementById('privacy-policy-konten').style.display = 'none';
    document.getElementById('term-konten').style.display = 'none';

    // Tampilkan konten Pembayaran
    document.getElementById('payment-konten').style.display = 'block';

    // Sesuaikan kelas body/halaman jika diperlukan
    document.body.classList.remove('home-bg', 'profile-bg', 'edit-profile-bg', 'leaderboard-bg', 'belanja-bg', 'labirin-bg', 'login-bg', 'signup-bg', 'saya-bg', 'pasar-bg', 'disclaimer-bg', 'faq-bg', 'return-policy-bg', 'privacy-policy-bg', 'term-bg');
    document.body.classList.add('payment-bg');
}

// Fungsi untuk menampilkan halaman Edit Profil
function showEditProfil() {
    // Sembunyikan semua konten yang lain
    document.getElementById('home-konten').style.display = 'none';
    document.getElementById('profile-konten').style.display = 'none';
    document.getElementById('payment-konten').style.display = 'none';
    document.getElementById('leaderboard-konten').style.display = 'none';
    document.getElementById('belanja-konten').style.display = 'none';
    document.getElementById('labirin-konten').style.display = 'none';
    document.getElementById('login-konten').style.display = 'none';
    document.getElementById('signup-konten').style.display = 'none';
    document.getElementById('saya-konten').style.display = 'none';
    document.getElementById('pasar-konten').style.display = 'none';
    document.getElementById('disclaimer-konten').style.display = 'none';
    document.getElementById('faq-konten').style.display = 'none';
    document.getElementById('return-policy-konten').style.display = 'none';
    document.getElementById('privacy-policy-konten').style.display = 'none';
    document.getElementById('term-konten').style.display = 'none';

    // Tampilkan konten Edit Profil
    document.getElementById('edit-profile-konten').style.display = 'block';

    // Sesuaikan kelas body/halaman jika diperlukan
    document.body.classList.remove('home-bg', 'profile-bg', 'payment-bg', 'leaderboard-bg', 'belanja-bg', 'labirin-bg', 'login-bg', 'signup-bg', 'saya-bg', 'pasar-bg', 'disclaimer-bg', 'faq-bg', 'return-policy-bg', 'privacy-policy-bg', 'term-bg');
    document.body.classList.add('edit-profile-bg');
}

// Fungsi untuk menampilkan halaman Leaderboard
function showLeaderboard() {
    // Sembunyikan semua konten yang lain
    document.getElementById('home-konten').style.display = 'none';
    document.getElementById('profile-konten').style.display = 'none';
    document.getElementById('payment-konten').style.display = 'none';
    document.getElementById('edit-profile-konten').style.display = 'none';
    document.getElementById('belanja-konten').style.display = 'none';
    document.getElementById('labirin-konten').style.display = 'none';
    document.getElementById('login-konten').style.display = 'none';
    document.getElementById('signup-konten').style.display = 'none';
    document.getElementById('saya-konten').style.display = 'none';
    document.getElementById('pasar-konten').style.display = 'none';
    document.getElementById('disclaimer-konten').style.display = 'none';
    document.getElementById('faq-konten').style.display = 'none';
    document.getElementById('return-policy-konten').style.display = 'none';
    document.getElementById('privacy-policy-konten').style.display = 'none';
    document.getElementById('term-konten').style.display = 'none';

    // Tampilkan konten Leaderboard
    document.getElementById('leaderboard-konten').style.display = 'block';

    // Sesuaikan kelas body/halaman jika diperlukan
    document.body.classList.remove('home-bg', 'profile-bg', 'payment-bg', 'edit-profile-bg', 'belanja-bg', 'labirin-bg', 'login-bg', 'signup-bg', 'saya-bg', 'pasar-bg', 'disclaimer-bg', 'faq-bg', 'return-policy-bg', 'privacy-policy-bg', 'term-bg');
    document.body.classList.add('leaderboard-bg');
}

// Fungsi untuk menampilkan halaman Belanja
function showBelanja() {
    // Sembunyikan semua konten yang lain
    document.getElementById('home-konten').style.display = 'none';
    document.getElementById('profile-konten').style.display = 'none';
    document.getElementById('payment-konten').style.display = 'none';
    document.getElementById('edit-profile-konten').style.display = 'none';
    document.getElementById('leaderboard-konten').style.display = 'none';
    document.getElementById('labirin-konten').style.display = 'none';
    document.getElementById('login-konten').style.display = 'none';
    document.getElementById('signup-konten').style.display = 'none';
    document.getElementById('saya-konten').style.display = 'none';
    document.getElementById('pasar-konten').style.display = 'none';
    document.getElementById('disclaimer-konten').style.display = 'none';
    document.getElementById('faq-konten').style.display = 'none';
    document.getElementById('return-policy-konten').style.display = 'none';
    document.getElementById('privacy-policy-konten').style.display = 'none';
    document.getElementById('term-konten').style.display = 'none';

    // Tampilkan konten Belanja
    document.getElementById('belanja-konten').style.display = 'block';

    // Sesuaikan kelas body/halaman jika diperlukan
    document.body.classList.remove('home-bg', 'profile-bg', 'payment-bg', 'edit-profile-bg', 'leaderboard-bg', 'labirin-bg', 'login-bg', 'signup-bg', 'saya-bg', 'pasar-bg', 'disclaimer-bg', 'faq-bg', 'return-policy-bg', 'privacy-policy-bg', 'term-bg');
    document.body.classList.add('belanja-bg');
}

// Fungsi untuk menampilkan halaman Labirin
function showLabirin() {
    // Sembunyikan semua konten yang lain
    document.getElementById('home-konten').style.display = 'none';
    document.getElementById('profile-konten').style.display = 'none';
    document.getElementById('payment-konten').style.display = 'none';
    document.getElementById('edit-profile-konten').style.display = 'none';
    document.getElementById('leaderboard-konten').style.display = 'none';
    document.getElementById('belanja-konten').style.display = 'none';
    document.getElementById('login-konten').style.display = 'none';
    document.getElementById('signup-konten').style.display = 'none';
    document.getElementById('saya-konten').style.display = 'none';
    document.getElementById('pasar-konten').style.display = 'none';
    document.getElementById('disclaimer-konten').style.display = 'none';
    document.getElementById('faq-konten').style.display = 'none';
    document.getElementById('return-policy-konten').style.display = 'none';
    document.getElementById('privacy-policy-konten').style.display = 'none';
    document.getElementById('term-konten').style.display = 'none';

    // Tampilkan konten Labirin
    document.getElementById('labirin-konten').style.display = 'block';

    // Sesuaikan kelas body/halaman jika diperlukan
    document.body.classList.remove('home-bg', 'profile-bg', 'payment-bg', 'edit-profile-bg', 'leaderboard-bg', 'belanja-bg', 'login-bg', 'signup-bg', 'saya-bg', 'pasar-bg', 'disclaimer-bg', 'faq-bg', 'return-policy-bg', 'privacy-policy-bg', 'term-bg');
    document.body.classList.add('labirin-bg');
}

// Fungsi untuk menampilkan halaman Login
function showLogin() {
    // Sembunyikan semua konten yang lain
    document.getElementById('home-konten').style.display = 'none';
    document.getElementById('profile-konten').style.display = 'none';
    document.getElementById('payment-konten').style.display = 'none';
    document.getElementById('edit-profile-konten').style.display = 'none';
    document.getElementById('leaderboard-konten').style.display = 'none';
    document.getElementById('belanja-konten').style.display = 'none';
    document.getElementById('labirin-konten').style.display = 'none';
    document.getElementById('signup-konten').style.display = 'none';
    document.getElementById('saya-konten').style.display = 'none';
    document.getElementById('pasar-konten').style.display = 'none';
    document.getElementById('disclaimer-konten').style.display = 'none';
    document.getElementById('faq-konten').style.display = 'none';
    document.getElementById('return-policy-konten').style.display = 'none';
    document.getElementById('privacy-policy-konten').style.display = 'none';
    document.getElementById('term-konten').style.display = 'none';

    // Tampilkan konten Login
    document.getElementById('login-konten').style.display = 'block';

    // Sesuaikan kelas body/halaman jika diperlukan
    document.body.classList.remove('home-bg', 'profile-bg', 'payment-bg', 'edit-profile-bg', 'leaderboard-bg', 'belanja-bg', 'labirin-bg', 'signup-bg', 'saya-bg', 'pasar-bg', 'disclaimer-bg', 'faq-bg', 'return-policy-bg', 'privacy-policy-bg', 'term-bg');
    document.body.classList.add('login-bg');
}

// Fungsi untuk menampilkan halaman Signup
function showSignup() {
    // Sembunyikan semua konten yang lain
    document.getElementById('home-konten').style.display = 'none';
    document.getElementById('profile-konten').style.display = 'none';
    document.getElementById('payment-konten').style.display = 'none';
    document.getElementById('edit-profile-konten').style.display = 'none';
    document.getElementById('leaderboard-konten').style.display = 'none';
    document.getElementById('belanja-konten').style.display = 'none';
    document.getElementById('labirin-konten').style.display = 'none';
    document.getElementById('login-konten').style.display = 'none';
    document.getElementById('saya-konten').style.display = 'none';
    document.getElementById('pasar-konten').style.display = 'none';
    document.getElementById('disclaimer-konten').style.display = 'none';
    document.getElementById('faq-konten').style.display = 'none';
    document.getElementById('return-policy-konten').style.display = 'none';
    document.getElementById('privacy-policy-konten').style.display = 'none';
    document.getElementById('term-konten').style.display = 'none';

    // Tampilkan konten Signup
    document.getElementById('signup-konten').style.display = 'block';

    // Sesuaikan kelas body/halaman jika diperlukan
    document.body.classList.remove('home-bg', 'profile-bg', 'payment-bg', 'edit-profile-bg', 'leaderboard-bg', 'belanja-bg', 'labirin-bg', 'login-bg', 'saya-bg', 'pasar-bg', 'disclaimer-bg', 'faq-bg', 'return-policy-bg', 'privacy-policy-bg', 'term-bg');
    document.body.classList.add('signup-bg');
}

// Fungsi untuk menampilkan halaman Saya
function showSaya() {
    // Sembunyikan semua konten yang lain
    document.getElementById('home-konten').style.display = 'none';
    document.getElementById('profile-konten').style.display = 'none';
    document.getElementById('payment-konten').style.display = 'none';
    document.getElementById('edit-profile-konten').style.display = 'none';
    document.getElementById('leaderboard-konten').style.display = 'none';
    document.getElementById('belanja-konten').style.display = 'none';
    document.getElementById('labirin-konten').style.display = 'none';
    document.getElementById('login-konten').style.display = 'none';
    document.getElementById('signup-konten').style.display = 'none';
    document.getElementById('pasar-konten').style.display = 'none';
    document.getElementById('disclaimer-konten').style.display = 'none';
    document.getElementById('faq-konten').style.display = 'none';
    document.getElementById('return-policy-konten').style.display = 'none';
    document.getElementById('privacy-policy-konten').style.display = 'none';
    document.getElementById('term-konten').style.display = 'none';

    // Tampilkan konten Saya
    document.getElementById('saya-konten').style.display = 'block';

    // Sesuaikan kelas body/halaman jika diperlukan
    document.body.classList.remove('home-bg', 'profile-bg', 'payment-bg', 'edit-profile-bg', 'leaderboard-bg', 'belanja-bg', 'labirin-bg', 'login-bg', 'signup-bg', 'pasar-bg', 'disclaimer-bg', 'faq-bg', 'return-policy-bg', 'privacy-policy-bg', 'term-bg');
    document.body.classList.add('saya-bg');
}

// Fungsi untuk menampilkan halaman Pasar
function showPasar() {
    // Sembunyikan semua konten yang lain
    document.getElementById('home-konten').style.display = 'none';
    document.getElementById('profile-konten').style.display = 'none';
    document.getElementById('payment-konten').style.display = 'none';
    document.getElementById('edit-profile-konten').style.display = 'none';
    document.getElementById('leaderboard-konten').style.display = 'none';
    document.getElementById('belanja-konten').style.display = 'none';
    document.getElementById('labirin-konten').style.display = 'none';
    document.getElementById('login-konten').style.display = 'none';
    document.getElementById('signup-konten').style.display = 'none';
    document.getElementById('saya-konten').style.display = 'none';
    document.getElementById('disclaimer-konten').style.display = 'none';
    document.getElementById('faq-konten').style.display = 'none';
    document.getElementById('return-policy-konten').style.display = 'none';
    document.getElementById('privacy-policy-konten').style.display = 'none';
    document.getElementById('term-konten').style.display = 'none';

    // Tampilkan konten Pasar
    document.getElementById('pasar-konten').style.display = 'block';

    // Sesuaikan kelas body/halaman jika diperlukan
    document.body.classList.remove('home-bg', 'profile-bg', 'payment-bg', 'edit-profile-bg', 'leaderboard-bg', 'belanja-bg', 'labirin-bg', 'login-bg', 'signup-bg', 'saya-bg', 'disclaimer-bg', 'faq-bg', 'return-policy-bg', 'privacy-policy-bg', 'term-bg');
    document.body.classList.add('pasar-bg');
}

// Fungsi untuk menampilkan halaman Disclaimer
function showDisclaimer() {
    // Sembunyikan semua konten yang lain
    document.getElementById('home-konten').style.display = 'none';
    document.getElementById('profile-konten').style.display = 'none';
    document.getElementById('payment-konten').style.display = 'none';
    document.getElementById('edit-profile-konten').style.display = 'none';
    document.getElementById('leaderboard-konten').style.display = 'none';
    document.getElementById('belanja-konten').style.display = 'none';
    document.getElementById('labirin-konten').style.display = 'none';
    document.getElementById('login-konten').style.display = 'none';
    document.getElementById('signup-konten').style.display = 'none';
    document.getElementById('saya-konten').style.display = 'none';
    document.getElementById('pasar-konten').style.display = 'none';
    document.getElementById('faq-konten').style.display = 'none';
    document.getElementById('return-policy-konten').style.display = 'none';
    document.getElementById('privacy-policy-konten').style.display = 'none';
    document.getElementById('term-konten').style.display = 'none';

    // Tampilkan konten Disclaimer
    document.getElementById('disclaimer-konten').style.display = 'block';

    // Sesuaikan kelas body/halaman jika diperlukan
    document.body.classList.remove('home-bg', 'profile-bg', 'payment-bg', 'edit-profile-bg', 'leaderboard-bg', 'belanja-bg', 'labirin-bg', 'login-bg', 'signup-bg', 'saya-bg', 'pasar-bg', 'faq-bg', 'return-policy-bg', 'privacy-policy-bg', 'term-bg');
    document.body.classList.add('disclaimer-bg');
}

// Fungsi untuk menampilkan halaman FAQ
function showFaq() {
    // Sembunyikan semua konten yang lain
    document.getElementById('home-konten').style.display = 'none';
    document.getElementById('profile-konten').style.display = 'none';
    document.getElementById('payment-konten').style.display = 'none';
    document.getElementById('edit-profile-konten').style.display = 'none';
    document.getElementById('leaderboard-konten').style.display = 'none';
    document.getElementById('belanja-konten').style.display = 'none';
    document.getElementById('labirin-konten').style.display = 'none';
    document.getElementById('login-konten').style.display = 'none';
    document.getElementById('signup-konten').style.display = 'none';
    document.getElementById('saya-konten').style.display = 'none';
    document.getElementById('pasar-konten').style.display = 'none';
    document.getElementById('disclaimer-konten').style.display = 'none';
    document.getElementById('return-policy-konten').style.display = 'none';
    document.getElementById('privacy-policy-konten').style.display = 'none';
    document.getElementById('term-konten').style.display = 'none';

    // Tampilkan konten FAQ
    document.getElementById('faq-konten').style.display = 'block';

    // Sesuaikan kelas body/halaman jika diperlukan
    document.body.classList.remove('home-bg', 'profile-bg', 'payment-bg', 'edit-profile-bg', 'leaderboard-bg', 'belanja-bg', 'labirin-bg', 'login-bg', 'signup-bg', 'saya-bg', 'pasar-bg', 'disclaimer-bg', 'return-policy-bg', 'privacy-policy-bg', 'term-bg');
    document.body.classList.add('faq-bg');
}

// Fungsi untuk menampilkan halaman Kebijakan Pengembalian
function showReturnPolicy() {
    // Sembunyikan semua konten yang lain
    document.getElementById('home-konten').style.display = 'none';
    document.getElementById('profile-konten').style.display = 'none';
    document.getElementById('payment-konten').style.display = 'none';
    document.getElementById('edit-profile-konten').style.display = 'none';
    document.getElementById('leaderboard-konten').style.display = 'none';
    document.getElementById('belanja-konten').style.display = 'none';
    document.getElementById('labirin-konten').style.display = 'none';
    document.getElementById('login-konten').style.display = 'none';
    document.getElementById('signup-konten').style.display = 'none';
    document.getElementById('saya-konten').style.display = 'none';
    document.getElementById('pasar-konten').style.display = 'none';
    document.getElementById('disclaimer-konten').style.display = 'none';
    document.getElementById('faq-konten').style.display = 'none';
    document.getElementById('privacy-policy-konten').style.display = 'none';
    document.getElementById('term-konten').style.display = 'none';

    // Tampilkan konten Kebijakan Pengembalian
    document.getElementById('return-policy-konten').style.display = 'block';

    // Sesuaikan kelas body/halaman jika diperlukan
    document.body.classList.remove('home-bg', 'profile-bg', 'payment-bg', 'edit-profile-bg', 'leaderboard-bg', 'belanja-bg', 'labirin-bg', 'login-bg', 'signup-bg', 'saya-bg', 'pasar-bg', 'disclaimer-bg', 'faq-bg', 'privacy-policy-bg', 'term-bg');
    document.body.classList.add('return-policy-bg');
}

// Fungsi untuk menampilkan halaman Kebijakan Privasi
function showPrivacyPolicy() {
    // Sembunyikan semua konten yang lain
    document.getElementById('home-konten').style.display = 'none';
    document.getElementById('profile-konten').style.display = 'none';
    document.getElementById('payment-konten').style.display = 'none';
    document.getElementById('edit-profile-konten').style.display = 'none';
    document.getElementById('leaderboard-konten').style.display = 'none';
    document.getElementById('belanja-konten').style.display = 'none';
    document.getElementById('labirin-konten').style.display = 'none';
    document.getElementById('login-konten').style.display = 'none';
    document.getElementById('signup-konten').style.display = 'none';
    document.getElementById('saya-konten').style.display = 'none';
    document.getElementById('pasar-konten').style.display = 'none';
    document.getElementById('disclaimer-konten').style.display = 'none';
    document.getElementById('faq-konten').style.display = 'none';
    document.getElementById('return-policy-konten').style.display = 'none';
    document.getElementById('term-konten').style.display = 'none';

    // Tampilkan konten Kebijakan Privasi
    document.getElementById('privacy-policy-konten').style.display = 'block';

    // Sesuaikan kelas body/halaman jika diperlukan
    document.body.classList.remove('home-bg', 'profile-bg', 'payment-bg', 'edit-profile-bg', 'leaderboard-bg', 'belanja-bg', 'labirin-bg', 'login-bg', 'signup-bg', 'saya-bg', 'pasar-bg', 'disclaimer-bg', 'faq-bg', 'return-policy-bg', 'term-bg');
    document.body.classList.add('privacy-policy-bg');
}

// Fungsi untuk menampilkan halaman Syarat dan Ketentuan
function showTerm() {
    // Sembunyikan semua konten yang lain
    document.getElementById('home-konten').style.display = 'none';
    document.getElementById('profile-konten').style.display = 'none';
    document.getElementById('payment-konten').style.display = 'none';
    document.getElementById('edit-profile-konten').style.display = 'none';
    document.getElementById('leaderboard-konten').style.display = 'none';
    document.getElementById('belanja-konten').style.display = 'none';
    document.getElementById('labirin-konten').style.display = 'none';
    document.getElementById('login-konten').style.display = 'none';
    document.getElementById('signup-konten').style.display = 'none';
    document.getElementById('saya-konten').style.display = 'none';
    document.getElementById('pasar-konten').style.display = 'none';
    document.getElementById('disclaimer-konten').style.display = 'none';
    document.getElementById('faq-konten').style.display = 'none';
    document.getElementById('return-policy-konten').style.display = 'none';
    document.getElementById('privacy-policy-konten').style.display = 'none';
    document.getElementById('term-konten').style.display = 'block';

 
    document.body.classList.remove('home-bg', 'profile-bg', 'payment-bg', 'edit-profile-bg', 'leaderboard-bg', 'belanja-bg', 'labirin-bg', 'login-bg', 'signup-bg', 'saya-bg', 'pasar-bg', 'disclaimer-bg', 'faq-bg', 'return-policy-bg', 'privacy-policy-bg');
    document.body.classList.add('term-bg');
}


