// Global state variables
const urlParams = new URLSearchParams(location.search);
const viewedID = urlParams.get("id") || localStorage.getItem("ID");
const currentID = localStorage.getItem("ID");
const usersCache = {};
let isPosting = false;

// Redirect to login if not authenticated
if (!currentID) {
  // Instead of a hard redirect, call the showLogin function
  showLogin();
}

// Load user profile and their posts
db.ref("users").orderByChild("ID").equalTo(viewedID).once("value").then(snap => {
  const user = Object.values(snap.val() || {})[0];
  if (user) {
    renderUser(user);
    mopost();
  } else {
    alert("Pengguna tidak ditemukan");
  }
}).catch(error => {
  console.error("Gagal memuat Profile:", error);
  alert("Terjadi kesalahan saat memuat Profile.");
});

// Render user data on the profile page
function renderUser(user) {
  const isOwner = user.ID === currentID;
  document.getElementById("foto-profil").src = user.Foto || "https://nasukafoods.site/gambarkosong.jpg";
  document.querySelector('.form-post').style.display = isOwner ? 'block' : 'none';
  const dataUserDiv = document.getElementById("dataUser");
  dataUserDiv.innerHTML = `
    <p>🎇 Nama: ${user.Nama || '-'}</p>
    <p>🎇 Perak: ${user.Perak || 0}</p>
    <p>🎇 Jenis: ${user.Jenis || '-'}</p>
  `;
  if (!isOwner) {
    const btnPesan = document.createElement("button");
    btnPesan.innerHTML = '🎇 Kirim Pesan';
    btnPesan.style.cssText = 'padding: 8px 16px; margin-top: 10px; cursor: pointer;';
    btnPesan.onclick = () => {
      localStorage.setItem("targetID", viewedID);
      window.location.href = "inbox.html?id=" + encodeURIComponent(viewedID);
    };
    dataUserDiv.appendChild(btnPesan);
  }
}

// Load and display user's posts
function mopost() {
  db.ref("posts").orderByChild("ID").equalTo(viewedID).on("child_added", function(snapshot) {
    const data = snapshot.val();
    const key = snapshot.key;
    const isOwner = data.ID === currentID;
    const formattedDate = new Date(data.Waktu).toLocaleString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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
    document.getElementById("dapost").prepend(card);
    updateLikeDisplay(key, likeSpan);
    muatKomentar(key);
  });
}

// Submit a new post
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
      db.ref("posts").push(postData).then(resetForm).catch(() => { isPosting = false; });
    };
    reader.readAsDataURL(file);
  } else {
    db.ref("posts").push(postData).then(resetForm).catch(() => { isPosting = false; });
  }
}

// Delete a post
window.hapusPostingan = function(key, cardElement) {
  const updates = {};
  updates["/posts/" + key] = null;
  updates["/komentar/" + key] = null;
  db.ref().update(updates);
  cardElement.remove();
}

// Submit a comment
window.submitKomentarManual = function(key) {
  const input = document.getElementById("input-" + key);
  const teks = input.value.trim();
  if (teks) {
    const id = localStorage.getItem("ID") || "";
    const nama = localStorage.getItem("Nama") || "Anonim";
    db.ref("komentar/" + key).push({ID:id,Nama:nama,Teks:teks,Waktu:new Date().toLocaleString("id-ID")});
    input.value = "";
  }
}

// Load comments for a post
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

// Toggle a like on a post
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
}

// Update the like count display
function updateLikeDisplay(postId, elemen) {
  db.ref("posts/" + postId + "/likes").on("value", snap => {
    const likeCount = snap.numChildren();
    elemen.innerText = `👍 ${likeCount}`;
  });
}
