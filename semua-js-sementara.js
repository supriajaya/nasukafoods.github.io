
 const firebaseConfig = {
    apiKey: "AIzaSyAJPoqA190LutHQ7xnvnV96GTRHzz24IpI",
    authDomain: "nasukafoods1.firebaseapp.com",
    databaseURL: "https://nasukafoods1-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "nasukafoods1",
    messagingSenderId: "84287800896",
    appId: "1:84287800896:web:83189d6766997b00f701a5"
};
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();
const localUser = {
  Username: localStorage.getItem("Username"),
  Nama: localStorage.getItem("Nama"),
  ID: localStorage.getItem("ID"),
  Perak: parseInt(localStorage.getItem("Perak")) || 0,
  Alamat: localStorage.getItem("Alamat") || "Alamat belum diatur",
  NomorHP: localStorage.getItem("NomorHP") || "Nomor HP belum diatur",
};
if (!localUser.ID) {
  console.log("User ID not found in localStorage. Please log in.");
}
if (localUser.ID) {
    const userRef = db.ref(`users/${localUser.ID}`);
    userRef.on('value', (snapshot) => {
      const userData = snapshot.val();
      if (userData !== null) {
        localUser.Perak = userData.Perak || 0;
        localUser.Alamat = userData.Alamat || "Alamat belum diatur";
        localUser.NomorHP = userData.NomorHP || "Nomor HP belum diatur";
        localStorage.setItem("Perak", localUser.Perak);
        localStorage.setItem("Alamat", localUser.Alamat);
        localStorage.setItem("NomorHP", localUser.NomorHP);
        updatePerakDisplay();
      }
    });
}
function updatePerakDisplay() {
  $('#perakBalance').text(localUser.Perak.toLocaleString('id-ID'));
}
function initializeHome() {
  console.log('Home page successfully loaded and initialized.');
  initializeUserProfile();
  setupChatNotifications();
}
function initializeUserProfile() {
  const userID = localStorage.getItem("ID") || "";
  const fotoEl = document.getElementById("Foto");
  const namaEl = document.getElementById("Nama");
  const profilLink = document.getElementById("Profil");
  if (!userID) {
    if (namaEl) namaEl.textContent = "Silahkan Masuk";
    if (fotoEl) fotoEl.src = "https://nasukafoods.site/gambarkosong.jpg";
    if (profilLink) {
      profilLink.href = "#";
      profilLink.onclick = showLogin;
    }
    return;
  }
  fetchUserProfileFromDB(userID);
}
function updateProfileDisplay(nama, foto, userID) {
  const namaEl = document.getElementById("Nama");
  const fotoEl = document.getElementById("Foto");
  const profilLink = document.getElementById("Profil");
  if (namaEl) namaEl.textContent = nama;
  if (fotoEl) fotoEl.src = foto;
  if (profilLink) {
    profilLink.href = "#";
    profilLink.onclick = showProfil;
  }
}
function fetchUserProfileFromDB(userID) {
  db.ref("users").orderByChild("ID").equalTo(userID).once("value").then(snap => {
    let userFound = false;
    snap.forEach(child => {
      const val = child.val();
      const nama = val.Nama || "Tanpa Nama";
      const foto = val.Foto || "https://nasukafoods.site/gambarkosong.jpg";
      localStorage.setItem("Nama", nama);
      localStorage.setItem("Foto", foto);
      localStorage.setItem("Alamat", val.Alamat || "Alamat belum diatur");
      localStorage.setItem("NomorHP", val.NomorHP || "Nomor HP belum diatur");
      localUser.Alamat = val.Alamat || "Alamat belum diatur";
      localUser.NomorHP = val.NomorHP || "Nomor HP belum diatur";
      updateProfileDisplay(nama, foto, userID);
      userFound = true;
    });
    if (!userFound) {
      updateProfileDisplay("Tanpa Nama", "https://nasukafoods.site/gambarkosong.jpg", userID);
    }
  });
}
function setupChatNotifications() {
  const userID = localStorage.getItem("ID") || "";
  const notifInbox = document.getElementById("notifInbox");
  if (!userID || !notifInbox) return;
  const userChatsRef = db.ref(`users/${userID}/chats`);
  userChatsRef.on('value', snapshot => {
    const chats = snapshot.val() || {};
    let unreadCount = 0;
    for (const key in chats) {
      if ((chats[key].read === false || chats[key].read === undefined) && chats[key].ID !== userID) {
        unreadCount++;
      }
    }
    if (unreadCount > 0) {
      notifInbox.style.display = 'inline-block';
      notifInbox.textContent = unreadCount > 99 ? '99+' : unreadCount;
    } else {
      notifInbox.style.display = 'none';
      notifInbox.textContent = '';
    }
  });
  notifInbox.onclick = () => {
    showChatSendersList(userID);
  };
}
async function showChatSendersList(userID) {
  const snapshot = await db.ref(`users/${userID}/chats`).once('value');
  const chats = snapshot.val() || {};
  if (Object.keys(chats).length === 0) {
    alert('No message senders');
    return;
  }
  const pengirimData = [];
  for (const chatID of Object.keys(chats)) {
    const userSnap = await db.ref('users').orderByChild('ID').equalTo(chatID).once('value');
    userSnap.forEach(u => {
      const nama = u.val().Nama || 'User';
      pengirimData.push({ id: chatID, nama });
    });
  }
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '50%';
  container.style.left = '50%';
  container.style.transform = 'translate(-50%, -50%)';
  container.style.background = '#fff';
  container.style.border = '1px solid #ccc';
  container.style.borderRadius = '8px';
  container.style.padding = '12px';
  container.style.zIndex = '9999';
  container.style.maxHeight = '300px';
  container.style.overflowY = 'auto';
  container.style.minWidth = '200px';
  container.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'x';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '6px';
  closeBtn.style.right = '6px';
  closeBtn.style.background = 'transparent';
  closeBtn.style.border = 'none';
  closeBtn.style.fontSize = '18px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.onclick = () => document.body.removeChild(container);
  container.appendChild(closeBtn);
  pengirimData.forEach(({ id, nama }) => {
    const btn = document.createElement('button');
    btn.textContent = nama;
    btn.style.display = 'block';
    btn.style.width = '100%';
    btn.style.margin = '6px 0';
    btn.style.padding = '8px';
    btn.style.border = 'none';
    btn.style.borderRadius = '4px';
    btn.style.background = '#2196F3';
    btn.style.color = '#fff';
    btn.style.cursor = 'pointer';
    btn.onclick = () => {
      document.body.removeChild(container);
      showInbox(id);
    };
    container.appendChild(btn);
  });
  document.body.appendChild(container);
}
const urlParams = new URLSearchParams(location.search);
const viewedID = urlParams.get("id");
const currentID = localStorage.getItem("ID");
const isOwner = currentID && viewedID === currentID;
const isLoggedIn = !!currentID;
const isVisitor = !currentID;
function loadUserProfile(userID) {
    db.ref("users").orderByChild("ID").equalTo(userID).once("value").then(snap => {
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
}
function renderUser(user) {
  document.getElementById("foto-profil").src = user.Foto || "https://nasukafoods.site/gambarkosong.jpg";
  document.querySelector('.form-post').style.display = isOwner ? 'flex' : 'none';
  const dataUserDiv = document.getElementById("dataUser");
  dataUserDiv.innerHTML = `
    <p>${user.Nama || '-'}</p>
    <p>${user.Perak || 0}</p>
    <p>${user.Jenis || '-'}</p>
  `;
  if (isLoggedIn && !isOwner) {
    const btnPesan = document.createElement("button");
    btnPesan.innerHTML = '🎇 Kirim Pesan';
    btnPesan.style.cssText = 'padding: 8px 16px; margin-top: 10px; cursor: pointer;';
    btnPesan.onclick = () => {
      localStorage.setItem("targetID", viewedID);
      showInbox(viewedID);
    };
    dataUserDiv.appendChild(btnPesan);
  }
}
function hideAllContainers() {
    document.querySelectorAll('#home-container, #login-container, #signup-container, #roll-container, #profil-container, #payment-container, #rule-container, #editprofil-container, #leaderboard-container, #belanja-container, #labirin-container, #saya-container, #inbox-container, #pasar-container, #zona1-container, #cross-container').forEach(el => {
        if (el) el.style.display = 'none';
    });
}
function showPayment(productName, productDescription, productPrice, productImageUrls, manualDescription) {
    hideAllContainers();
    if (!localStorage.getItem("ID")) {
        alert("Silahkan login terlebih dahulu untuk melanjutkan pembelian.");
        showLogin();
        return;
    }
    const userName = localStorage.getItem("Nama") || "Nama belum di setting";
    const userAddress = localStorage.getItem("Alamat") || "Alamat pengantaran belum di seting";
    const paymentContainer = document.getElementById('payment-container');
    paymentContainer.style.display = 'flex';
    let sliderHtml = '';
    if (productImageUrls && productImageUrls.length > 0) {
        sliderHtml = `
            <div class="product-image-slider">
                <div class="slider-wrapper" id="productImageSliderWrapper">
                    ${productImageUrls.map(url => `<div class="slider-item"><img src="${url}" alt="${productName}"></div>`).join('')}
                </div>
                <div class="slider-nav">
                    <button onclick="prevSlide()">&lt;</button>
                    <button onclick="nextSlide()">&gt;</button>
                </div>
                <div class="slider-dots" id="sliderDots">
                    ${productImageUrls.map((_, index) => `<span class="slider-dot" onclick="currentSlide(${index})"></span>`).join('')}
                </div>
            </div>
        `;
    }
    paymentContainer.innerHTML = `
        <div class="payment-card">
            ${sliderHtml}
            <p><strong>Produk:</strong> ${productName}</p>
            <p><strong>Deskripsi:</strong> ${productDescription}</p>
            <p><strong>Harga:</strong> Rp ${Math.round(productPrice).toLocaleString('id-ID')}</p>
            <p><strong>Keterangan:</strong> ${manualDescription}</p>
            <hr>
            <h3>Informasi Pengiriman</h3>
            <p><strong>Nama:</strong> ${userName}</p>
            <p><strong>Alamat:</strong> ${userAddress}</p>
            <hr>
            <div class="payment-options">
                <button onclick="processPayment('qris', ${productPrice}, '${productName}')">Bayar dengan QRIS</button>
                <button onclick="processPayment('dana', ${productPrice}, '${productName}')">Bayar dengan DANA</button>
            </div>
            <button onclick="showHome()" class="btn-kembali">Kembali ke Beranda</button>
            <div id="payment-status" style="margin-top: 15px;"></div>
        </div>
    `;
    if (productImageUrls && productImageUrls.length > 0) {
        initializeSlider(productImageUrls.length);
    }
}
let currentSlideIndex = 0;
let totalSlides = 0;
function initializeSlider(numSlides) {
    totalSlides = numSlides;
    currentSlideIndex = 0;
    updateSlider();
}
function updateSlider() {
    const sliderWrapper = document.getElementById('productImageSliderWrapper');
    const sliderDotsContainer = document.getElementById('sliderDots');
    if (sliderWrapper && sliderDotsContainer) {
        sliderWrapper.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
        const dots = sliderDotsContainer.children;
        for (let i = 0; i < dots.length; i++) {
            dots[i].classList.remove('active');
        }
        if (dots[currentSlideIndex]) {
            dots[currentSlideIndex].classList.add('active');
        }
    }
}
function nextSlide() {
    currentSlideIndex = (currentSlideIndex + 1) % totalSlides;
    updateSlider();
}
function prevSlide() {
    currentSlideIndex = (currentSlideIndex - 1 + totalSlides) % totalSlides;
    updateSlider();
}
function currentSlide(index) {
    currentSlideIndex = index;
    updateSlider();
}
function processPayment(method, amount, productName) {
    const statusDiv = document.getElementById('payment-status');
    statusDiv.innerHTML = '';
    if (method === 'qris') {
        statusDiv.innerHTML = '<span style="color: blue; display: block; text-align: center;">Silahkan scan kode QRIS berikut untuk melanjutkan pembayaran.</span><img src="https://nasukafoods.site/qrisbri.jpg" alt="Kode QRIS" class="qris-image">';
    } else if (method === 'dana') {
        statusDiv.innerHTML = `<span style="color: green; display: block; text-align: center;">Payment Gateway sedang dalam proses</span>`;
        const danaApiKey = "MASUKKAN_API_KEY_DANA_ANDA";
        setTimeout(() => {
            window.location.href = `https://api.dana.id/checkout?amount=${amount}&apiKey=${danaApiKey}&productName=${encodeURIComponent(productName)}`;
            statusDiv.innerHTML = `<span style="color: orange; display: block; text-align: center;">Simulasi: Mengalihkan ke DANA Payment Gateway...</span>`;
        }, 2000);
    }
}
function showHome() {
    hideAllContainers();
    document.getElementById('home-container').style.display = 'block';
    initializeHome();
}
function showProfil() {
    hideAllContainers();
    const userID = localStorage.getItem("ID");
    if (!userID) {
        alert("Silahkan login terlebih dahulu.");
        showLogin();
        return;
    }
    document.getElementById('profil-container').style.display = 'flex';
    const renderProfil = () => {
        document.getElementById('profilFoto').src = localUser.Foto || "https://nasukafoods.site/gambarkosong.jpg";
        document.getElementById('profilNama').textContent = localUser.Nama || 'Nama belum diatur';
        document.getElementById('profilUsername').textContent = localUser.Username || 'Username tidak tersedia';
        document.getElementById('profilPerak').textContent = (localUser.Perak || 0).toLocaleString('id-ID');
        document.getElementById('profilNomorHP').textContent = localUser.NomorHP || 'No. HP belum diatur';
        document.getElementById('profilAlamat').textContent = localUser.Alamat || 'Alamat belum diatur';
    };
    if (localUser.Nama) {
        renderProfil();
    } else {
        db.ref("users").child(userID).once("value").then(snapshot => {
            const user = snapshot.val();
            if (user) {
                localUser.Nama = user.Nama || 'Nama belum diatur';
                localUser.Username = user.Username || 'Username tidak tersedia';
                localUser.Perak = user.Perak || 0;
                localUser.NomorHP = user.NomorHP || 'No. HP belum diatur';
                localUser.Alamat = user.Alamat || 'Alamat belum diatur';
                localUser.Foto = user.Foto || "https://nasukafoods.site/gambarkosong.jpg";
                localStorage.setItem("Nama", localUser.Nama);
                localStorage.setItem("Perak", localUser.Perak);
                localStorage.setItem("NomorHP", localUser.NomorHP);
                localStorage.setItem("Alamat", localUser.Alamat);
                localStorage.setItem("Foto", localUser.Foto);
                renderProfil();
            } else {
                alert("Data profil tidak ditemukan.");
                showHome();
            }
        }).catch(error => {
            console.error("Gagal memuat profil:", error);
            alert("Terjadi kesalahan saat memuat data profil.");
            showHome();
        });
    }
    const profilCard = document.querySelector('#profil-container .profil-card');
    let editButton = profilCard.querySelector('#btnEditProfil');
    if (!editButton) {
        editButton = document.createElement('button');
        editButton.id = 'btnEditProfil';
        editButton.textContent = 'Edit Profil';
        editButton.className = 'btn-kembali';
        editButton.style.backgroundColor = '#2196F3';
        editButton.style.marginTop = '15px';
        editButton.onclick = showEditProfil;
        const kembaliButton = profilCard.querySelector('.btn-kembali');
        profilCard.insertBefore(editButton, kembaliButton);
    }
}
function showEditProfil() {
    hideAllContainers();
    const editContainer = document.getElementById('editprofil-container');
    editContainer.style.display = 'flex';
    editContainer.style.position = 'fixed';
    editContainer.style.top = '0';
    editContainer.style.left = '0';
    editContainer.style.width = '100%';
    editContainer.style.height = '100%';
    editContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    editContainer.style.zIndex = '200003';
    editContainer.style.justifyContent = 'center';
    editContainer.style.alignItems = 'center';
    editContainer.style.padding = '20px';
    editContainer.innerHTML = `
        <div class="auth-card">
            <h2>Edit Profil</h2>
            <form id="editProfilForm">
                <input type="text" id="editNama" placeholder="Nama Lengkap" value="${localUser.Nama || ''}" required>
                <input type="text" id="editNomorHP" placeholder="Nomor HP" value="${localUser.NomorHP === 'No. HP belum diatur' ? '' : localUser.NomorHP}" required>
                <textarea id="editAlamat" placeholder="Alamat Pengiriman" rows="3" required>${localUser.Alamat === 'Alamat belum diatur' ? '' : localUser.Alamat}</textarea>
                <input type="password" id="editPassword" placeholder="Password Baru (kosongkan jika tidak ingin ganti)">
                <button type="submit">Simpan Perubahan</button>
                <div id="editStatus" class="auth-status"></div>
            </form>
            <button onclick="showProfil()" class="btn-kembali" style="margin-top: 10px;">Batal</button>
        </div>
    `;
    document.getElementById('editProfilForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateProfile();
    });
}
function updateProfile() {
    const userID = localUser.ID;
    const nama = document.getElementById('editNama').value.trim();
    const nomorHP = document.getElementById('editNomorHP').value.trim();
    const alamat = document.getElementById('editAlamat').value.trim();
    const password = document.getElementById('editPassword').value.trim();
    const statusDiv = document.getElementById('editStatus');
    statusDiv.className = 'auth-status';
    statusDiv.innerHTML = 'Menyimpan...';
    if (!nama || !nomorHP || !alamat) {
        statusDiv.innerHTML = 'Nama, Nomor HP, dan Alamat wajib diisi.';
        statusDiv.classList.add('error');
        return;
    }
    const updates = {
        Nama: nama,
        NomorHP: nomorHP,
        Alamat: alamat
    };
    if (password) {
        if (password.length < 5) {
            statusDiv.innerHTML = 'Password minimal 5 karakter.';
            statusDiv.classList.add('error');
            return;
        }
        updates.Password = password;
    }
    db.ref(`users/${userID}`).update(updates)
        .then(() => {
            localUser.Nama = nama;
            localUser.NomorHP = nomorHP;
            localUser.Alamat = alamat;
            localStorage.setItem("Nama", nama);
            localStorage.setItem("NomorHP", nomorHP);
            localStorage.setItem("Alamat", alamat);
            statusDiv.innerHTML = 'Profil berhasil diperbarui!';
            statusDiv.classList.add('success');
            updateProfileDisplay(localUser.Nama, localUser.Foto, localUser.ID);
            setTimeout(showProfil, 1500);
        })
        .catch(error => {
            console.error("Update Profil Error:", error);
            statusDiv.innerHTML = 'Gagal memperbarui profil. Silakan coba lagi.';
            statusDiv.classList.add('error');
        });
}
function showLogin() {
    hideAllContainers();
    document.getElementById('login-container').style.display = 'flex';
    document.getElementById('loginStatus').innerHTML = '';
    document.getElementById('loginForm').reset();
}
function showSignup() {
    hideAllContainers();
    document.getElementById('signup-container').style.display = 'flex';
    document.getElementById('signupStatus').innerHTML = '';
    document.getElementById('signupForm').reset();
}
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    loginUser();
});
document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    signupUser();
});
function loginUser() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const statusDiv = document.getElementById('loginStatus');
    statusDiv.className = 'auth-status';
    statusDiv.innerHTML = 'Memproses...';
    if (!username || !password) {
        statusDiv.innerHTML = 'Username dan Password wajib diisi.';
        statusDiv.classList.add('error');
        return;
    }
    db.ref("users").orderByChild("Username").equalTo(username).once("value")
        .then(snapshot => {
            const userData = snapshot.val();
            if (userData) {
                const userKey = Object.keys(userData)[0];
                const user = userData[userKey];
                if (user.Password === password) {
                    localStorage.setItem("ID", user.ID);
                    localStorage.setItem("Username", user.Username);
                    localStorage.setItem("Nama", user.Nama);
                    localStorage.setItem("Perak", user.Perak || 0);
                    localStorage.setItem("Foto", user.Foto || "https://nasukafoods.site/gambarkosong.jpg");
                    localStorage.setItem("Alamat", user.Alamat || "Alamat belum diatur");
                    localStorage.setItem("NomorHP", user.NomorHP || "Nomor HP belum diatur");
                    statusDiv.innerHTML = 'Login Berhasil! Mengalihkan...';
                    statusDiv.classList.add('success');
                    localUser.ID = user.ID;
                    localUser.Username = user.Username;
                    localUser.Nama = user.Nama;
                    localUser.Perak = user.Perak || 0;
                    localUser.Foto = user.Foto || "https://nasukafoods.site/gambarkosong.jpg";
                    localUser.Alamat = user.Alamat || "Alamat belum diatur";
                    localUser.NomorHP = user.NomorHP || "Nomor HP belum diatur";
                    setTimeout(showHome, 1500);
                } else {
                    statusDiv.innerHTML = 'Password salah.';
                    statusDiv.classList.add('error');
                }
            } else {
                statusDiv.innerHTML = 'Username tidak ditemukan.';
                statusDiv.classList.add('error');
            }
        })
        .catch(error => {
            console.error("Login Error:", error);
            statusDiv.innerHTML = 'Terjadi kesalahan saat login.';
            statusDiv.classList.add('error');
        });
}
function signupUser() {
    const username = document.getElementById('signupUsername').value.trim();
    const nama = document.getElementById('signupNama').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const statusDiv = document.getElementById('signupStatus');
    statusDiv.className = 'auth-status';
    statusDiv.innerHTML = 'Memproses...';
    if (!username || !nama || !password) {
        statusDiv.innerHTML = 'Semua field wajib diisi.';
        statusDiv.classList.add('error');
        return;
    }
    if (username.length < 5 || password.length < 5) {
        statusDiv.innerHTML = 'Username dan Password harus minimal 5 karakter.';
        statusDiv.classList.add('error');
        return;
    }
    db.ref("users").orderByChild("Username").equalTo(username).once("value")
        .then(snapshot => {
            if (snapshot.exists()) {
                statusDiv.innerHTML = 'Username sudah digunakan. Silakan pilih yang lain.';
                statusDiv.classList.add('error');
            } else {
                const newID = db.ref().child('users').push().key;
                const newUser = {
                    ID: newID,
                    Username: username,
                    Nama: nama,
                    Password: password,
                    Perak: 1000,
                    Foto: "https://nasukafoods.site/gambarkosong.jpg",
                    Jenis: "Member",
                    Alamat: "Alamat belum diatur",
                    NomorHP: "Nomor HP belum diatur"
                };
                db.ref(`users/${newID}`).set(newUser)
                    .then(() => {
                        localStorage.setItem("ID", newUser.ID);
                        localStorage.setItem("Username", newUser.Username);
                        localStorage.setItem("Nama", newUser.Nama);
                        localStorage.setItem("Perak", newUser.Perak);
                        localStorage.setItem("Foto", newUser.Foto);
                        localStorage.setItem("Alamat", newUser.Alamat);
                        localStorage.setItem("NomorHP", newUser.NomorHP);
                        localUser.ID = newUser.ID;
                        localUser.Username = newUser.Username;
                        localUser.Nama = newUser.Nama;
                        localUser.Perak = newUser.Perak;
                        localUser.Foto = newUser.Foto;
                        localUser.Alamat = newUser.Alamat;
                        localUser.NomorHP = newUser.NomorHP;
                        statusDiv.innerHTML = 'Pendaftaran Berhasil! Anda mendapatkan 1.000 Perak gratis. Mengalihkan ke Beranda...';
                        statusDiv.classList.add('success');
                        setTimeout(showHome, 1500);
                    })
                    .catch(error => {
                        console.error("Signup Error:", error);
                        statusDiv.innerHTML = 'Gagal mendaftar. Silakan coba lagi.';
                        statusDiv.classList.add('error');
                    });
            }
        })
        .catch(error => {
            console.error("Check Username Error:", error);
            statusDiv.innerHTML = 'Terjadi kesalahan sistem. Silakan coba lagi.';
            statusDiv.classList.add('error');
        });
}
function showReturnPolicy() {
    alert("Halaman Kebijakan Pengembalian (returnpolicy-container) akan ditampilkan di sini.");
}
function showDisclaimer() {
    alert("Halaman Syarat & Ketentuan (disclaimer-container) akan ditampilkan di sini.");
}
function showFaq() {
    alert("Halaman Tentang / FAQ (faq-container) akan ditampilkan di sini.");
}
$(document).ready(function() {
    initializeHome();
});
const ROLL_PER_REEL = 10; const REEL_RADIUS = 400; const SPIN_DURATION = 5; const MANUAL_SPIN_COOLDOWN = 4 * 400; const WIN_MULTIPLIERS = { 'dua': 2, 'tiga': 3, 'empat': 4, 'lima': 5, 'jackpot': 10 }; const WIN_PROBABILITIES = { 'dua': 0.1, 'tiga': 0.03, 'empat': 0.02, 'lima': 0.0000000000000000000000000000000000000001, 'jackpot': 0.00000000000000000000000000000000000000000000000000001 }; let isSpinning = false; let lastManualSpinTime = 0; let currentmain = 0; let isAutomainEnabled = false; let playerWinStreak = 0; let playerLoseStreak = 0; const HOUSE_EDGE = 0; let totalPerakBurung = 0; function updatePerakDisplay() { $('#perakBalance').text(localUser.Perak.toLocaleString('id-ID')); } function showErrorMessage(message) { $('#errorMessage').text(message).fadeIn().delay(3000).fadeOut(); } function createROLL(ring) { const rollAngle = 360 / ROLL_PER_REEL; for (let i = 0; i < ROLL_PER_REEL; i++) { const roll = document.createElement('div'); roll.className = 'roll backface-on'; roll.style.transform = `rotateX(${rollAngle * i}deg) translateZ(${REEL_RADIUS}px)`; const p = document.createElement('p'); p.textContent = i; roll.appendChild(p); ring.append(roll); } } function generateDua() { const num = Math.floor(Math.random() * 10); const result = [num, num]; while (result.length < 5) { const uniqueNum = Math.floor(Math.random() * 10); if (!result.includes(uniqueNum)) { result.push(uniqueNum); } } return shuffleArray(result); } function generateTiga() { const num = Math.floor(Math.random() * 10); const result = [num, num, num]; while (result.length < 5) { const uniqueNum = Math.floor(Math.random() * 10); if (!result.includes(uniqueNum)) { result.push(uniqueNum); } } return shuffleArray(result); } function generateEmpat() { const num = Math.floor(Math.random() * 10); const result = [num, num, num, num]; while (result.length < 5) { const uniqueNum = Math.floor(Math.random() * 10); if (!result.includes(uniqueNum)) { result.push(uniqueNum); } } return shuffleArray(result); } function generateLima() { const num = Math.floor(Math.random() * 10); return [num, num, num, num, num]; } function generateJackpot() { const result = [1, 2, 3, 4, 5]; return shuffleArray(result); } function generateRandomResult() { const result = []; while (result.length < 5) { const num = Math.floor(Math.random() * 10); if (!result.includes(num)) { result.push(num); } } return result; } function shuffleArray(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } return array; } function generateControlledResult() { let currentProbabilities = WIN_PROBABILITIES; const rand = Math.random(); let cumulativeProb = 0; for (const type in currentProbabilities) { cumulativeProb += currentProbabilities[type]; if (rand < cumulativeProb) { switch (type) { case 'dua': return generateDua(); case 'tiga': return generateTiga(); case 'empat': return generateEmpat(); case 'lima': return generateLima(); case 'jackpot': return generateJackpot(); } } } return generateRandomResult(); } function checkWin(result) { const sortedResult = [...result].sort((a, b) => a - b).join(''); if (sortedResult === '12345') { return 'jackpot'; } const frequency = {}; result.forEach(num => { frequency[num] = (frequency[num] || 0) + 1; }); const counts = Object.values(frequency); const hasLima = counts.some(count => count >= 5); const hasEmpat = counts.some(count => count >= 4); const hasTiga = counts.some(count => count >= 3); const hasDua = counts.some(count => count >= 2); if (hasLima) { return 'lima'; } else if (hasEmpat) { return 'empat'; } else if (hasTiga) { return 'tiga'; } else if (hasDua) { return 'dua'; } return null; } function selectmain(amount) { if (amount > 0 && amount <= localUser.Perak) { currentmain = amount; $('#mainAmount').val(amount); $('#automainButtons button').removeClass('active'); $(`#main${amount}`).addClass('active'); } else if (amount === 0) { currentmain = 0; $('#mainAmount').val(''); $('#automainButtons button').removeClass('active'); } else { showErrorMessage(''); } } function startAutoSpin() { if (currentmain <= 0) { showErrorMessage('Silakan pilih jumlah taruhan (Perak) terlebih dahulu.'); return; } isAutomainEnabled = true; $('#startAutoSpinButton').hide(); $('#stopAutoSpinButton').show(); $('#spinButton').prop('disabled', true); spin(false); } function stopAutoSpin() { isAutomainEnabled = false; $('#stopAutoSpinButton').hide(); $('#startAutoSpinButton').show(); $('#spinButton').prop('disabled', false); } 
function spin(isManual) {
    if (isSpinning) return;
    const winAudio = document.getElementById('winAudio');
    winAudio.pause();
    winAudio.currentTime = 0;
    const slotAudio = document.getElementById('slotAudio');
    slotAudio.currentTime = 0;
    
    slotAudio.play().catch(err => {
        console.warn("Autoplay slotAudio diblokir:", err);
    }); 
    if (currentmain <= 0) {
        showErrorMessage('Silakan pilih jumlah taruhan (Perak) terlebih dahulu.');
        isAutomainEnabled = false;
        stopAutoSpin();
        return;
    }
    
    if (currentmain > localUser.Perak) {
        showErrorMessage('Saldo Perak Anda tidak cukup.');
        isAutomainEnabled = false;
        stopAutoSpin();
        return;
    }
    localUser.Perak -= currentmain;
    updatePerakDisplay();
    isSpinning = true;
    
    $('#mainResult').addClass('result-hidden').removeClass('win lose'); 
    if (isManual) {
        lastManualSpinTime = Date.now();
        $('#spinButton').prop('disabled', true);
        updateManualSpinButton();
    }
    
    $('#stage .roll p').removeClass('bling-bling'); 
    for (let i = 1; i <= 5; i++) {
        $(`#ring${i}`).css('animation', `back-spin 1s`);
    }
    setTimeout(() => {
        const result = generateControlledResult();
        for (let i = 1; i <= 5; i++) {
            const seed = result[i - 1];
            $(`#ring${i}`).css('animation', `spin-${seed} ${SPIN_DURATION}s cubic-bezier(0.1, 0.7, 0.1, 1)`).attr('class', `ring spin-${seed}`);
        }
        setTimeout(() => {
            slotAudio.pause();
            slotAudio.currentTime = 0;
            for (let i = 0; i < result.length; i++) {
                const numberElement = $(`#ring${i+1} .roll`).eq(result[i]).find('p');
                numberElement.addClass('bling-bling');
            }
            processmainResult(result, isManual);
            isSpinning = false;
            if (isAutomainEnabled) {
                setTimeout(() => {
                    if (isAutomainEnabled) {
                        spin(false);
                    }
                }, 3000);
            } else {
                 if (isManual) {
                     updateManualSpinButton();
                 }
            }
        }, SPIN_DURATION * 1000);
    }, 1000);
}
function processmainResult(result, isManual) { const winType = checkWin(result); let message = "Coba lagi."; let messageClass = "lose"; let winAmount = 0; let netChange = 0; if (winType) { playerWinStreak++; playerLoseStreak = 0; const baseMultiplier = WIN_MULTIPLIERS[winType]; const totalMultiplier = baseMultiplier * (1 - HOUSE_EDGE); winAmount = Math.round(currentmain * totalMultiplier); message = `Selamat! Anda mendapatkan +${winAmount.toLocaleString('id-ID')} Perak!`; messageClass = "win"; triggerConfetti(); document.getElementById('winAudio').play(); netChange = winAmount; } else { playerWinStreak = 0; playerLoseStreak++; netChange = 0; } localUser.Perak += netChange; db.ref(`users/${localUser.ID}`).child('Perak').set(localUser.Perak)
.then(() => { localStorage.setItem("Perak", localUser.Perak); updatePerakDisplay(); $('#mainResult').text(message).removeClass('result-hidden').addClass(messageClass); }) .catch(error => { console.error("Gagal memperbarui Perak di database:", error); showErrorMessage("Gagal memperbarui perak. Silakan coba lagi."); }); } function updateManualSpinButton() { const now = Date.now(); const timeSinceLastSpin = now - lastManualSpinTime; const remainingCooldown = Math.max(0, MANUAL_SPIN_COOLDOWN - timeSinceLastSpin); if (remainingCooldown <= 0) { $('#spinButton').prop('disabled', false).text('Putar'); } else { const seconds = Math.ceil(remainingCooldown / 1000); $('#spinButton').text(`Tunggu ${seconds}s`); setTimeout(updateManualSpinButton, 1000); } } function triggerConfetti() { const defaults = { spread: 360, ticks: 200, gravity: 0.4, decay: 0.94, startVelocity: 90, colors: ['#FFC107', '#E91E63', '#4CAF50', '#2196F3'] }; function shoot() { confetti({ ...defaults, particleCount: 2000, scalar: 1.2, shapes: ['star'] }); confetti({ ...defaults, particleCount: 300, scalar: 0.8, shapes: ['circle'] }); } setTimeout(shoot, 0); setTimeout(shoot, 150); setTimeout(shoot, 300); } $(document).ready(function() { for (let i = 1; i <= 5; i++) createROLL($('#ring' + i)); $('#rotate').addClass('tilted'); $('.roll').addClass('backface-on'); setTimeout(() => { $('#loading').fadeOut(); }, 2000); let winAudio = document.getElementById('winAudio'); let userInteracted = false; $('#spinButton').click(function() { if (!userInteracted) { winAudio.muted = true; winAudio.play().then(() => { winAudio.pause(); winAudio.currentTime = 0; winAudio.muted = false; userInteracted = true; }).catch(error => { console.error("Autoplay blocked:", error); }); } if (!$(this).prop('disabled')) { spin(true); } }); $('#startAutoSpinButton').click(startAutoSpin); $('#stopAutoSpinButton').click(stopAutoSpin); }); 
