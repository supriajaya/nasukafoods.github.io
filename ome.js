// Initialize the home page
function initializeHome() {
  console.log('Home page successfully loaded and initialized.');
  initializeUserProfile();
  setupChatNotifications();
}

// Initialize user profile display on the home page
function initializeUserProfile() {
  const userID = localStorage.getItem("ID") || "";
  const fotoEl = document.getElementById("Profil");
  const namaEl = document.getElementById("Nama");
  const profilLink = document.getElementById("Profil");
      
  if (!userID) {
    if (namaEl) namaEl.textContent = "Silahkan Masuk";
    if (fotoEl) fotoEl.src = "https://nasukafoods.site/gambarkosong.jpg";
    if (profilLink) {
      profilLink.href = "#";
      profilLink.onclick = showLogin;
    }
    return;
  }
  
  fetchUserProfileFromDB(userID).then(userData => {
    const nama = userData ? (userData.Nama || "Tanpa Nama") : "Tanpa Nama";
    const foto = userData ? (userData.Foto || "https://nasukafoods.site/gambarkosong.jpg") : "https://nasukafoods.site/gambarkosong.jpg";
    localStorage.setItem("Nama", nama);
    localStorage.setItem("Foto", foto);
    updateProfileDisplay(nama, foto, userID);
  });
}

// Update the profile display with fetched data
function updateProfileDisplay(nama, foto, userID) {
  const namaEl = document.getElementById("Nama");
  const fotoEl = document.getElementById("Foto");
  const profilLink = document.getElementById("Profil");

  if (namaEl) namaEl.textContent = nama;
  if (fotoEl) fotoEl.src = foto;
  
  if (profilLink) {
    profilLink.href = "#";
    profilLink.onclick = showProfil;
  }
}

// Set up real-time chat notifications
function setupChatNotifications() {
  const userID = localStorage.getItem("ID") || "";
  const notifInbox = document.getElementById("notifInbox");
  if (!userID || !notifInbox) return;
  
  const userRef = db.ref(`users/${userID}`);
  userRef.on('value', (snapshot) => {
    const userData = snapshot.val();
    if (userData !== null) {
      localUser.Perak = userData.Perak || 0;
      localStorage.setItem("Perak", localUser.Perak);
      updatePerakDisplay();
    }
  });

  const userChatsRef = db.ref(`users/${userID}/chats`);
  
  userChatsRef.on('value', snapshot => {
    const chats = snapshot.val() || {};
    let unreadCount = 0;
    for (const key in chats) {
      if ((chats[key].read === false || chats[key].read === undefined) && chats[key].ID !== userID) {
        unreadCount++;
      }
    }
  
    if (unreadCount > 0) {
      notifInbox.style.display = 'inline-block';
      notifInbox.textContent = unreadCount > 99 ? '99+' : unreadCount;
    } else {
      notifInbox.style.display = 'none';
      notifInbox.textContent = '';
    }
  });
  
  notifInbox.onclick = () => {
    showChatSendersList(userID);
  };
}

// Show list of chat senders
async function showChatSendersList(userID) {
  const snapshot = await db.ref(`users/${userID}/chats`).once('value');
  const chats = snapshot.val() || {};
  
  if (Object.keys(chats).length === 0) {
    alert('No message senders');
    return;
  }
  
  const pengirimData = [];
  for (const chatID of Object.keys(chats)) {
    const userSnap = await db.ref('users').orderByChild('ID').equalTo(chatID).once('value');
    userSnap.forEach(u => {
      const nama = u.val().Nama || 'User';
      pengirimData.push({ id: chatID, nama });
    });
  }
  
  const container = document.createElement('div');
  container.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff; border: 1px solid #ccc; border-radius: 8px; padding: 12px; z-index: 9999; max-height: 300px; overflow-y: auto; min-width: 200px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);';
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'x';
  closeBtn.style.cssText = 'position: absolute; top: 6px; right: 6px; background: transparent; border: none; font-size: 18px; cursor: pointer;';
  closeBtn.onclick = () => document.body.removeChild(container);
  container.appendChild(closeBtn);
  
  pengirimData.forEach(({ id, nama }) => {
    const btn = document.createElement('button');
    btn.textContent = nama;
    btn.style.cssText = 'display: block; width: 100%; margin: 6px 0; padding: 8px; border: none; border-radius: 4px; background: #2196F3; color: #fff; cursor: pointer;';
    btn.onclick = () => {
      document.body.removeChild(container);
      showInbox(id);
    };
    container.appendChild(btn);
  });
  document.body.appendChild(container);
}
