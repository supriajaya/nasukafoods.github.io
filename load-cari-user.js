fetch('cari-user.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('load-cari-user').innerHTML = html;
  });
