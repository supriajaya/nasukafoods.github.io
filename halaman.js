function showHalaman(halamanId) {
  const halamans = ['home','profil','editprofil','saya','belanja','payment','burung','roll','labirin','puzzle','rule','disclaimer','leaderboard','faq','return','privacy','term','pasar','login','zona1','zona2']; 

  halamans.forEach(id => {
    const element = document.getElementById(id + '-halaman');
    if (element) element.style.display = 'none';
  });

  const selectedHalaman = document.getElementById(halamanId + '-halaman');
  if (selectedHalaman) selectedHalaman.style.display = 'block';
}
  
