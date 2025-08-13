fetch('cari-user.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('tempat-cari-user').innerHTML = html;
  });
