  function showModal(id) {
      document.querySelectorAll(".modal").forEach(m => m.style.display = "none");
      document.getElementById("modal-" + id).style.display = "flex";
    }

    window.addEventListener("click", e => {
      if (e.target.classList.contains("modal")) e.target.style.display = "none";
    });

    const ID = localStorage.getItem("ID");
    firebase.database().ref("users").orderByChild("ID").equalTo(ID).once("value").then(snap => {
      if (snap.exists()) {
        const data = Object.values(snap.val())[0];
        document.querySelector(".profile-pic").src = data.Foto || "";
        document.querySelector("h2").textContent = data.Nama || "";
        document.querySelector(".bio").innerHTML = `
          <strong></strong><br/>
          ${data.Bio || ""}<br/>♀️/♂️ : ${data.Jenis || ""}
        `;
        document.querySelector(".stats").innerHTML = `
          <span>Saldo : <strong>${data.Saldo || 0}</strong></span>
          <span>Gold : <strong>${data.Gold || 0}</strong></span>
        `;
        if (Array.isArray(data.Galeri)) {
          const galeri = document.querySelector(".gallery");
          galeri.innerHTML = "";
          data.Galeri.forEach((src) => {
            const img = document.createElement("img");
            img.src = src;
            img.alt = "foto";
            galeri.appendChild(img);
          });
        }
        document.querySelector(".tiktok").textContent = data.Tiktok || "";
        document.querySelector(".facebook").textContent = data.Facebook || "";
        document.querySelector(".pekerjaan").textContent = data.Pekerjaan || "";
        document.querySelector(".usia").textContent = data.Usia || "";
        document.querySelector(".alamat").textContent = data.Alamat || "";
        document.querySelector(".followers").textContent = data.Followers || 0;
        document.querySelector(".username").textContent = data.Username || "";
        document.querySelector(".password").textContent = data.Password || "";
        document.querySelector(".teman").textContent = data.Teman || 0;
        document.querySelector(".rank").textContent = data.Rank || "";
      }
    });
