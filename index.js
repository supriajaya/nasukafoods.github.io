<script>
document.addEventListener("DOMContentLoaded", function () {
  const firebaseConfig = {
    apiKey: "AIzaSyDE17I5nEIdrfQhfRP5ewloydX18Sw47ws",
    authDomain: "nasukachat.firebaseapp.com",
    databaseURL: "https://nasukachat-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "nasukachat",
    storageBucket: "nasukachat.firebasestorage.app",
    messagingSenderId: "759589458121",
    appId: "1:759589458121:web:d5670da0d080017e2ffd18"
  };

  if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
  }

  const db = firebase.database();
  const userID = localStorage.getItem("ID");
  const username = localStorage.getItem("Username");
  const fotoEl = document.getElementById("fotoProfil");
  const namaEl = document.getElementById("namaUser");
  const profilLink = document.getElementById("linkProfil");
  const btn = document.getElementById("btnLoginNasuka");

  if (!userID) {
    namaEl.textContent = "Silakan Masuk";
    fotoEl.src = "https://nasukafoods.site/gambarkosong.jpg";
    profilLink.href = "sign.html";
    btn.textContent = "Masuk";
    btn.href = "login.html";
  } else {
    const nama = localStorage.getItem("Nama");
    const foto = localStorage.getItem("Foto");

    if (nama && foto) {
      namaEl.textContent = nama;
      fotoEl.src = foto;
      profilLink.href = `profil.html?id=${encodeURIComponent(userID)}`;
      btn.textContent = "✅";
      btn.removeAttribute("href");
      btn.style.opacity = "0.6";
      btn.style.cursor = "default";
    } else {
      db.ref("users").once("value").then(snap => {
        snap.forEach(child => {
          const val = child.val();
          if (val.ID === userID) {
            const namaBaru = val.Nama || "Tanpa Nama";
            const fotoBaru = val.Foto || "https://nasukafoods.site/gambarkosong.jpg";
            localStorage.setItem("Nama", namaBaru);
            localStorage.setItem("Foto", fotoBaru);
            namaEl.textContent = namaBaru;
            fotoEl.src = fotoBaru;
            profilLink.href = `profil.html?id=${encodeURIComponent(userID)}`;
            btn.textContent = "✅";
            btn.removeAttribute("href");
            btn.style.opacity = "0.6";
            btn.style.cursor = "default";
          }
        });
      });
    }

    db.ref("users").on("child_changed", snap => {
      const val = snap.val();
      if (val.ID === userID) {
        localStorage.setItem("Nama", val.Nama || "Tanpa Nama");
        localStorage.setItem("Foto", val.Foto || "https://nasukafoods.site/gambarkosong.jpg");
        namaEl.textContent = val.Nama || "Tanpa Nama";
        fotoEl.src = val.Foto || "https://nasukafoods.site/gambarkosong.jpg";
      }
    });

    db.ref("users").on("child_added", snap => {
      const val = snap.val();
      if (val.ID === userID) {
        localStorage.setItem("Nama", val.Nama || "Tanpa Nama");
        localStorage.setItem("Foto", val.Foto || "https://nasukafoods.site/gambarkosong.jpg");
        namaEl.textContent = val.Nama || "Tanpa Nama";
        fotoEl.src = val.Foto || "https://nasukafoods.site/gambarkosong.jpg";
      }
    });
  }

  let online = Math.floor(Math.random() * 31) + 300;
  const onlineEl = document.querySelector(".fake-online");

  function updateOnline() {
    const delta = Math.floor(Math.random() * 5) - 2;
    online = Math.max(300, Math.min(online + delta, 500));
    onlineEl.textContent = `🟢 Online ${online} pengguna`;
  }

  setInterval(updateOnline, 5000);

  document.getElementById("cariUser").addEventListener("input", function () {
    const k = this.value.trim().toLowerCase();
    const h = document.getElementById("hasilUser");
    h.innerHTML = "";
    if (k.length < 2) return;
    db.ref("users").once("value").then(s => {
      s.forEach(c => {
        const v = c.val();
        if ((v.Nama || "").toLowerCase().includes(k)) {
          const d = document.createElement("div");
          d.innerHTML = `<div style="display:flex;align-items:center;gap:8px;background:#fff;padding:8px;border-radius:6px;box-shadow:0 1px 4px rgba(0,0,0,0.1)">
  <img src="${v.Foto || 'https://nasukafoods.site/gambarkosong.jpg'}" style="width:40px;height:40px;border-radius:50%;object-fit:cover">
  <div style="flex:1"><b>${v.Nama || 'Tanpa Nama'}</b><br><a href="profil.html?id=${encodeURIComponent(v.ID)}" style="font-size:12px;color:#2196F3">Lihat Profil</a></div></div>`;
          h.appendChild(d);
        }
      });
    });
  });







  db.ref("posts").orderByChild("Status").equalTo("publik").on("value", function(snapshot) {
  const daftar = document.getElementById("daftarPostingan");
  daftar.innerHTML = "";
  let posts = [];
  snapshot.forEach(postSnap => {
    posts.push(postSnap);
  });
  posts.reverse().forEach(postSnap => {
    const post = postSnap.val();
    const postId = postSnap.key;
    const userId = post.ID || "";
    db.ref("users").orderByChild("ID").equalTo(userId).once("value").then(userSnap => {
      let namaPemilik = "Tanpa Nama";
      userSnap.forEach(u => {
        const val = u.val();
        if (val.Nama) namaPemilik = val.Nama;
      });

      const div = document.createElement("div");
      div.className = "post-item";
      div.style.flexDirection = "column";
      
        
        div.innerHTML = `
  <div style="text-align:center;font-weight:bold;font-size:14px;margin-bottom:6px">${namaPemilik}</div>
  ${post.Foto ? `<img src="${post.Foto}" class="foto-post" style="width:100px;height:100px;margin:0 auto 8px;display:block;border-radius:8px;object-fit:cover;cursor:pointer" onclick="tampilkanGambarPenuh('${post.Foto}')">` : ""}
        
        
        
        
        
        
        
        
        
        
        <div class="konten-post" style="width:100%;text-align:left">
          <div style="font-size:13px;margin:4px 0"><b>${post.Judul || ''}</b></div>
         
          <div style="font-size:11px;color:gray;margin-top:4px">${post.Waktu ? new Date(post.Waktu).toLocaleString("id-ID") : ''}</div>
          
          
          
        </div>
        <div id="komentar-${postId}" style="margin-top:10px"></div>
        <div style="display:flex;gap:6px;margin-top:6px">
          <input id="inputKomentar-${postId}" placeholder="Tulis komentar..." style="flex:1;padding:6px;border:1px solid #ccc;border-radius:6px;font-size:13px">
          <button onclick="kirimKomentar('${postId}')" style="padding:6px 10px;background:#2196F3;color:white;border:none;border-radius:6px;font-size:13px">Kirim</button>
        </div>
      `;
      daftar.appendChild(div);

      db.ref("komentar/" + postId).on("value", snap => {
        const wadah = document.getElementById("komentar-" + postId);
        wadah.innerHTML = "";
        snap.forEach(c => {
          const v = c.val();
          const d = document.createElement("div");
          d.style = "background:#f9f9f9;padding:6px;margin-top:4px;border-radius:6px;font-size:12px";
          d.innerHTML = `<b>${v.Nama || "Anonim"}</b>: ${v.Teks || ""}`;
          wadah.appendChild(d);
        });
      });
    });
  });
});
  window.kirimKomentar = function(postId) {
    const userID = localStorage.getItem("ID") || "";
    const nama = localStorage.getItem("Nama") || "Anonim";
    const teks = document.getElementById("inputKomentar-" + postId).value.trim();
    if (teks === "") return;
    const ref = db.ref("komentar/" + postId).push();
    ref.set({
      ID: userID,
      Nama: nama,
      Teks: teks,
      Waktu: new Date().toLocaleString("id-ID")
    });
    document.getElementById("inputKomentar-" + postId).value = "";
  };
});
window.tampilkanGambarPenuh = function(src) {
  if (!src) return;
  gambarModal.src = src;
  modal.style.display = "flex";
};






const modal = document.getElementById("modalGambar");
const gambarModal = document.getElementById("gambarModal");
modal.addEventListener("click", () => modal.style.display = "none");

</script>