

    const firebaseConfig = {
    apiKey: "AIzaSyDE17I5nEIdrfQhfRP5ewloydX18Sw47ws",
    authDomain: "nasukachat.firebaseapp.com",
    databaseURL: "https://nasukachat-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "nasukachat",
    storageBucket: "nasukachat.firebasestorage.app",
    messagingSenderId: "759589458121",
    appId: "1:759589458121:web:d5670da0d080017e2ffd18"
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();


const urlParams = new URLSearchParams(location.search);
const viewedID = urlParams.get("id") || localStorage.getItem("ID");
const currentID = localStorage.getItem("ID");
if (!currentID) location.href = "login.html";

const usersCache = {};

db.ref("users").once("value").then(snap => {
  const users = snap.val();
  let ditemukan = false;
  for (let key in users) {
    const user = users[key];
    if (user.ID === viewedID) {
      ditemukan = true;
      document.getElementById("foto-profil").src = user.Foto || "https://nasukafoods.site/gambarkosong.jpg";
      const isOwner = user.ID === currentID;
      const buttonLabel = isOwner ? "🎇 Interaksi Teranyar" : "🎇 Kirim Pesan";
      document.getElementById("dataUser").innerHTML = `
        <p>🎇 ${user.Nama || '-'}</p>
        <p>🎇 ${user.Perak || 0}</p>
        <p>🎇 ${user.Jenis || '-'}</p>
        <button id="btnKirimPesan" style="padding: 8px 16px; margin-top: 10px; cursor: pointer;">${buttonLabel}</button>
      `;
      setTimeout(() => {
        const tombol = document.getElementById("btnKirimPesan");
        tombol?.addEventListener("click", () => {
          if (isOwner) {
            window.location.href = "inbox.html";
          } else {
            localStorage.setItem("targetID", user.ID);
            localStorage.setItem("targetNama", user.Nama);
            localStorage.setItem("targetFoto", user.Foto || "");
            window.location.href = "inbox.html";
          }
        });
      }, 50);
    }
  }
  if (!ditemukan) {
    alert("Pengguna tidak ditemukan");
  }
});

let isPosting = false;
function kirimPostingan() {
  if (isPosting) return;
  isPosting = true;
  const judul = document.getElementById("judul").value.trim();
  const status = document.getElementById("status").value;
  const file = document.getElementById("fotoInput").files[0];
  if (!judul) {isPosting = false;return;}
  const ID = localStorage.getItem("ID");
  const Username = localStorage.getItem("Username");
  if (!ID || !Username) {isPosting = false;return;}
  const postData = {ID, Username, Judul: judul, Status: status, Waktu: Date.now()};
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
      db.ref("posts").push(postData).then(resetForm).catch(()=>{isPosting=false;});
    };
    reader.readAsDataURL(file);
  } else {
    db.ref("posts").push(postData).then(resetForm).catch(()=>{isPosting=false;});
  }
}

function hapusPostingan(key, cardElement) {
  const updates = {};
  updates["/posts/" + key] = null;
  updates["/komentar/" + key] = null;
  updates["/likes/" + key] = null;
  db.ref().update(updates);
  cardElement.remove();
}

function submitKomentarManual(key) {
  const input = document.getElementById("input-" + key);
  const teks = input.value.trim();
  if (teks) {
    const id = localStorage.getItem("ID") || "";
    const nama = localStorage.getItem("Nama") || "Anonim";
    db.ref("komentar/" + key).push({ID:id,Nama:nama,Teks:teks,Waktu:new Date().toLocaleString("id-ID")});
    input.value = "";
  }
}

function muatKomentar(key) {
  db.ref("komentar/" + key).on("child_added", snap => {
    const data = snap.val();
    const list = document.getElementById("list-" + key);
    if (list) {
      const userID = data.ID || "";
      if (usersCache[userID]) {
        tambahKomentar(list, usersCache[userID], data);
      } else {
        db.ref("users").orderByChild("ID").equalTo(userID).once("value", snapUser => {
          const val = snapUser.val();
          const user = val ? Object.values(val)[0] : {};
          usersCache[userID] = user;
          tambahKomentar(list, user, data);
        });
      }
    }
  });
}

function tambahKomentar(list, users, data) {
  const div = document.createElement("div");
  div.innerHTML = `<b>${users.Nama || "?"}:</b> ${data.Teks}`;
  list.appendChild(div);
}

function toggleLike(postId) {
  const userID = localStorage.getItem("ID") || "";
  if (!userID) return;
  const ref = db.ref("likes/" + postId + "/" + userID);
  ref.once("value").then(snap => {
    if (snap.exists()) {
      ref.remove();
    } else {
      ref.set(true);
    }
  });
}

function updateLikeDisplay(postId, elemen) {
  db.ref("likes/" + postId).on("value", snap => {
    const likeCount = snap.numChildren();
    elemen.innerText = "👍 " + likeCount;
  });
}

db.ref("posts").on("child_added", function(snapshot) {
  const data = snapshot.val();
  const key = snapshot.key;
  if (data.ID === viewedID) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      ${data.ID === currentID ? `<button class="hapus-btn" onclick="hapusPostingan('${key}', this.parentElement)">Hapus</button>` : ""}
      ${data.Foto ? `<img src="${data.Foto}">` : ""}
      <div class="card-content">
        <h3>${(data.Judul || "").replace(/\n/g, '<br>')}</h3>
        <small>${data.Status}</small><br/>
      </div>
      <textarea id="input-${key}" placeholder="Tulis komentar" style="width:100%; padding:10px;"></textarea>
      <button class="btnKirim" onclick="submitKomentarManual('${key}')">Kirim</button>
      <div class="komentar-list" id="list-${key}"></div>
    `;
    const likeSpan = document.createElement("span");
    likeSpan.style.cursor = "pointer";
    likeSpan.style.display = "inline-block";
    likeSpan.style.marginTop = "10px";
    likeSpan.style.fontWeight = "bold";
    likeSpan.onclick = () => toggleLike(key);
    card.querySelector(".card-content").appendChild(likeSpan);
    document.getElementById("daftarPostingan").prepend(card);
    updateLikeDisplay(key, likeSpan);
    muatKomentar(key);
  }
});

function tambahKomentar(list, users, data) {
  const div = document.createElement("div");
  div.innerHTML = `<b>${users.Nama || "?"}:</b> ${(data.Teks || "").replace(/\n/g, '<br>')}`;
  list.appendChild(div);
}
