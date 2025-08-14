// nasuka.js

const firebaseConfig = {
  apiKey: "AIzaSyDPJfJgUg8a_e1zS3nSbU8RqHj3TOALX2s",
  authDomain: "nasuka-fc780.firebaseapp.com",
  databaseURL: "https://nasuka-fc780-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "nasuka-fc780",
  messagingSenderId: "860641747257",
  appId: "1:860641747257:web:d1dc28bf34cc1f64ad48e8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const userCache = {};

// DOM Content Loaded Event
document.addEventListener("DOMContentLoaded", () => {
  initializeUserProfile();
  setupSearchFunctionality();
  setupChatNotifications();
  loadPosts();
  setupProductModals();
  setupPolicyModals();
});

// Initialize User Profile
function initializeUserProfile() {
  const userID = localStorage.getItem("ID") || "";
  const fotoEl = document.getElementById("fotoProfil");
  const namaEl = document.getElementById("namaUser");
  const profilLink = document.getElementById("linkProfil");

  if (!userID) {
    namaEl.textContent = "Silakan Masuk";
    fotoEl.src = "https://nasukafoods.site/gambarkosong.jpg";
    profilLink.href = "login.html";
    return;
  }

  const nama = localStorage.getItem("Nama");
  const foto = localStorage.getItem("Foto");

  if (nama && foto) {
    updateProfileDisplay(nama, foto, userID);
  } else {
    fetchUserProfileFromDB(userID);
  }
}

function updateProfileDisplay(nama, foto, userID) {
  document.getElementById("namaUser").textContent = nama;
  document.getElementById("fotoProfil").src = foto;
  document.getElementById("linkProfil").href = `profil.html?id=${encodeURIComponent(userID)}`;
}

function fetchUserProfileFromDB(userID) {
  db.ref("users").orderByChild("ID").equalTo(userID).once("value").then(snap => {
    snap.forEach(child => {
      const val = child.val();
      localStorage.setItem("Nama", val.Nama || "Tanpa Nama");
      localStorage.setItem("Foto", val.Foto || "https://nasukafoods.site/gambarkosong.jpg");
      updateProfileDisplay(val.Nama || "Tanpa Nama", val.Foto || "https://nasukafoods.site/gambarkosong.jpg", userID);
    });
  });
}

// Search Functionality
function setupSearchFunctionality() {
  const hasilUserEl = document.getElementById("hasilUser");
  document.getElementById("cariUser").addEventListener("input", function() {
    const k = this.value.trim().toLowerCase();
    hasilUserEl.innerHTML = "";
    if (k.length < 2) return;
    
    db.ref("users").orderByChild("NamaLower").startAt(k).endAt(k + "\uf8ff").limitToFirst(20).once("value").then(snap => {
      snap.forEach(child => {
        const v = child.val();
        const d = document.createElement("div");
        d.innerHTML = `<div style="display:flex; align-items:center; gap:8px; background:#fff; padding:8px; border-radius:6px; box-shadow:0 1px 4px rgba(0,0,0,0.1)"><img src="${v.Foto || "https://nasukafoods.site/gambarkosong.jpg"}" style="width:40px; height:40px; border-radius:50%; object-fit:cover" /><div style="flex:1"><b>${v.Nama || "Tanpa Nama"}</b><br /><a href="profil.html?id=${encodeURIComponent(v.ID)}" style="font-size:12px; color:#2196F3">Lihat Profil</a></div></div>`;
        hasilUserEl.appendChild(d);
      });
    });
  });
}

// Chat Notifications
function setupChatNotifications() {
  const userID = localStorage.getItem("ID") || "";
  if (!userID) return;

  const notifInbox = document.getElementById("notifInbox");
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

async function showChatSendersList(userID) {
  const snapshot = await db.ref(`users/${userID}/chats`).once('value');
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

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '❌';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '6px';
  closeBtn.style.right = '6px';
  closeBtn.style.background = 'transparent';
  closeBtn.style.border = 'none';
  closeBtn.style.fontSize = '18px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.onclick = () => document.body.removeChild(container);
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
}

// Posts Functionality
function loadPosts() {
  const daftar = document.getElementById("daftarPostingan");
  db.ref("posts").orderByChild("Status").equalTo("publik").limitToLast(20).on("child_added", async postSnap => {
    const post = postSnap.val();
    const postId = postSnap.key;
    const namaPemilik = await getUserData(post.ID);
    
    const div = document.createElement("div");
    div.className = "post-item";
    div.style.flexDirection = "column";
    div.innerHTML = createPostHTML(namaPemilik, post, postId);
    
    daftar.prepend(div);
    setupPostInteractions(postId);
  });
}

async function getUserData(uid) {
  return new Promise(resolve => {
    if (userCache[uid]) return resolve(userCache[uid]);
    
    db.ref("users").orderByChild("ID").equalTo(uid).once("value").then(snap => {
      let nama = "Tanpa Nama";
      snap.forEach(u => {
        if (u.val().Nama) nama = u.val().Nama;
      });
      userCache[uid] = nama;
      resolve(nama);
    });
  });
}

function createPostHTML(namaPemilik, post, postId) {
  return `
    <div style="text-align:center; font-weight:bold; font-size:14px; margin-bottom:6px">${namaPemilik}</div>
    ${post.Foto ? `<img src="${post.Foto}" class="foto-post" style="width:100px; height:100px; margin:0 auto 8px; display:block; border-radius:8px; object-fit:cover; cursor:pointer" onclick="tampilkanGambarPenuh('${post.Foto}')" />` : ``}
    <div style="font-size:13px; margin:4px 0"><b>${(post.Judul || "").replace(/\n/g, "<br>")}</b></div>
    <div style="font-size:11px; color:gray">${post.Waktu ? new Date(post.Waktu).toLocaleString("id-ID") : ""}</div>
    <div style="display:flex; align-items:center; gap:8px; margin-top:8px">
      <button onclick="toggleLike('${postId}')" id="likeBtn-${postId}" style="padding:6px 10px; border:none; border-radius:6px; cursor:pointer; font-size:13px">❤️</button>
      <span id="likeCount-${postId}" style="font-size:13px">0 suka</span>
    </div>
    <div id="komentar-${postId}" style="margin-top:10px; display:none;"></div>
    <button id="lihatKomentarBtn-${postId}" style="margin-top:6px; padding:6px 10px; background:red; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:13px">Lihat Komentar</button>
    <div style="display:flex; gap:6px; margin-top:6px">
      <textarea id="inputKomentar-${postId}" placeholder="Tulis komentar..." style="flex:1; padding:6px; border:1px solid #ccc; border-radius:6px; font-size:13px; resize:none" rows="1"></textarea>
      <button onclick="kirimKomentar('${postId}')" style="padding:6px 10px; background:#2196F3; color:white; border:none; border-radius:6px; font-size:13px">Ok</button>
    </div>
  `;
}

function setupPostInteractions(postId) {
  const userID = localStorage.getItem("ID") || "";
  
  // Likes functionality
  db.ref("likes/" + postId).on("value", snap => {
    document.getElementById("likeCount-" + postId).textContent = `${snap.numChildren()} suka`;
    const likeBtn = document.getElementById("likeBtn-" + postId);
    
    if (likeBtn) {
      if (snap.hasChild(userID)) {
        likeBtn.textContent = "❤️";
        likeBtn.style.background = "#f8d7da";
      } else {
        likeBtn.textContent = "💔";
        likeBtn.style.background = "#eee";
      }
    }
  });

  // Comments functionality
  let komentarLoaded = false;
  const btnLihat = document.getElementById(`lihatKomentarBtn-${postId}`);
  const wadahKomentar = document.getElementById(`komentar-${postId}`);
  
  btnLihat.onclick = () => {
    if (wadahKomentar.style.display === "none") {
      wadahKomentar.style.display = "block";
      btnLihat.textContent = "Sembunyikan Komentar";
      
      if (!komentarLoaded) {
        db.ref("komentar/" + postId).on("value", snap => {
          wadahKomentar.innerHTML = "";
          snap.forEach(c => {
            const v = c.val();
            const d = document.createElement("div");
            d.style = "background:#f9f9f9; padding:6px; margin-top:4px; border-radius:6px; font-size:12px";
            d.innerHTML = `<b>${v.Nama || "Anonim"}</b>: ${(v.Teks || "").replace(/\n/g, "<br>")}`;
            wadahKomentar.appendChild(d);
          });
        });
        komentarLoaded = true;
      }
    } else {
      wadahKomentar.style.display = "none";
      btnLihat.textContent = "Lihat Komentar";
    }
  };
}

// Global functions
window.kirimKomentar = function(postId) {
  const userID = localStorage.getItem("ID") || "";
  if (!userID) return alert("Silakan login dulu untuk komentar");
  
  const nama = localStorage.getItem("Nama") || "Anonim";
  const input = document.getElementById("inputKomentar-" + postId);
  const teks = (input?.value || "").trim();
  
  if (!teks) return;
  
  db.ref("komentar/" + postId).push({
    ID: userID,
    Nama: nama,
    Teks: teks,
    Waktu: new Date().toISOString()
  });
  
  input.value = "";
};

window.toggleLike = function(postId) {
  const userID = localStorage.getItem("ID") || "";
  if (!userID) return alert("Silakan login dulu untuk like");
  
  const refLike = db.ref("likes/" + postId + "/" + userID);
  refLike.once("value").then(snap => {
    if (snap.exists()) {
      refLike.remove();
    } else {
      refLike.set(true);
    }
  });
};

window.tampilkanGambarPenuh = function(src) {
  if (!src) return;
  
  const modal = document.getElementById("modalGambar");
  const gambar = document.getElementById("gambarModal");
  gambar.src = src;
  modal.style.display = "flex";
};

// Modal functionality for images
document.getElementById("modalGambar").addEventListener("click", () => {
  document.getElementById("modalGambar").style.display = "none";
});

// Product Modals
function setupProductModals() {
  for (let i = 1; i <= 4; i++) {
    setupModalSet(i);
  }
}

function setupModalSet(idx) {
  const modalPembayaran = document.getElementById("modalPembayaran" + idx);
  const tutupPembayaran = document.getElementById("tutupPembayaran" + idx);
  const produkEl = document.getElementById("produk" + idx);

  if (produkEl) {
    produkEl.addEventListener("click", e => {
      e.preventDefault();
      modalPembayaran.style.display = "flex";
    });
  }

  tutupPembayaran.addEventListener("click", () => {
    modalPembayaran.style.display = "none";
  });

  modalPembayaran.addEventListener("click", e => {
    if (e.target === modalPembayaran) {
      modalPembayaran.style.display = "none";
    }
  });

  // Payment method buttons
  document.getElementById('btnQris' + idx).onclick = () => document.getElementById('modalQris' + idx).style.display = 'flex';
  document.getElementById('btnDana' + idx).onclick = () => document.getElementById('modalDana' + idx).style.display = 'flex';
  document.getElementById('btnOvo' + idx).onclick = () => document.getElementById('modalOvo' + idx).style.display = 'flex';
  document.getElementById('btnGopay' + idx).onclick = () => document.getElementById('modalGopay' + idx).style.display = 'flex';
  document.getElementById('btnShopeepay' + idx).onclick = () => document.getElementById('modalShopeepay' + idx).style.display = 'flex';

  // Close buttons for payment methods
  document.getElementById('tutupQris' + idx).onclick = () => document.getElementById('modalQris' + idx).style.display = 'none';
  document.getElementById('tutupDana' + idx).onclick = () => document.getElementById('modalDana' + idx).style.display = 'none';
  document.getElementById('tutupOvo' + idx).onclick = () => document.getElementById('modalOvo' + idx).style.display = 'none';
  document.getElementById('tutupGopay' + idx).onclick = () => document.getElementById('modalGopay' + idx).style.display = 'none';
  document.getElementById('tutupShopeepay' + idx).onclick = () => document.getElementById('modalShopeepay' + idx).style.display = 'none';
}

// Policy Modals
function setupPolicyModals() {
  // FAQ
  document.getElementById('faqBtn').onclick = () => document.getElementById('faqModal').style.display = 'block';
  document.getElementById('closeFaq').onclick = () => document.getElementById('faqModal').style.display = 'none';

  // Refund Policy
  document.getElementById('refundBtn').onclick = () => document.getElementById('refundModal').style.display = 'block';
  document.getElementById('closeRefund').onclick = () => document.getElementById('refundModal').style.display = 'none';

  // Privacy Policy
  document.getElementById('privacyBtn').onclick = () => document.getElementById('privacyModal').style.display = 'block';
  document.getElementById('closePrivacy').onclick = () => document.getElementById('privacyModal').style.display = 'none';

  // Term & Condition
  document.getElementById('termBtn').onclick = () => document.getElementById('termModal').style.display = 'block';
  document.getElementById('closeTerm').onclick = () => document.getElementById('termModal').style.display = 'none';

  // Close when clicking outside
  window.onclick = function(e) {
    const modals = ['faqModal','refundModal','privacyModal','termModal'];
    modals.forEach(id => {
      if (e.target == document.getElementById(id)) {
        document.getElementById(id).style.display = 'none';
      }
    });
  };
}
