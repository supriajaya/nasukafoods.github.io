notifInbox.onclick = () => {
  db.ref(`users/${userID}/chats`).once('value').then(async snapshot => {
    const chats = snapshot.val() || {};
    if (Object.keys(chats).length === 0) {
      alert('Tidak ada pengirim pesan');
      return;
    }

    const pengirimData = [];
    for (const chatID of Object.keys(chats)) {
      const userSnap = await db.ref('users').orderByChild('ID').equalTo(chatID).once('value');
      userSnap.forEach(u => {
        const nama = u.val().Nama || 'Pengguna';
        pengirimData.push({ id: chatID, nama });
      });
    }

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '50%';
    container.style.left = '50%';
    container.style.transform = 'translate(-50%, -50%)';
    container.style.background = '#fff';
    container.style.border = '1px solid #ccc';
    container.style.borderRadius = '8px';
    container.style.padding = '12px';
    container.style.zIndex = '9999';
    container.style.maxHeight = '300px';
    container.style.overflowY = 'auto';
    container.style.minWidth = '200px';
    container.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';

    // Tombol close
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '❌';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '6px';
    closeBtn.style.right = '6px';
    closeBtn.style.background = 'transparent';
    closeBtn.style.border = 'none';
    closeBtn.style.fontSize = '18px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => {
      document.body.removeChild(container);
    };
    container.appendChild(closeBtn);

    pengirimData.forEach(({ id, nama }) => {
      const btn = document.createElement('button');
      btn.textContent = nama;
      btn.style.display = 'block';
      btn.style.width = '100%';
      btn.style.margin = '6px 0';
      btn.style.padding = '8px';
      btn.style.border = 'none';
      btn.style.borderRadius = '4px';
      btn.style.background = '#2196F3';
      btn.style.color = '#fff';
      btn.style.cursor = 'pointer';
      btn.onclick = () => {
        document.body.removeChild(container);
        window.location.href = `inbox.html?id=${encodeURIComponent(id)}`;
      };
      container.appendChild(btn);
    });

    document.body.appendChild(container);
  });
};
     
