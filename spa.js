const firebaseConfig = {
      apiKey: "AIzaSyDPJfJgUg8a_e1zS3nSbU8RqHj3TOALX2s",
      authDomain: "nasuka-fc780.firebaseapp.com",
      databaseURL: "https://nasuka-fc780-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "nasuka-fc780",
      storageBucket: "nasuka-fc780.firebasestorage.app",
      messagingSenderId: "860641747257",
      appId: "1:860641747257:web:d1dc28bf34cc1f64ad48e8"
    };

    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();
    const userCache = {};
    let isPosting = false;
    let viewedProfileID = null;

    const ID = localStorage.getItem('ID') || 'test-user-id';
    const Username = localStorage.getItem('Username') || 'test-username';
    const Nama = localStorage.getItem('Nama') || 'Test User';
    let currentTargetID = '';
    let currentTargetNama = '';
    let currentTargetFoto = '';
    let activeChatListener = null;
    let selectedFile = null;

    document.addEventListener("DOMContentLoaded", () => {
      showView('main-view');
      initializeUserProfile();
      setupSearchFunctionality();
      setupChatNotifications();
      loadPosts();
      setupEditProfileForm();

      const modalGambar = document.getElementById("modalGambar");
      if (modalGambar) {
        modalGambar.addEventListener("click", () => {
          modalGambar.style.display = "none";
        });
      }

      // Initialize game scripts
      for (let i = 1; i <= 5; i++) createROLL($('#ring' + i));
      $('#rotate').addClass('tilted');
      $('.roll').addClass('backface-on');
      setTimeout(() => {
        $('#loading').fadeOut();
      }, 2000);
      let winAudio = document.getElementById('winAudio');
      let userInteracted = false;
      $('#spinButton').click(function() {
        if (!userInteracted) {
          winAudio.muted = true;
          winAudio.play().then(() => {
            winAudio.pause();
            winAudio.currentTime = 0;
            winAudio.muted = false;
            userInteracted = true;
          }).catch(error => {
            console.error("Audio play blocked:", error);
          });
        }
        if (!$(this).prop('disabled')) {
          spin(true);
        }
      });
      $('#startAutoSpinButton').click(startAutoSpin);
      $('#stopAutoSpinButton').click(stopAutoSpin);
      setupBurungGame();
      setupInvestorForm();
    });

    // --- Main View Management ---
    function showView(viewId) {
      document.getElementById('main-view').style.display = 'none';
      document.getElementById('profile-view').style.display = 'none';
      document.getElementById('chat-view').style.display = 'none';
      document.getElementById('leaderboard-view').style.display = 'none';
      document.getElementById('edit-profile-view').style.display = 'none';
      document.getElementById('game-view').style.display = 'none';
      
      document.getElementById(viewId).style.display = 'block';

      if (viewId === 'leaderboard-view') {
        loadLeaderboard();
      } else if (viewId === 'edit-profile-view') {
        loadProfileDataForEdit();
      }
    }

    // --- Game View Management ---
    function showGame(gameId) {
        document.getElementById('main-view').style.display = 'none';
        document.getElementById('game-view').style.display = 'block';

        document.getElementById('roll-container').style.display = 'none';
        document.getElementById('burung-container').style.display = 'none';
        document.getElementById('rulle-container').style.display = 'none';
        document.getElementById('investor-container').style.display = 'none';
        
        document.getElementById(gameId + '-container').style.display = 'block';
    }

    async function loadAndShowProfile(id) {
      const currentID = localStorage.getItem("ID");
      if (!currentID) {
        alert("Silakan login terlebih dahulu.");
        return;
      }
      viewedProfileID = id;

      const snap = await db.ref("users").orderByChild("ID").equalTo(viewedProfileID).once("value");
      const user = Object.values(snap.val() || {})[0];

      if (user) {
        renderUser(user, currentID);
        muatPostinganProfil(viewedProfileID);
        showView('profile-view');
      } else {
        alert("Pengguna tidak ditemukan.");
        showView('main-view');
      }
    }

    function showMyProfile() {
      const myID = localStorage.getItem("ID");
      if (myID) {
        loadAndShowProfile(myID);
      } else {
        alert("Silakan masuk untuk melihat profil Anda.");
      }
    }

    function showChatView(targetID) {
      loadTargetInfo(targetID).then(() => {
        document.getElementById('targetFotoEl').src = currentTargetFoto;
        document.getElementById('roomTitle').textContent = currentTargetNama;
        loadChat([ID, currentTargetID].sort().join('_'));
        showView('chat-view');
      }).catch(err => {
        console.error("Gagal memuat chat:", err);
        alert("Gagal memuat chat.");
      });
    }

    // --- Social Media App Scripts (as provided) ---
    function initializeUserProfile() {
      const userID = localStorage.getItem("ID") || "";
      const fotoEl = document.getElementById("fotoProfil");
      const namaEl = document.getElementById("namaUser");
      const profilLink = document.getElementById("linkProfil");
      if (!userID) {
        if (namaEl) namaEl.textContent = "Silakan Masuk";
        if (fotoEl) fotoEl.src = "https://nasukafoods.site/gambarkosong.jpg";
        if (profilLink) profilLink.onclick = () => alert("Silakan login terlebih dahulu.");
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
      const namaEl = document.getElementById("namaUser");
      const fotoEl = document.getElementById("fotoProfil");
      const profilLink = document.getElementById("linkProfil");
      if (namaEl) namaEl.textContent = nama;
      if (fotoEl) fotoEl.src = foto;
      if (profilLink) profilLink.onclick = () => loadAndShowProfile(userID);
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

    function setupSearchFunctionality() {
      const hasilUserEl = document.getElementById("hasilUser");
      const cariUserInput = document.getElementById("cariUser");
      if (!cariUserInput || !hasilUserEl) return;
      cariUserInput.addEventListener("input", function() {
        const k = this.value.trim().toLowerCase();
        hasilUserEl.innerHTML = "";
        if (k.length < 2) return;
        db.ref("users").orderByChild("NamaLower").startAt(k).endAt(k + "\uf8ff").limitToFirst(20).once("value").then(snap => {
          snap.forEach(child => {
            const v = child.val();
            const d = document.createElement("div");
            d.innerHTML = `<div style="display:flex; align-items:center; gap:8px; background:#fff; padding:8px; border-radius:6px; box-shadow:0 1px 4px rgba(0,0,0,0.1)"><img src="${v.Foto || "https://nasukafoods.site/gambarkosong.jpg"}" style="width:40px; height:40px; border-radius:50%; object-fit:cover" /><div style="flex:1"><b>${v.Nama || "Tanpa Nama"}</b><br /><a href="#" onclick="loadAndShowProfile('${v.ID}')" style="font-size:12px; color:#2196F3">Lihat Profil</a></div></div>`;
            hasilUserEl.appendChild(d);
          });
        });
      });
    }

    function setupChatNotifications() {
      const userID = localStorage.getItem("ID") || "";
      const notifInbox = document.getElementById("notifInbox");
      if (!userID || !notifInbox) return;
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
      container.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);background:#fff;border:1px solid #ccc;border-radius:8px;padding:12px;z-index:9999;max-height:300px;overflow-y:auto;min-width:200px;box-shadow:0 2px 10px rgba(0,0,0,0.2)';
      const closeBtn = document.createElement('button');
      closeBtn.textContent = 'x';
      closeBtn.style.cssText = 'position:absolute;top:6px;right:6px;background:transparent;border:none;font-size:18px;cursor:pointer;';
      closeBtn.onclick = () => document.body.removeChild(container);
      container.appendChild(closeBtn);
      pengirimData.forEach(({ id, nama }) => {
        const btn = document.createElement('button');
        btn.textContent = nama;
        btn.style.cssText = 'display:block;width:100%;margin:6px 0;padding:8px;border:none;border-radius:4px;background:#2196F3;color:#fff;cursor:pointer;';
        btn.onclick = () => {
          document.body.removeChild(container);
          showChatView(id);
        };
        container.appendChild(btn);
      });
      document.body.appendChild(container);
    }

    function loadPosts() {
      const daftar = document.getElementById("daftarPostingan");
      if (!daftar) return;
      daftar.innerHTML = '';
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
      db.ref("posts/" + postId + "/likes").on("value", snap => {
        const likeCountEl = document.getElementById("likeCount-" + postId);
        if(likeCountEl) likeCountEl.textContent = `${snap.numChildren()} suka`;
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

      let komentarLoaded = false;
      const btnLihat = document.getElementById(`lihatKomentarBtn-${postId}`);
      const wadahKomentar = document.getElementById(`komentar-${postId}`);
      if (btnLihat && wadahKomentar) {
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
                  d.innerHTML = `<b>${v.Nama || "Anonim"}</b>: ${(v.Teks || "").replace(/\n/g, '<br>')}`;
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
    }

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
      if (input) input.value = "";
    };

    window.toggleLike = function(postId) {
      const userID = localStorage.getItem("ID") || "";
      if (!userID) return alert("Silakan login dulu untuk like");
      const refLike = db.ref("posts/" + postId + "/likes/" + userID);
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
      if (modal && gambar) {
        gambar.src = src;
        modal.style.display = "flex";
      }
    };

    function renderUser(user, currentID) {
      const isOwner = user.ID === currentID;
      document.getElementById("foto-profil").src = user.Foto || "https://nasukafoods.site/gambarkosong.jpg";
      document.getElementById('post-form-section').style.display = isOwner ? 'block' : 'none';
      const dataUserDiv = document.getElementById("dataUser");
      dataUserDiv.innerHTML = `
        <p>🎇 Nama: ${user.Nama || '-'}</p>
        <p>🎇 Perak: ${user.Perak || 0}</p>
        <p>🎇 Jenis: ${user.Jenis || '-'}</p>
      `;
      const tombolAksiDiv = document.getElementById("tombolAksi");
      tombolAksiDiv.innerHTML = '';
      if (!isOwner) {
        const btnPesan = document.createElement("button");
        btnPesan.innerHTML = '🎇 Kirim Pesan';
        btnPesan.style.cssText = 'padding: 8px 16px; margin-top: 10px; cursor: pointer;';
        btnPesan.onclick = () => {
          showChatView(viewedProfileID);
        };
        tombolAksiDiv.appendChild(btnPesan);
      }
    }

    function muatPostinganProfil(id) {
      const daftar = document.getElementById("daftarPostinganProfil");
      if (!daftar) return;
      daftar.innerHTML = '';
      db.ref("posts").orderByChild("ID").equalTo(id).on("child_added", function(snapshot) {
        const data = snapshot.val();
        const key = snapshot.key;
        const isOwner = data.ID === localStorage.getItem("ID");
        const formattedDate = new Date(data.Waktu).toLocaleString('id-ID', {
          year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        const imageHtml = data.Foto ? `<img src="${data.Foto}" alt="Postingan Foto">` : '';
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          ${isOwner ? `<button class="hapus-btn" onclick="hapusPostingan('${key}', this.parentElement)">Hapus</button>` : ""}
          ${imageHtml}
          <div class="card-content">
            <h3>${(data.Judul || "").replace(/\n/g, '<br>')}</h3>
            <p style="margin: 5px 0;"><b>Oleh:</b> ${data.Nama}</p>
            <p style="margin: 5px 0;"><small>${formattedDate}</small></p>
            <small>${data.Status}</small><br/>
          </div>
          <textarea id="input-${key}" placeholder="Tulis komentar" style="width:100%; padding:10px;"></textarea><button class="btnKirim" onclick="submitKomentarManual('${key}')">Kirim</button>
          <div class="komentar-list" id="list-${key}"></div>
        `;
        const likeSpan = document.createElement("span");
        likeSpan.style.cssText = "cursor:pointer; display:inline-block; margin-top:10px; font-weight:bold;";
        likeSpan.onclick = () => toggleLike(key);
        card.querySelector(".card-content").appendChild(likeSpan);
        daftar.prepend(card);
        updateLikeDisplay(key, likeSpan);
        muatKomentar(key);
      });
    }

    window.kirimPostingan = function() {
      if (isPosting) return;
      isPosting = true;
      const judul = document.getElementById("judul").value.trim();
      const status = document.getElementById("status").value;
      const file = document.getElementById("fotoInput").files[0];
      if (!judul && !file) {
        isPosting = false;
        return;
      }
      const ID = localStorage.getItem("ID");
      const Nama = localStorage.getItem("Nama");
      if (!ID || !Nama) {
        isPosting = false;
        return;
      }
      const postData = { ID, Nama, Judul: judul, Status: status, Waktu: Date.now() };
      function resetForm() {
        document.getElementById("judul").value = "";
        document.getElementById("status").value = "publik";
        document.getElementById("fotoInput").value = "";
        isPosting = false;
      }
      if (file) {
        const reader = new FileReader();
        reader.onload = e => {
          postData.Foto = e.target.result;
          db.ref("posts").push(postData).then(resetForm).catch(() => {
            isPosting = false;
          });
        };
        reader.readAsDataURL(file);
      } else {
        db.ref("posts").push(postData).then(resetForm).catch(() => {
          isPosting = false;
        });
      }
    }

    window.hapusPostingan = function(key, cardElement) {
      const updates = {};
      updates["/posts/" + key] = null;
      updates["/komentar/" + key] = null;
      db.ref().update(updates);
      cardElement.remove();
    }

    window.submitKomentarManual = function(key) {
      const input = document.getElementById("input-" + key);
      const teks = input.value.trim();
      if (teks) {
        const id = localStorage.getItem("ID") || "";
        const nama = localStorage.getItem("Nama") || "Anonim";
        db.ref("komentar/" + key).push({
          ID: id,
          Nama: nama,
          Teks: teks,
          Waktu: new Date().toLocaleString("id-ID")
        });
        input.value = "";
      }
    }

    function muatKomentar(key) {
      db.ref("komentar/" + key).on("child_added", snap => {
        const data = snap.val();
        const list = document.getElementById("list-" + key);
        if (list) {
          const div = document.createElement("div");
          div.innerHTML = `<b>${data.Nama || "?"}:</b> ${(data.Teks || "").replace(/\n/g, '<br>')}`;
          list.appendChild(div);
        }
      });
    }

    function updateLikeDisplay(postId, elemen) {
      db.ref("posts/" + postId + "/likes").on("value", snap => {
        const likeCount = snap.numChildren();
        elemen.innerText = `👍 ${likeCount}`;
      });
    }

    function loadTargetInfo(targetID) {
      return db.ref('users').orderByChild('ID').equalTo(targetID).once('value').then(snap => {
        let found = false;
        snap.forEach(userSnap => {
          const val = userSnap.val();
          currentTargetID = val.ID;
          currentTargetNama = val.Nama || 'Pengguna';
          currentTargetFoto = val.Foto || 'default.jpg';
          found = true;
        });
        if (!found) {
          currentTargetID = targetID;
          currentTargetNama = 'Pengguna';
          currentTargetFoto = 'default.jpg';
        }
      });
    }

    function formatWaktu(ms) {
      const d = new Date(ms);
      const jam = d.getHours().toString().padStart(2, '0');
      const mnt = d.getMinutes().toString().padStart(2, '0');
      return jam + ':' + mnt;
    }

    function tambahPesan(data) {
      const msgEl = document.createElement('div');
      msgEl.className = data.ID === ID ? 'msg me' : 'msg';

      const text = document.createElement('div');
      text.textContent = data.Pesan;

      const time = document.createElement('span');
      time.className = 'time';
      time.textContent = formatWaktu(data.Waktu || 0);

      msgEl.appendChild(text);
      msgEl.appendChild(time);
      document.getElementById('chatBox').appendChild(msgEl);

      document.getElementById('chatBox').scrollTop = document.getElementById('chatBox').scrollHeight;
    }

    function loadChat(room) {
      document.getElementById('chatBox').innerHTML = '';

      if (activeChatListener) {
        db.ref('rooms/' + room + '/chats').off('child_added', activeChatListener);
      }

      activeChatListener = snap => {
        const data = snap.val();
        tambahPesan(data);
      };

      db.ref('rooms/' + room + '/chats').on('child_added', activeChatListener);
    }

    function kirim() {
      const msg = document.getElementById('inputMessage').value.trim();
      if (!msg) return;

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

        document.getElementById('inputMessage').value = '';
        document.getElementById('inputMessage').style.height = 'auto';
      }).catch(err => {
        alert("Gagal mengirim pesan: " + err.message);
      });
    }

    document.getElementById('inputMessage').addEventListener('input', () => {
      document.getElementById('inputMessage').style.height = 'auto';
      document.getElementById('inputMessage').style.height = document.getElementById('inputMessage').scrollHeight + 'px';
    });

    function loadLeaderboard() {
      getLeaderboard("Perak");
    }

    function updateChampionBox(rank, user, type) {
      const nameEl = document.getElementById(`juara${rank}-nama`);
      const valueEl = document.getElementById(`juara${rank}-nilai`);
      const fotoEl = document.getElementById(`juara${rank}-foto`);

      if (nameEl) nameEl.textContent = user.Nama || "Anonymous";
      if (nameEl) nameEl.href = `javascript:void(0);`;
      if (valueEl) valueEl.textContent = `${user[type] || 0} ${type}`;
      if (fotoEl) {
        if (user.Foto) {
          fotoEl.src = user.Foto;
          fotoEl.style.display = "block";
        } else {
          fotoEl.style.display = "none";
        }
      }
    }

    function updateChampionList(users, type) {
      const list = document.getElementById("juara4-list");
      list.innerHTML = "";

      users.forEach((user, index) => {
        const rank = index + 4;

        const li = document.createElement("li");
        li.style.display = "flex";
        li.style.alignItems = "center";
        li.style.margin = "10px 0";

        const foto = document.createElement("img");
        foto.src = user.Foto || "https://nasukafoods.site/gambarkosong.jpg";
        foto.alt = `Foto Juara ${rank}`;
        foto.style.width = "160px";
        foto.style.height = "160px";
        foto.style.objectFit = "cover";
        foto.style.borderRadius = "8px";
        foto.style.border = "2px solid #ccc";
        foto.style.marginRight = "10px";

        const info = document.createElement("div");
        info.innerHTML = `
          <a href="#" onclick="loadAndShowProfile('${user.ID}')" class="namajuara" style="padding:4px 8px;font-size:24px;margin:0 6px;">
            ${rank}. ${user.Nama || "Anonymous"}
          </a><br>
          <span style="font-size:22px;color:green;">${user[type] || 0} ${type}</span>
        `;

        li.appendChild(foto);
        li.appendChild(info);
        list.appendChild(li);
      });
    }

    function getLeaderboard(type) {
      const leaderboardRef = db.ref('users').orderByChild(type).limitToLast(10);

      leaderboardRef.on('value', (snapshot) => {
        const users = [];
        snapshot.forEach((childSnapshot) => {
          const user = childSnapshot.val();
          user.ID = childSnapshot.key;
          users.push(user);
        });

        users.sort((a, b) => (parseFloat(b[type]) || 0) - (parseFloat(a[type]) || 0));

        for (let i = 0; i < 3; i++) {
          if (users[i]) updateChampionBox(i + 1, users[i], type);
        }

        if (users.length > 3) {
          updateChampionList(users.slice(3), type);
        }
      });
    }
    
    function setupEditProfileForm() {
        const fotoProfilInput = document.getElementById("fotoProfilInput");
        const editForm = document.getElementById("editForm");
        
        if (fotoProfilInput) {
            fotoProfilInput.addEventListener("change", function(e) {
                const file = e.target.files[0];
                if (file && file.type.startsWith("image/")) {
                    selectedFile = file;
                    const reader = new FileReader();
                    reader.onload = function(evt) {
                        document.getElementById("fotoPreview").src = evt.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        if (editForm) {
            editForm.addEventListener("submit", function(e) {
                e.preventDefault();
                saveProfile();
            });
        }
    }
    
    function loadProfileDataForEdit() {
        const userID = localStorage.getItem("ID");
        const username = localStorage.getItem("Username");
        const statusEl = document.getElementById("status");

        if (!username) {
            if(statusEl) statusEl.innerText = "Username tidak ditemukan. Silakan login ulang.";
            return;
        }

        document.getElementById("ID").value = userID;
        
        db.ref("users/" + username).once("value").then(snapshot => {
            const data = snapshot.val();
            if (data) {
                document.getElementById("Username").value = data.Username || "";
                document.getElementById("Password").value = data.Password || "";
                document.getElementById("Nama").value = data.Nama || "";
                document.getElementById("Telepon").value = data.Telepon || "";
                document.getElementById("Alamat").value = data.Alamat || "";
                document.getElementById("Foto").value = data.Foto || "";
                document.getElementById("fotoPreview").src = data.Foto || "";
            } else {
                if(statusEl) statusEl.innerText = "Data pengguna tidak ditemukan di database.";
            }
        }).catch(err => {
            if(statusEl) statusEl.innerText = "Gagal mengambil data: " + err.message;
        });
    }

    function saveProfile() {
      const username = localStorage.getItem("Username");
      const statusEl = document.getElementById("status");
      const namaBaru = document.getElementById("Nama").value.trim();

      function saveData(fotoData) {
          const data = {
              Username: document.getElementById("Username").value,
              Password: document.getElementById("Password").value,
              Nama: namaBaru,
              NamaLower: namaBaru.toLowerCase(),
              Telepon: document.getElementById("Telepon").value,
              Alamat: document.getElementById("Alamat").value,
              Foto: fotoData
          };

          db.ref("users/" + username).update(data).then(() => {
              localStorage.setItem("Username", data.Username);
              localStorage.setItem("Password", data.Password);
              localStorage.setItem("Nama", data.Nama);
              localStorage.setItem("Telepon", data.Telepon);
              localStorage.setItem("Alamat", data.Alamat);
              localStorage.setItem("Foto", data.Foto);
              if(statusEl) statusEl.innerText = "Profil berhasil diperbarui.";
              setTimeout(() => {
                  showView("main-view");
              }, 1000);
          }).catch(() => {
              if(statusEl) statusEl.innerText = "Gagal memperbarui profil.";
          });
      }

      if (selectedFile) {
          const reader = new FileReader();
          reader.onload = function(evt) {
              saveData(evt.target.result);
          };
          reader.readAsDataURL(selectedFile);
      } else {
          saveData(document.getElementById("Foto").value);
      }
    }

    // --- Game App Scripts (as provided) ---
    const localUser = {
      Username: localStorage.getItem("Username"),
      Perak: parseInt(localStorage.getItem("Perak")) || 0,
    };

    if (localUser.Username) {
        const userRef = db.ref(`users/${localUser.Username}`);
        userRef.on('value', (snapshot) => {
            const userData = snapshot.val();
            if (userData !== null) {
                localUser.Perak = userData.Perak || 0;
                localStorage.setItem("Perak", localUser.Perak);
                updatePerakDisplay();
            }
        });
    }

    const ROLL_PER_REEL = 10;
    const REEL_RADIUS = 400;
    const SPIN_DURATION = 5;
    const MANUAL_SPIN_COOLDOWN = 4 * 400;

    const WIN_MULTIPLIERS = {
      'dua': 2,
      'tiga': 3,
      'empat': 4,
      'lima': 5,
      'jackpot': 10
    };

    const WIN_PROBABILITIES = {
      'dua': 0.1,
      'tiga': 0.03,
      'empat': 0.02,
      'lima': 0.0000000000000000000000000000000000000001,
      'jackpot': 0.00000000000000000000000000000000000000000000000000001
    };

    let isSpinning = false;
    let lastManualSpinTime = 0;
    let currentmain = 0;
    let isAutomainEnabled = false;
    let playerWinStreak = 0;
    let playerLoseStreak = 0;
    const HOUSE_EDGE = 0;

    function updatePerakDisplay() {
      $('#perakBalance').text(localUser.Perak.toLocaleString('id-ID'));
    }

    function showErrorMessage(message) {
      $('#errorMessage').text(message).fadeIn().delay(3000).fadeOut();
    }

    function createROLL(ring) {
      const rollAngle = 360 / ROLL_PER_REEL;
      for (let i = 0; i < ROLL_PER_REEL; i++) {
        const roll = document.createElement('div');
        roll.className = 'roll backface-on';
        roll.style.transform = `rotateX(${rollAngle * i}deg) translateZ(${REEL_RADIUS}px)`;
        const p = document.createElement('p');
        p.textContent = i;
        roll.appendChild(p);
        ring.append(roll);
      }
    }

    function generateDua() {
      const num = Math.floor(Math.random() * 10);
      const result = [num, num];
      while (result.length < 5) {
        const uniqueNum = Math.floor(Math.random() * 10);
        if (!result.includes(uniqueNum)) {
          result.push(uniqueNum);
        }
      }
      return shuffleArray(result);
    }
    
    function generateTiga() {
      const num = Math.floor(Math.random() * 10);
      const result = [num, num, num];
      while (result.length < 5) {
        const uniqueNum = Math.floor(Math.random() * 10);
        if (!result.includes(uniqueNum)) {
          result.push(uniqueNum);
        }
      }
      return shuffleArray(result);
    }
    
    function generateEmpat() {
      const num = Math.floor(Math.random() * 10);
      const result = [num, num, num, num];
      while (result.length < 5) {
        const uniqueNum = Math.floor(Math.random() * 10);
        if (!result.includes(uniqueNum)) {
          result.push(uniqueNum);
        }
      }
      return shuffleArray(result);
    }
    
    function generateLima() {
      const num = Math.floor(Math.random() * 10);
      return [num, num, num, num, num];
    }
    
    function generateJackpot() {
      const result = [1, 2, 3, 4, 5];
      return shuffleArray(result);
    }

    function generateRandomResult() {
      const result = [];
      while (result.length < 5) {
        const num = Math.floor(Math.random() * 10);
        if (!result.includes(num)) {
          result.push(num);
        }
      }
      return result;
    }

    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }
    
    function generateControlledResult() {
      let currentProbabilities = WIN_PROBABILITIES;
      const rand = Math.random();
      let cumulativeProb = 0;

      for (const type in currentProbabilities) {
          cumulativeProb += currentProbabilities[type];
          if (rand < cumulativeProb) {
              switch(type) {
                  case 'dua': return generateDua();
                  case 'tiga': return generateTiga();
                  case 'empat': return generateEmpat();
                  case 'lima': return generateLima();
                  case 'jackpot': return generateJackpot();
              }
          }
      }
      return generateRandomResult();
    }

    function checkWin(result) {
      const sortedResult = [...result].sort((a, b) => a - b).join('');
      if (sortedResult === '12345') {
        return 'jackpot';
      }
      
      const frequency = {};
      result.forEach(num => {
        frequency[num] = (frequency[num] || 0) + 1;
      });
      
      const counts = Object.values(frequency);
      const hasLima = counts.some(count => count >= 5);
      const hasEmpat = counts.some(count => count >= 4);
      const hasTiga = counts.some(count => count >= 3);
      const hasDua = counts.some(count => count >= 2);
      
      if (hasLima) {
        return 'lima';
      } else if (hasEmpat) {
        return 'empat';
      } else if (hasTiga) {
        return 'tiga';
      } else if (hasDua) {
        return 'dua';
      }
      return null;
    }

    function selectmain(amount) {
      if (amount > 0 && amount <= localUser.Perak) {
        currentmain = amount;
        $('#mainAmount').val(amount);
        $('#automainButtons button').removeClass('active');
        $(`#main${amount}`).addClass('active');
      } else if (amount === 0) {
        currentmain = 0;
        $('#mainAmount').val('');
        $('#automainButtons button').removeClass('active');
      } else {
        showErrorMessage('Saldo tidak cukup.');
      }
    }

    function startAutoSpin() {
      if (currentmain <= 0) {
        showErrorMessage('Pilih jumlah taruhan.');
        return;
      }
      isAutomainEnabled = true;
      $('#startAutoSpinButton').hide();
      $('#stopAutoSpinButton').show();
      $('#spinButton').prop('disabled', true);
      spin(false);
    }

    function stopAutoSpin() {
      isAutomainEnabled = false;
      $('#stopAutoSpinButton').hide();
      $('#startAutoSpinButton').show();
      $('#spinButton').prop('disabled', false);
    }

    function spin(isManual) {
      if (isSpinning) return;
      
      const slotAudio = document.getElementById('slotAudio');
      slotAudio.currentTime = 0;
      slotAudio.play().catch(err => console.log("Autoplay blocked:", err));
      
      if (currentmain <= 0) {
        showErrorMessage('Pilih jumlah taruhan.');
        return;
      }
      if (currentmain > localUser.Perak) {
        showErrorMessage('Saldo tidak cukup.');
        return;
      }
      
      localUser.Perak -= currentmain;
      updatePerakDisplay(); 
      db.ref(`users/${localUser.Username}/Perak`).set(localUser.Perak); 
      const winAudio = document.getElementById('winAudio');
      if (!winAudio.paused) {
        winAudio.pause();
        winAudio.currentTime = 0; 
      }
      
      isSpinning = true;
      
      $('#mainResult').addClass('result-hidden');
      
      if (isManual) {
        lastManualSpinTime = Date.now();
        $('#spinButton').prop('disabled', true);
        updateManualSpinButton();
      }
      
      $('#stage .roll p').removeClass('bling-bling');
      
      for (let i = 1; i <= 5; i++) {
        $(`#ring${i}`).css('animation', `back-spin 1s`);
      }
      
      setTimeout(() => {
        const result = generateControlledResult();
        
        for (let i = 1; i <= 5; i++) {
          const seed = result[i-1];
          $(`#ring${i}`)
            .css('animation', `spin-${seed} ${SPIN_DURATION}s cubic-bezier(0.1, 0.7, 0.1, 1)`)
            .attr('class', `ring spin-${seed}`);
        }
        
        setTimeout(() => {
          for (let i = 0; i < result.length; i++) {
            const numberElement = $(`#ring${i+1} .roll`).eq(result[i]).find('p');
            numberElement.addClass('bling-bling');
          }
          
          processmainResult(result, isManual);
          
          isSpinning = false;
          
          if (isAutomainEnabled) {
            setTimeout(() => {
              if (isAutomainEnabled) {
                spin(false);
              }
            }, 3000);
          }
        }, SPIN_DURATION * 1000);
      }, 1000);
    }

    function processmainResult(result) {
      const winType = checkWin(result);
      let message = "coba lagi";
      let messageClass = "lose";
      let winAmount = 0;

      if (winType) {
        playerWinStreak++;
        playerLoseStreak = 0;
        
        const baseMultiplier = WIN_MULTIPLIERS[winType];
        const totalMultiplier = baseMultiplier * (1 - HOUSE_EDGE);
        winAmount = Math.round(currentmain * totalMultiplier);

        message = `Selamat Anda MENDAPATKAN +${winAmount.toLocaleString('id-ID')} `;
        messageClass = "win";           
        triggerConfetti(); 
        document.getElementById('winAudio').play();
      } else {
        playerWinStreak = 0;
        playerLoseStreak++;
      }

      localUser.Perak += winAmount;
      
      db.ref(`users/${localUser.Username}`).transaction((currentData) => {
        if (currentData) {
          let finalPerak = (currentData.Perak || 0) + winAmount;
          return {
            ...currentData,
            Perak: finalPerak,
          };
        } else {
          return;
        }
      }).then(() => {
        updatePerakDisplay();
        
        $('#mainResult')
          .text(message)
          .removeClass('result-hidden')
          .addClass(messageClass);
      }).catch(error => {
        console.error("Transaksi gagal:", error);
      });
    }

    function updateManualSpinButton() {
      const now = Date.now();
      const timeSinceLastSpin = now - lastManualSpinTime;
      const remainingCooldown = Math.max(0, MANUAL_SPIN_COOLDOWN - timeSinceLastSpin);
      
      if (remainingCooldown <= 0) {
        $('#spinButton').prop('disabled', false).text('Putar');
      } else {
        setTimeout(updateManualSpinButton, 1000);
      }
    }

    function triggerConfetti() {
      const defaults = {
          spread: 360,
          ticks: 200,
          gravity: 0.4,
          decay: 0.94,
          startVelocity: 90,
          colors: ['#FFC107', '#E91E63', '#4CAF50', '#2196F3']
      };
      function shoot() {
          confetti({
              ...defaults,
              particleCount: 2000,
              scalar: 1.2,
              shapes: ['star']
          });
          confetti({
              ...defaults,
              particleCount: 300,
              scalar: 0.8,
              shapes: ['circle']
          });
      }
      setTimeout(shoot, 0);
      setTimeout(shoot, 150);
      setTimeout(shoot, 300);
    }
    
    function showCustomAlert(message, type = 'info') {
      const alertDiv = document.getElementById('customAlert');
      const alertMessage = document.getElementById('alertMessage');
      const alertIcon = document.getElementById('alertIcon');
        
      alertMessage.textContent = message;
      switch(type) {
          case 'success':
              alertIcon.textContent = '';
              alertDiv.style.border = '2px solid #4CAF50';
              break;
          case 'error':
              alertIcon.textContent = '❌';
              alertDiv.style.border = '2px solid #f44336';
              break;
          case 'warning':
              alertIcon.textContent = '⚠️';
              alertDiv.style.border = '2px solid #FFC107';
              break;
          default:
              alertIcon.textContent = 'ℹ️';
              alertDiv.style.border = '2px solid #2196F3';
      }
         
      alertDiv.style.display = 'block';  
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.background = 'rgba(0,0,0,0.5)';
      overlay.style.zIndex = '1000';
      overlay.id = 'alertOverlay';
      document.body.appendChild(overlay);
      document.getElementById('alertOkBtn').onclick = function() {
          alertDiv.style.display = 'none';
          document.getElementById('alertOverlay').remove();
      };
    }

    function setupBurungGame() {
      const selesai = document.getElementById("selesai");
      const totalPerakSpan = document.getElementById("total-perak");
      let totalPerak = 0;
      
      const inputs = document.querySelectorAll('.input-circle');
      inputs.forEach(input => {
          input.addEventListener('change', () => {
              if (input.checked) {
                  totalPerak++;
                  totalPerakSpan.textContent = totalPerak;
              }
          });
      });

      selesai.addEventListener("click", () => {
          if (localUser.Username && totalPerak > 0) {
              const usersRef = db.ref('users');
              usersRef.orderByChild('Username').equalTo(localUser.Username).once('value')
              .then(snapshot => {
                  if (snapshot.exists()) {
                      snapshot.forEach(childSnapshot => {
                          const userId = childSnapshot.key;                      
                          
                          let currentPerak = childSnapshot.val().Perak ? parseInt(childSnapshot.val().Perak) : 0;
                          let newPerak = currentPerak + totalPerak;
                          
                          return db.ref('users/' + userId).update({ Perak: newPerak })
                          .then(() => {
                              showCustomAlert(` ${totalPerak} Perak berhasil diklaim!`, "success");
                              totalPerak = 0;
                              totalPerakSpan.textContent = totalPerak;
                              inputs.forEach(input => input.checked = false);
                          });
                      });
                  } else {
                      showCustomAlert("Pengguna tidak ditemukan.", "error");
                  }
              })
              .catch(error => {
                  console.error("Gagal mengirim perak:", error);
                  showCustomAlert("Gagal mengirim perak. Silakan coba lagi.", "error");
              });
          } else {
              showCustomAlert("Tidak ada perak yang di klaim", "info");
          }
      });
    }

    function setupInvestorForm() {
      const form = document.getElementById('topupForm');
      const statusMessage = document.getElementById('statusMessage');
      const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxpOktAYKx2f4hOLaTcwynZO8EghJYKpwGgMO39dr10tYZzgoUsdaLsWbjyi6AvOYiR_A/exec';
      const fileInput = document.getElementById('bukti');
      const fileNameSpan = document.getElementById('file-name');
      const transactionReceipt = document.getElementById('transactionReceipt');
      const receiptDetails = document.getElementById('receiptDetails');

      fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
          fileNameSpan.textContent = fileInput.files[0].name;
          fileNameSpan.style.display = 'inline';
        } else {
          fileNameSpan.textContent = '';
          fileNameSpan.style.display = 'none';
        }
      });

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        statusMessage.textContent = 'Loading...';
        statusMessage.className = '';

        const formData = new FormData(form);
        const buktiFile = formData.get('bukti');

        if (!buktiFile || buktiFile.size === 0) {
          statusMessage.textContent = 'Harap lampirkan bukti foto.';
          statusMessage.className = 'error';
          return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(buktiFile);
        
        reader.onload = async () => {
          const base64Image = reader.result.split(',')[1];
          
          const payload = {
            action: 'handleTopup',
            id: formData.get('id'),
            nama: formData.get('nama'),
            username: formData.get('username'),
            deposit: formData.get('deposit'),
            bukti: base64Image
          };

          try {
            const response = await fetch(SCRIPT_URL, {
              method: 'POST',
              body: JSON.stringify(payload) 
            });

            const result = await response.json();
            statusMessage.textContent = result.message;
            statusMessage.className = result.status === 'success' ? 'success' : 'error';
            
            if (result.status === 'success') {
              const id = formData.get('id');
              const nama = formData.get('nama');
              const username = formData.get('username');
              const deposit = formData.get('deposit');
              const now = new Date();
              const formattedDate = now.toLocaleDateString('id-ID', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
              });

              receiptDetails.innerHTML = `
                <p><strong>ID:</strong> ${id}</p>
                <p><strong>Nama:</strong> ${nama}</p>
                <p><strong>Username:</strong> ${username}</p>
                <p><strong>Jumlah:</strong> Rp. ${Number(deposit).toLocaleString('id-ID')}</p>
                <p><strong>Tanggal:</strong> ${formattedDate}</p>
              `;
              
              form.style.display = 'none';
              transactionReceipt.style.display = 'block';
            }
          } catch (error) {
            statusMessage.textContent = 'Terjadi kesalahan saat mengirim permintaan.';
            statusMessage.className = 'error';
            console.error('Error:', error);
          }
        };
        reader.onerror = () => {
          statusMessage.textContent = 'Gagal membaca file bukti transfer.';
          statusMessage.className = 'error';
        };
      });

      document.addEventListener('DOMContentLoaded', () => {
        const userId = localStorage.getItem('ID');
        const userName = localStorage.getItem('Nama');
        const userUsername = localStorage.getItem('Username');
        
        if (userId) {
          document.getElementById('id').value = userId;
        }
        if (userName) {
          document.getElementById('nama').value = userName;
        }
        if (userUsername) {
          document.getElementById('username').value = userUsername;
        }
      });
    }
