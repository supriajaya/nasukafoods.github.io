// Tampilkan postingan publik terakhir tetap seperti semula
      db.ref("posts")
        .orderByChild("Status")
        .equalTo("publik")
        .limitToLast(20)
        .on("child_added", async postSnap => {
          const post = postSnap.val();
          const postId = postSnap.key;
          const namaPemilik = await getUserData(post.ID);

          const div = document.createElement("div");
          div.className = "post-item";
          div.style.flexDirection = "column";

          div.innerHTML = `
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

          daftar.prepend(div);

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

          let komentarLoaded = false;
          const btnLihat = div.querySelector(`#lihatKomentarBtn-${postId}`);
          const wadahKomentar = div.querySelector(`#komentar-${postId}`);

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
        });

      window.kirimKomentar = function(postId) {
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

      document.getElementById("modalGambar").addEventListener("click", () => {
        document.getElementById("modalGambar").style.display = "none";
      });
    });
    
    
