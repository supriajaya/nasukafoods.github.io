function syncPerak() {
  const el = document.getElementById("perakBalance");
  if (el) el.textContent = localStorage.getItem("Perak") || 0;
}

function syncUsername() {
  const el = document.getElementById("usernameDisplay");
  if (el) el.textContent = localStorage.getItem("Username") || "";
}

function syncNama() {
  const el = document.getElementById("namaDisplay");
  if (el) el.textContent = localStorage.getItem("Nama") || "";
}

function syncFoto() {
  const el = document.getElementById("fotoDisplay");
  if (el) el.src = localStorage.getItem("Foto") || "";
}

function syncTelepon() {
  const el = document.getElementById("teleponDisplay");
  if (el) el.textContent = localStorage.getItem("Telepon") || "";
}

function syncAlamat() {
  const el = document.getElementById("alamatDisplay");
  if (el) el.textContent = localStorage.getItem("Alamat") || "";
}

function syncSaldo() {
  const el = document.getElementById("saldoDisplay");
  if (el) el.textContent = localStorage.getItem("Saldo") || 0;
}

function syncGold() {
  const el = document.getElementById("goldDisplay");
  if (el) el.textContent = localStorage.getItem("Gold") || 0;
}


for (let key in window) {
  if (typeof window[key] === "function" && key.startsWith("show")) {
    const asli = window[key];
    window[key] = function(...args) {
      asli.apply(this, args);
      syncPerak();
      syncUsername();
      syncNama();
      syncFoto();
      syncTelepon();
      syncAlamat();
      syncSaldo();
      syncGold();
    }
  }
}
