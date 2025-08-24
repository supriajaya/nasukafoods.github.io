function initializeUserProfile() {
  const userID = localStorage.getItem("ID") || "";
  const fotoEl = document.getElementById("fotoProfil");
  const namaEl = document.getElementById("namaUser");
  const profilLink = document.getElementById("linkProfil");

  if (!userID) {
    if (namaEl) namaEl.textContent = "Silakan Masuk";
    if (fotoEl) fotoEl.src = "https://nasukafoods.site/gambarkosong.jpg";
    if (profilLink) profilLink.href = "login.html";
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
  if (profilLink) profilLink.href = `profil.html?id=${encodeURIComponent(userID)}`;
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
