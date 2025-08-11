// ==========================
// APP.JS - Gabungan Index + Inbox (SPA Single File)
// 100% mempertahankan semua fungsi & logika
// ==========================

// ---------- GLOBALS ----------
const userCache = {};
const activeFirebaseListeners = []; // { ref, event, handler } untuk .off()
let activeChatListener = null; // khusus chat child_added handler
let currentTargetID = '';
let currentTargetNama = '';
let currentTargetFoto = '';
let currentTargetMode = 'publik';

// user info dari localStorage (jangan ubah)
const ID = localStorage.getItem('ID') || '';
const Username = localStorage.getItem('Username') || '';
const Nama = localStorage.getItem('Nama') || '';

// ---------- HELPERS ----------
function safeGet(id) {
  return document.getElementById(id) || null;
}

function addListener(ref, event, handler) {
  if (!ref || !event || !handler) return;
  ref.on(event, handler);
  activeFirebaseListeners.push({ ref, event, handler });
}

function removeAllListeners() {
  // off semua listener yang kita simpan
  for (const l of activeFirebaseListeners) {
    try {
      l.ref.off(l.event, l.handler);
    } catch (e) {
      // ignore
    }
  }
  activeFirebaseListeners.length = 0;

  // khusus activeChatListener
  if (activeChatListener && currentChatRoomRef) {
    try {
      currentChatRoomRef.off('child_added', activeChatListener);
    } catch (e) { /* ignore */ }
  }
  activeChatListener = null;
}

// will store current chat room ref for proper off()
let currentChatRoomRef = null;

// format waktu (dipakai di inbox)
function formatWaktu(ms) {
  const d = new Date(ms);
  const jam = d.getHours().toString().padStart(2, '0');
  const mnt = d.getMinutes().toString().padStart(2, '0');
  return jam + ':' + mnt;
}

// caching user name
function getUserData(uid) {
  return new Promise(resolve => {
    if (userCache[uid]) return resolve(userCache[uid]);
    db.ref("users").orderByChild("ID").equalTo(uid).once("value").then(snap => {
      let nama = "Tanpa Nama";
      snap.forEach(u => {
        if (u.val().Nama) nama = u.val().Nama;
      });
      userCache[uid] = nama;
      resolve(nama);
    }).catch(() => resolve("Tanpa Nama"));
  });
}

// utility untuk membuat elemen image modal (dipakai di index)
function ensureImageModal() {
  if (safeGet('modalGambar')) return;
  const modal = document.createElement('div');
  modal.id = 'modalGambar';
  Object.assign(modal.style, {
    display: 'none',
    position: 'fixed',
    inset: '0',
    background: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  });
  const img = document.createElement('img');
  img.id = 'gambarModal';
  Object.assign(img.style, { maxWidth: '95%', maxHeight: '95%', borderRadius: '8px' });
  modal.appendChild(img);
  modal.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  document.body.appendChild(modal);
}

// ---------- INDEX MODULE (semua fungsi index.js dipertahankan) ----------
function initIndexModule() {
  // safety: jika elemen index tidak ada, skip inisialisasi UI-specific
  const fotoEl = safeGet("fotoProfil");
  const namaEl = safeGet("namaUser");
  const profilLink = safeGet("linkProfil");
  const notifInbox = safeGet("notifInbox");
  const hasilUserEl = safeGet("hasilUser");
  const daftar = safeGet("daftarPostingan");
  const cariUserEl = safeGet("cariUser");

  // populate profile area
  if (fotoEl && namaEl && profilLink) {
    if (!ID) {
      namaEl.textContent = "Silakan Masuk";
      fotoEl.src = "https://nasukafoods.site/gambarkosong.jpg";
      profilLink.href = "login.html";
    } else {
      const foto = localStorage.getItem("Foto");
      if (Nama && foto) {
        namaEl.textContent = Nama;
        fotoEl.src = foto;
        profilLink.href = `profil.html?id=${encodeURIComponent(ID)}`;
      } else {
        db.ref("users").orderByChild("ID").equalTo(ID).once("value").then(snap => {
          snap.forEach(child => {
            const val = child.val();
            localStorage.setItem("Nama", val.Nama || "Tanpa Nama");
            localStorage.setItem("Foto", val.Foto || "https://nasukafoods.site/gambarkosong.jpg");
            if (namaEl) namaEl.textContent = val.Nama || "Tanpa Nama";
            if (fotoEl) fotoEl.src = val.Foto || "https://nasukafoods.site/gambarkosong.jpg";
            if (profilLink) profilLink.href = `profil.html?id=${encodeURIComponent(ID)}`;
          });
        }).catch(() => {});
      }
    }
  }

  // pencarian user
  if (cariUserEl && hasilUserEl) {
    cariUserEl.addEventListener("input", function() {
      const k = this.value.trim().toLowerCase();
      hasilUserEl.innerHTML = "";
      if (k.length < 2) return;

      db.ref("users")
        .orderByChild("NamaLower")
        .startAt(k)
        .endAt(k + "\uf8ff")
        .limitToFirst(20)
        .once("value")
        .then(snap => {
          snap.forEach(child => {
            const v = child.val();
            const d = document.createElement("div");
            d.innerHTML = `
              <div style="display:flex; align-items:center; gap:8px; background:#fff; padding:8px; border-radius:6px; box-shadow:0 1px 4px rgba(0,0,0,0.1)">
                <img src="${v.Foto || "https://nasukafoods.site/gambarkosong.jpg"}" style="width:40px; height:40px; border-radius:50%; object-fit:cover" />
                <div style="flex:1">
                  <b>${v.Nama || "Tanpa Nama"}</b><br />
                  <a href="#" data-id="${v.ID}" class="linkKirimPesan" style="font-size:12px; color:#2196F3">Kirim Pesan</a>
                </div>
              </div>`;
            hasilUserEl.appendChild(d);
          });
          // attach click for all .linkKirimPesan
          hasilUserEl.querySelectorAll('.linkKirimPesan').forEach(a => {
            a.addEventListener('click', e => {
              e.preventDefault();
              const tid = a.getAttribute('data-id');
              if (tid) showInbox(tid);
            });
          });
        });
    });
  }

  // unread count notifInbox listener
  if (notifInbox) {
    const userChatsRef = db.ref(`users/${ID}/chats`);
    // keep listener so update can be removed when leaving module
    const handler = snapshot => {
      const chats = snapshot.val() || {};
      let unreadCount = 0;
      for (const key in chats) {
        if (chats[key].read === false || chats[key].read === undefined) {
          if (chats[key].ID !== ID) {
            unreadCount++;
          }
        }
      }
      if (unreadCount > 0) {
        notifInbox.style.display = 'inline-block';
        notifInbox.textContent = unreadCount > 99 ? '99+' : unreadCount;
      } else {
        notifInbox.style.display = 'none';
        notifInbox.textContent = '';
      }
    };
    addListener(userChatsRef, 'value', handler);
  }

  // notifInbox onclick -> buka modal list pengirim (preserve original)
  if (notifInbox) {
    notifInbox.onclick = () => {
      db.ref(`users/${ID}/chats`).once('value').then(async snapshot => {
        const chats = snapshot.val() || {};
        if (Object.keys(chats).length === 0) {
          alert('Tidak ada pengirim pesan');
          return;
        }

        const pengirimData = [];
        for (const chatID of Object.keys(chats)) {
          try {
            const userSnap = await db.ref('users').orderByChild('ID').equalTo(chatID).once('value');
            userSnap.forEach(u => {
              const nama = u.val().Nama || 'Pengguna';
              pengirimData.push({ id: chatID, nama });
            });
          } catch (e) { /* ignore single fail */ }
        }

        const container = document.createElement('div');
        Object.assign(container.style, {
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: '#fff', border: '1px solid #ccc', borderRadius: '8px',
          padding: '12px', zIndex: '9999', maxHeight: '300px', overflowY: 'auto',
          minWidth: '200px', boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        });

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '❌';
        Object.assign(closeBtn.style, {
          position: 'absolute', top: '6px', right: '6px',
          background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer'
        });
        closeBtn.onclick = () => document.body.removeChild(container);
        container.appendChild(closeBtn);

        pengirimData.forEach(({ id, nama }) => {
          const btn = document.createElement('button');
          btn.textContent = nama;
          Object.assign(btn.style, {
            display: 'block', width: '100%', margin: '6px 0', padding: '8px',
            border: 'none', borderRadius: '4px', background: '#2196F3',
            color: '#fff', cursor: 'pointer'
          });
          btn.onclick = () => {
            document.body.removeChild(container);
            showInbox(id);
          };
          container.appendChild(btn);
        });

        document.body.appendChild(container);
      });
    };
  }

  // POSTS feed - mempertahankan like/comment UI & logic seperti semula
  if (daftar) {
    // child_added handler (preserve original .on('child_added'))
    const postsRef = db.ref("posts").orderByChild("Status").equalTo("publik").limitToLast(20);
    const handler = async postSnap => {
      const post = postSnap.val();
      const postId = postSnap.key;
      const namaPemilik = await getUserData(post.ID);

      const div = document.createElement("div");
      div.className = "post-item";
      div.style.flexDirection = "column";

      div.innerHTML = `
        <div style="text-align:center; font-weight:bold; font-size:14px; margin-bottom:6px">${namaPemilik}</div>
        ${post.Foto ? `<img src="${post.Foto}" class="foto-post" style="width:100px; height:100px; margin:0 auto 8px; display:block; border-radius:8px; object-fit:cover; cursor:pointer" />` : ``}
        <div style="font-size:13px; margin:4px 0"><b>${(post.Judul || "").replace(/\n/g, "<br>")}</b></div>
        <div style="font-size:11px; color:gray">${post.Waktu ? new Date(post.Waktu).toLocaleString("id-ID") : ""}</div>
        <div style="display:flex; align-items:center; gap:8px; margin-top:8px">
          <button id="likeBtn-${postId}" style="padding:6px 10px; border:none; border-radius:6px; cursor:pointer; font-size:13px">❤️</button>
          <span id="likeCount-${postId}" style="font-size:13px">0 suka</span>
        </div>
        <div id="komentar-${postId}" style="margin-top:10px; display:none;"></div>
        <button id="lihatKomentarBtn-${postId}" style="margin-top:6px; padding:6px 10px; background:red; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:13px">Lihat Komentar</button>
        <div style="display:flex; gap:6px; margin-top:6px">
          <textarea id="inputKomentar-${postId}" placeholder="Tulis komentar..." style="flex:1; padding:6px; border:1px solid #ccc; border-radius:6px; font-size:13px; resize:none" rows="1"></textarea>
          <button id="kirimKomentarBtn-${postId}" style="padding:6px 10px; background:#2196F3; color:white; border:none; border-radius:6px; font-size:13px">Ok</button>
        </div>
      `;

      // prepend to daftar (preserve original order)
      daftar.prepend(div);

      // attach image click to open modal
      if (post.Foto) {
        const imgEl = div.querySelector('.foto-post');
        if (imgEl) {
          imgEl.addEventListener('click', () => {
            tampilkanGambarPenuh(post.Foto);
          });
        }
      }

      // likes listener (preserve original)
      const likeRef = db.ref("likes/" + postId);
      const likeHandler = snap => {
        const count = snap.numChildren();
        const likeCountEl = safeGet("likeCount-" + postId);
        if (likeCountEl) likeCountEl.textContent = `${count} suka`;
        const likeBtn = safeGet("likeBtn-" + postId);
        if (likeBtn) {
          if (snap.hasChild(ID)) {
            likeBtn.textContent = "❤️";
            likeBtn.style.background = "#f8d7da";
          } else {
            likeBtn.textContent = "💔";
            likeBtn.style.background = "#eee";
          }
        }
      };
      addListener(likeRef, 'value', likeHandler);

      // komentar toggle & load (preserve original)
      let komentarLoaded = false;
      const btnLihat = safeGet("lihatKomentarBtn-" + postId);
      const wadahKomentar = safeGet("komentar-" + postId);
      if (btnLihat && wadahKomentar) {
        btnLihat.onclick = () => {
          if (wadahKomentar.style.display === "none") {
            wadahKomentar.style.display = "block";
            btnLihat.textContent = "Sembunyikan Komentar";
            if (!komentarLoaded) {
              const komentarRef = db.ref("komentar/" + postId);
              const cmHandler = snap => {
                wadahKomentar.innerHTML = "";
                snap.forEach(c => {
                  const v = c.val();
                  const d = document.createElement("div");
                  d.style = "background:#f9f9f9; padding:6px; margin-top:4px; border-radius:6px; font-size:12px";
                  d.innerHTML = `<b>${v.Nama || "Anonim"}</b>: ${(v.Teks || "").replace(/\n/g, "<br>")}`;
                  wadahKomentar.appendChild(d);
                });
              };
              addListener(komentarRef, 'value', cmHandler);
              komentarLoaded = true;
            }
          } else {
            wadahKomentar.style.display = "none";
            btnLihat.textContent = "Lihat Komentar";
          }
        };
      }

      // kirim komentar button (preserve original window function)
      const kirimBtn = safeGet("kirimKomentarBtn-" + postId);
      if (kirimBtn) {
        kirimBtn.onclick = () => {
          window.kirimKomentar(postId);
        };
      }
    }; // end post handler

    addListener(postsRef, 'child_added', handler);
  } // end if daftar

  // ensure image modal exists
  ensureImageModal();

} // end initIndexModule

// ---------- WINDOW FUNCTIONS (dari index.js) ----------
window.kirimKomentar = function(postId) {
  const userID = ID;
  if (!userID) return alert("Silakan login dulu untuk komentar");
  const nama = localStorage.getItem("Nama") || "Anonim";
  const input = safeGet("inputKomentar-" + postId);
  const teks = (input?.value || "").trim();
  if (!teks) return;
  db.ref("komentar/" + postId).push({
    ID: userID,
    Nama: nama,
    Teks: teks,
    Waktu: new Date().toISOString()
  });
  if (input) input.value = "";
};

window.toggleLike = function(postId) {
  const userID = ID;
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
  ensureImageModal();
  const modal = safeGet("modalGambar");
  const gambar = safeGet("gambarModal");
  if (gambar) gambar.src = src;
  if (modal) modal.style.display = 'flex';
};

// ---------- INBOX MODULE (semua fungsi inbox.js dipertahankan) ----------
async function initInboxModule(targetID) {
  // safety: jika elemen inbox UI tidak ada, keluar
  const chatBox = safeGet('chatBox');
  const input = safeGet('inputMessage');
  const targetFotoEl = safeGet('targetFotoEl');
  const roomTitle = safeGet('roomTitle');
  const btnSend = safeGet('btnSend');

  // load target info (preserve logic)
  async function loadTargetInfo(targetID) {
    return db.ref('users').orderByChild('ID').equalTo(targetID).once('value').then(snap => {
      let found = false;
      snap.forEach(userSnap => {
        const val = userSnap.val();
        currentTargetID = val.ID;
        currentTargetNama = val.Nama || 'Pengguna';
        currentTargetFoto = val.Foto || 'default.jpg';
        currentTargetMode = val.ModeChat || 'publik';
        found = true;
      });
      if (!found) {
        currentTargetID = targetID;
        currentTargetNama = 'Pengguna';
        currentTargetFoto = 'default.jpg';
        currentTargetMode = 'publik';
      }
    });
  }

  // tulis pesan UI (preserve original tambahPesan)
  function tambahPesan(data) {
    if (!chatBox) return;
    const msgEl = document.createElement('div');
    msgEl.className = data.ID === ID ? 'msg me' : 'msg';

    const text = document.createElement('div');
    text.textContent = data.Pesan;

    const time = document.createElement('span');
    time.className = 'time';
    time.textContent = formatWaktu(data.Waktu || 0);

    msgEl.appendChild(text);
    msgEl.appendChild(time);
    chatBox.appendChild(msgEl);

    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function loadChat(room) {
    if (!chatBox) return;
    chatBox.innerHTML = '';

    // off previous chat listener
    if (activeChatListener && currentChatRoomRef) {
      try {
        currentChatRoomRef.off('child_added', activeChatListener);
      } catch (e) {}
    }

    // set new room ref
    currentChatRoomRef = db.ref(room);
    activeChatListener = snap => {
      const data = snap.val();
      tambahPesan(data);
    };
    currentChatRoomRef.on('child_added', activeChatListener);
    // also keep in our general listeners list so it can be cleared
    activeFirebaseListeners.push({ ref: currentChatRoomRef, event: 'child_added', handler: activeChatListener });
  }

  function cekBolehKirim() {
    return new Promise(resolve => {
      if (currentTargetMode === 'publik') {
        resolve(true);
      } else {
        const room = [ID, currentTargetID].sort().join('_');
        db.ref('rooms/' + room + '/chats').once('value').then(snap => {
          let boleh = false;
          snap.forEach(c => {
            const val = c.val();
            if (val.ID === currentTargetID) {
              boleh = true;
            }
          });
          resolve(boleh);
        }).catch(() => resolve(false));
      }
    });
  }

  function kirim() {
    if (!input) return;
    const msg = input.value.trim();
    if (!msg) return;
    cekBolehKirim().then(boleh => {
      if (!boleh) {
        alert("Pengguna hanya menerima pesan dari orang yang sudah pernah dia kirimi pesan.");
        return;
      }
      const waktu = Date.now();
      const pesanData = {
        ID,
        Username,
        Nama,
        Pesan: msg,
        Waktu: waktu
      };
      const room = [ID, currentTargetID].sort().join('_');
      const chatRef = db.ref('rooms/' + room + '/chats');
      chatRef.push(pesanData).then(() => {
        const lastChatDataForMe = {
          room: room,
          ID: currentTargetID,
          Username: currentTargetNama,
          Foto: currentTargetFoto,
          Terakhir: msg,
          Waktu: waktu
        };
        const lastChatDataForTarget = {
          room: room,
          ID: ID,
          Username: Nama,
          Foto: '',
          Terakhir: msg,
          Waktu: waktu
        };
        const updates = {};
        updates[`users/${ID}/chats/${currentTargetID}`] = lastChatDataForMe;
        updates[`users/${currentTargetID}/chats/${ID}`] = lastChatDataForTarget;
        updates[`rooms/${room}/lastChat`] = {
          ID: ID,
          Nama: Nama,
          Pesan: msg,
          Waktu: waktu,
          readBy: {
            [ID]: true
          }
        };
        db.ref().update(updates);
        input.value = '';
        input.style.height = 'auto';
      }).catch(err => {
        alert("Gagal mengirim pesan: " + err.message);
      });
    });
  }

  // start module
  await loadTargetInfo(targetID);
  if (targetFotoEl) targetFotoEl.src = currentTargetFoto;
  if (roomTitle) roomTitle.textContent = currentTargetNama;
  currentTargetID = targetID;

  // load chat
  const room = [ID, currentTargetID].sort().join('_');
  loadChat('rooms/' + room + '/chats');

  // wire send
  if (input) {
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = input.scrollHeight + 'px';
    });
  }
  if (btnSend) btnSend.onclick = kirim;
}

// ---------- DISPLAY CONTROL (SPA toggles) ----------
function showIndex() {
  // hide inbox if present
  const indexEl = safeGet('indexPage');
  const inboxEl = safeGet('inboxPage');

  if (inboxEl) inboxEl.style.display = 'none';
  if (indexEl) indexEl.style.display = 'block';

  // remove listeners from inbox modules
  removeAllListeners();

  // initialize index module (re-attach necessary listeners)
  try {
    initIndexModule();
  } catch (e) {
    // ignore
  }
}

function showInbox(targetID) {
  if (!targetID) {
    alert('ID target tidak ditemukan.');
    return;
  }
  const indexEl = safeGet('indexPage');
  const inboxEl = safeGet('inboxPage');

  if (indexEl) indexEl.style.display = 'none';
  if (inboxEl) inboxEl.style.display = 'block';

  // clear any generic listeners (so index listeners won't duplicate)
  removeAllListeners();

  // initialize inbox module
  initInboxModule(targetID).catch(err => {
    console.error('Gagal init inbox:', err);
  });
}

// ---------- INIT APP ----------
function initApp() {
  // ensure a basic structure: prefer elements named indexPage and inboxPage in HTML
  // if not present, still attempt to init modules safely
  // set initial view to index
  showIndex();
}

// auto init on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
