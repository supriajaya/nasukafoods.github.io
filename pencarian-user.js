document.getElementById("cariUser").addEventListener("input", function() {
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
                    <a href="profil.html?id=${encodeURIComponent(v.ID)}" style="font-size:12px; color:#2196F3">Lihat Profil</a>
                  </div>
                </div>`;
              hasilUserEl.appendChild(d);
            });
          });
      });

      // Fungsi untuk mendapatkan nama user cache
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
          });
        });
      }
