fetch('https://nasukafoods.site/modal-pembayaran1.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('tempat-modal-pembayaran1').innerHTML = html;
  });
