function syncPerak() {
  const el = document.getElementById("perakBalance");
  if (el) el.textContent = localStorage.getItem("Perak") || 0;
}

// loop semua properti global yang namanya mulai "show"
for (let key in window) {
  if (typeof window[key] === "function" && key.startsWith("show")) {
    const asli = window[key];
    window[key] = function(...args) {
      asli.apply(this, args);
      syncPerak();
    }
  }
}
