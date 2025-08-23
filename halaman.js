function tampilkanHalaman(halamanId) {
    const halamans = ['home', 'profil', 'saya', 'inbox', 'belanja', 'beliPerak', 'payment', 'editProfil', 'roll', 'leaderboard', 'faq', 'term', 'burung', 'return', 'privacy', 'faq', 'rule', 'labirin', 'disclaimer'];
    
    halamans.forEach(id => {
        const element = document.getElementById(id + '-halaman');
        if (element) {
            element.style.display = 'none';
        }
    });

    const selectedHalaman = document.getElementById(halamanId + '-halaman');
    if (selectedHalaman) {
        selectedHalaman.style.display = 'block';
    }
}
