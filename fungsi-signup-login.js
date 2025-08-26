function login() {
const username = document.getElementById("loginUsername").value.trim();
const password = document.getElementById("loginPassword").value.trim();

const errorDiv = document.getElementById("errorLogin");
const button = document.querySelector("#login-container button");

errorDiv.textContent = "";

if (!username || !password) {
errorDiv.textContent = "Nama pengguna dan password wajib diisi.";
return;
}

button.disabled = true;
button.textContent = "Tunggu sebentar ...";

db.ref("users/" + username).once("value").then(snap => {
if (!snap.exists()) {
errorDiv.textContent = "Akun tidak ditemukan.";
button.disabled = false;
button.textContent = "Masuk";
return;
}

const val = snap.val();  
if (val.Password !== password) {  
  errorDiv.textContent = "Password salah.";  
  button.disabled = false;  
  button.textContent = "Masuk";  
  return;  
}  

localStorage.setItem("ID", val.ID);          
localStorage.setItem("Nama", val.Nama);   
localStorage.setItem("Saldo", val.Saldo);    
localStorage.setItem("Perak", val.Perak);     
localStorage.setItem("Telepon", val.Telepon);               
localStorage.setItem("Username", val.Username);  
localStorage.setItem("Foto", val.Foto || "https://nasukafoods.site/gambarkosong.jpg");  

db.ref('posts')  
  .orderByChild('Waktu')  
  .limitToLast(5)  
  .once('value')  
  .then(snapshot => {  
    const posts = [];  
    snapshot.forEach(child => {  
      posts.push(child.val());  
    });  
    posts.sort((a, b) => b.Waktu - a.Waktu);  
    localStorage.setItem('latestPosts', JSON.stringify(posts));  

    if (typeof showHome === 'function') {  
      showHome();  
    } else {  
      console.error("Fungsi showHome() tidak ditemukan.");  
    }  
  });

}).catch(error => {
errorDiv.textContent = "Terjadi kesalahan, coba lagi.";
button.disabled = false;
button.textContent = "Masuk";
console.error("Login failed:", error);
});
}

function signup() {
const n = document.getElementById('signupNama').value.trim();
const u = document.getElementById('signupUsername').value.trim();
const p = document.getElementById('signupPassword').value.trim();

let errorDiv = document.getElementById("errorSignup");
if (!errorDiv) {
errorDiv = document.createElement('div');
errorDiv.className = 'error-msg';
errorDiv.id = 'errorSignup';
document.querySelector('#signup-container button').before(errorDiv);
}
errorDiv.textContent = "";
if (!n || !u || !p) {
errorDiv.textContent = 'Isi semua kolom';
return;
}

const ref = db.ref('users/' + u);
ref.get().then(snap => {
if (snap.exists()) {
errorDiv.textContent = 'Username sudah digunakan';
return;
}
const id = 'VIP-' + Date.now();
const ft = 'https://nasukafoods.site/gambarkosong.jpg';
const tp = '08';
const al = 'Jl Nasuka No69';
const ii = '1000';
const oo = '_';
const jn = 'Pria';
const st = 'VIP';

ref.set({  
  ID: id,  
  Username: u,  
  Password: p,  
  Nama: n,  
  NamaLower: n.toLowerCase(),   
  Foto: ft,  
  Telepon: tp,  
  Alamat: al,  
  Jenis: jn,  
  Status: st,         
  Rank: oo,            
  Saldo: oo,  
  Perak: ii,  
}).then(() => {  
  // Simpan semua data ke localStorage  
  localStorage.setItem('ID', id);  
  localStorage.setItem('Username', u);  
  localStorage.setItem('Nama', n);  
  localStorage.setItem('Foto', ft);  
  localStorage.setItem('Telepon', tp);  
  localStorage.setItem('Alamat', al);  
  localStorage.setItem('Jenis', jn);  
  localStorage.setItem('Status', st);  
  localStorage.setItem('Saldo', oo);  
  localStorage.setItem('Perak', ii);  
    
  localUser.Username = u;  
  localUser.ID = id;  
  localUser.Perak = ii;  
    
  // Tampilkan halaman beranda  
  showHome();  
    
}).catch((error) => {  
  errorDiv.textContent = "Gagal membuat akun, coba lagi.";  
  console.error("Signup error:", error);  
});

}).catch((error) => {
errorDiv.textContent = "Terjadi kesalahan jaringan, coba lagi.";
console.error("Database error:", error);
});
}
