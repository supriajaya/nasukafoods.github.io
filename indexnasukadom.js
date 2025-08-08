document.addEventListener("DOMContentLoaded", function () {
  
  if (firebase.apps.length === 0) {  
    firebase.initializeApp(firebaseConfig);  
  }  
  
  const db = firebase.database();  
  const userID = localStorage.getItem("ID");  
  const username = localStorage.getItem("Username");  
  const fotoEl = document.getElementById("fotoProfil");  
  const namaEl = document.getElementById("namaUser");  
  const profilLink = document.getElementById("linkProfil");  
  
  
  if (!userID) {  
    namaEl.textContent = "Silakan Masuk";  
    fotoEl.src = "https://nasukafoods.site/gambarkosong.jpg";  
    profilLink.href = "login.html";  
    
  } else {  
    const nama = localStorage.getItem("Nama");  
    const foto = localStorage.getItem("Foto");  
  
    if (nama && foto) {  
      namaEl.textContent = nama;  
      fotoEl.src = foto;  
      profilLink.href = `profil.html?id=${encodeURIComponent(userID)}`;  
      
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
  
  
  
  db.ref("users").orderByChild("ID").equalTo(userID).on("child_changed", snap => {
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
  const now = new Date();
  const hour = now.getHours();

  let base = 0;

  if (hour >= 6 && hour < 9) base = 110 + Math.floor(Math.random() * 20);      
  else if (hour >= 9 && hour < 12) base = 200 + Math.floor(Math.random() * 30);  
  else if (hour >= 12 && hour < 14) base = 290 + Math.floor(Math.random() * 20);  // istirahat siang
  else if (hour >= 14 && hour < 17) base = 310 + Math.floor(Math.random() * 40);  // sore kerja
  else if (hour >= 17 && hour < 20) base = 470 + Math.floor(Math.random() * 50);  // prime time
  else if (hour >= 20 && hour < 23) base = 650 + Math.floor(Math.random() * 50);  // malam ramai
  else base = 200 + Math.floor(Math.random() * 30);                          

  onlineEl.textContent = `🟢 Online ${base}`;
}
  
 
  
  setInterval(updateOnline, 10000);  
  
  
document.getElementById("cariUser").addEventListener("input", function () {  
  const k = this.value.trim().toLowerCase();  
  const h = document.getElementById("hasilUser");  
  h.innerHTML = "";  
  if (k.length < 2) return;     
  db.ref("users").once("value").then(snap => {
    snap.forEach(child => {
      const v = child.val();
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

  window.toggleLike = function(postId) {
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
  };
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
      const userId = post.ID || ""; db.ref("users").orderByChild("ID").equalTo(userId).once("value").then(userSnap => {
        let namaPemilik = "Tanpa Nama";
        userSnap.forEach(u => {
          const val = u.val();
          if (val.Nama) namaPemilik = val.Nama;
        });
        const div = document.createElement("div");
        div.className = "post-item";
        div.style.flexDirection = "column";
        div.innerHTML = `
          <div         style="text-align:center;font-weight:bold;font-size:14px;margin-bottom:6px">${namaPemilik}</div>
          ${post.Foto ? `<img src="${post.Foto}" class="foto-post" style="width:100px;height:100px;margin:0 auto 8px;display:block;border-radius:8px;object-fit:cover;cursor:pointer" onclick="tampilkanGambarPenuh('${post.Foto}')">` : ""}
          
          
          <div class="konten-post" style="width:100%;text-align:left">
            <div style="font-size:13px;margin:4px 0"><b>${post.Judul || ''}</b></div>
            <div style="font-size:11px;color:gray;margin-top:4px">${post.Waktu ? new Date(post.Waktu).toLocaleString("id-ID") : ''}</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:8px">
            <button onclick="toggleLike('${postId}')" id="likeBtn-${postId}" style="padding:6px 10px;background:#eee;border-radius:6px;border:none;cursor:pointer;font-size:13px">❤️ </button>
            <span id="likeCount-${postId}" style="font-size:13px">0 suka</span>
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

        db.ref("likes/" + postId).on("value", snap => {
          const likeCount = snap.numChildren();
          const likeCountEl = document.getElementById("likeCount-" + postId);
          if (likeCountEl) {
            likeCountEl.textContent = `${likeCount} suka`;
          }
          const userID = localStorage.getItem("ID") || "";
          const likeBtn = document.getElementById("likeBtn-" + postId);
          if (likeBtn) {
            if (snap.hasChild(userID)) {
              likeBtn.textContent = "❤️";
              likeBtn.style.background = "#f8d7da";
            } else {
              likeBtn.textContent = " 💔";
              likeBtn.style.background = "#eee";
            }
          }
        });
      });
    });
  });
});
  

window.tampilkanGambarPenuh = function(src) {  
  if (!src) return;  
  gambarModal.src = src;  
  modal.style.display = "flex";  
};  
const modal = document.getElementById("modalGambar");  
const gambarModal = document.getElementById("gambarModal");  
modal.addEventListener("click", () => modal.style.display = "none");  
  
    
    
