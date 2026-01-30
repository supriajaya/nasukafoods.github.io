
    
const firebaseConfig = {
    apiKey: "AIzaSyAJPoqA190LutHQ7xnvnV96GTRHzz24IpT",
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
const userRef = db.ref(`users/${localStorage.getItem("ID")}`); 

const localUser = {
  Username: localStorage.getItem("Username"),
  Nama: localStorage.getItem("Nama"),
  ID: localStorage.getItem("ID"),
  Saldo: parseInt(localStorage.getItem("Saldo")) || 0,
  Alamat: localStorage.getItem("Alamat") || "Alamat belum diatur",
  NomorHP: localStorage.getItem("NomorHP") || "Nomor HP belum diatur",
  Foto: localStorage.getItem("Foto") || "https://nasukafoods.site/gambarkosong.jpg", 
  TotalPengeluaran: parseInt(localStorage.getItem("TotalPengeluaran")) || 0,
  Poin: parseInt(localStorage.getItem("Poin")) || 0,
};

if (localUser.ID) {
    const userRef = db.ref(`users/${localUser.ID}`);
    userRef.on('value', (snapshot) => {
      const userData = snapshot.val();
      if (userData !== null) {
        localUser.Saldo = userData.Saldo || 0;
        localUser.Alamat = userData.Alamat || "Alamat belum diatur";
        localUser.NomorHP = userData.NomorHP || "Nomor HP belum diatur";
        localUser.Foto = userData.Foto || "https://nasukafoods.site/gambarkosong.jpg"; 
        localUser.Nama = userData.Nama || localUser.Nama;
        localUser.TotalPengeluaran = userData.TotalPengeluaran || 0; 
        localUser.Poin = userData.Poin || 0;
        
        localStorage.setItem("Saldo", localUser.Saldo);
        localStorage.setItem("Alamat", localUser.Alamat);
        localStorage.setItem("NomorHP", localUser.NomorHP);
        localStorage.setItem("Foto", localUser.Foto);
        localStorage.setItem("Nama", localUser.Nama);
        localStorage.setItem("TotalPengeluaran", localUser.TotalPengeluaran); 
        localStorage.setItem("Poin", localUser.Poin);
        
        updateSaldoDisplay();
      }
    });
}

function updateHomeDisplay() {
    const userNameEl = document.getElementById('userNameDisplay');
    const SaldoEl = document.getElementById('SaldoAmountDisplay');
    const welcomeEl = document.querySelector('.welcome');
    const isLoggedIn = !!localUser.ID;
    
    const navHome = document.getElementById('nav-home');
    const navLeaderboard = document.getElementById('nav-leaderboard');
    const navDokumen = document.getElementById('nav-dokumen');
    
    if (navHome) navHome.classList.add('active');
    if (navLeaderboard) navLeaderboard.classList.remove('active');
    if (navDokumen) navDokumen.classList.remove('active');

    if (!userNameEl || !SaldoEl || !welcomeEl) return;
    
    
    welcomeEl.textContent = 'Nasuka Foods'; 

    if (isLoggedIn) {
        const displayName = localUser.Nama ? localUser.Nama.split(' ')[0] : localUser.Username || 'Pengguna';
        
        
        userNameEl.textContent = displayName;
        
        
        SaldoEl.textContent = 'Rp ' + (localUser.Saldo || 0).toLocaleString('id-ID'); 
        
    } else {
     
        
        SaldoEl.textContent = "Rp 0"; 
    }
}

function updateSaldoDisplay() {
    updateHomeDisplay();
}


function initializeHome() {
  initializeUserProfile();
  updateHomeDisplay();
  
  const runningTextEl = document.getElementById('running-text');
  if (runningTextEl) {
    const marqueeEl = document.createElement('marquee');
    marqueeEl.setAttribute('behavior', 'scroll');
    marqueeEl.setAttribute('direction', 'left');
    marqueeEl.setAttribute('scrollamount', '8'); 
    marqueeEl.textContent = '';
    
    runningTextEl.parentNode.replaceChild(marqueeEl, runningTextEl);
  }
}

function initializeUserProfile() {
  const userID = localStorage.getItem("ID") || "";
  const profilLink = document.getElementById("Profil");
  
  
  if (!userID) {
    if (profilLink) {
      profilLink.href = "#";
      profilLink.onclick = () => { if (!localStorage.getItem('ID')) showLogin(); else showProfil(); };
    }
    return;
  }
  
  if (profilLink) {
    profilLink.href = "#";
    profilLink.onclick = showProfil;
  }

  if (!localUser.Nama) {
      fetchUserProfileFromDB(userID);
  } else {
      updateProfileDisplay(localUser.Nama, localUser.Foto, userID);
  }
}

function updateProfileDisplay(nama, foto, userID) {
  const profilLink = document.getElementById("Profil");
  if (profilLink) {
    profilLink.onclick = showProfil;
  }
  updateHomeDisplay();
}

function fetchUserProfileFromDB(userID) {
  db.ref(`users/${userID}`).once("value").then(snapshot => {
    const val = snapshot.val();
    if (val) {
      const nama = val.Nama || "Tanpa Nama";
      const foto = val.Foto || "https://nasukafoods.site/gambarkosong.jpg"; 
      
      localUser.Nama = nama;
      localUser.Foto = foto;
      localUser.Alamat = val.Alamat || "Alamat belum diatur";
      localUser.NomorHP = val.NomorHP || "Nomor HP belum diatur";
      localUser.Saldo = val.Saldo || 0;
      localUser.TotalPengeluaran = val.TotalPengeluaran || 0; 
      localUser.Poin = val.Poin || 0;
      
      localStorage.setItem("Nama", nama);
      localStorage.setItem("Foto", foto);
      localStorage.setItem("Alamat", localUser.Alamat);
      localStorage.setItem("NomorHP", localUser.NomorHP);
      localStorage.setItem("Saldo", localUser.Saldo);
      localStorage.setItem("TotalPengeluaran", localUser.TotalPengeluaran); 
      localStorage.setItem("Poin", localUser.Poin);

      updateProfileDisplay(nama, foto, userID);
    } else {
      localUser.ID = null;
      localStorage.clear();
      updateHomeDisplay(); 
    }
  }).catch(error => {
      console.error("Error fetching user profile:", error);
      updateHomeDisplay();
  });
}



function hideAllContainers() {
    
    document.querySelectorAll('#home-container, #login-container, #signup-container, #profil-container, #payment-container, #editprofil-container, #receipt-popup, #video-container, #download-container, #leaderboard-container, #formal-confirmation-modal, #dokumen-container, #free-shipping-container, #produk-detail-container').forEach(el => { 
        if (el) el.style.display = 'none';
    });
}



function showHome() {
    hideAllContainers();
    const homeContainer = document.getElementById('home-container');
    if (homeContainer) {
        homeContainer.style.display = 'block';
        initializeHome();
    }
    
    document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const navHome = document.getElementById('nav-home');
    if (navHome) navHome.classList.add('active');
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

function showDownload() {
    hideAllContainers();
    const downloadContainer = document.getElementById('download-container');
    if (downloadContainer) {
        downloadContainer.style.display = 'block'; 
        downloadContainer.scrollTop = 0; 
    }
}


function showDokumen() {
    hideAllContainers();
    const dokumenContainer = document.getElementById('dokumen-container');
    
    if (dokumenContainer) {
        dokumenContainer.style.display = 'flex';
        dokumenContainer.scrollTop = 0; 
    }
    
    document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const navDokumen = document.getElementById('nav-dokumen');
    if(navDokumen) navDokumen.classList.add('active');
}



function showLeaderboard() {
    hideAllContainers();
    const leaderboardContainer = document.getElementById('leaderboard-container');
    
    if (leaderboardContainer) {
        leaderboardContainer.style.display = 'flex';
        leaderboardContainer.scrollTop = 0;
    }
    
    document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const navLeaderboard = document.getElementById('nav-leaderboard');
    if (navLeaderboard) navLeaderboard.classList.add('active');

    const leaderboardListEl = document.getElementById('leaderboard-list');
    if (!leaderboardListEl) return;

    
    const contentSection = document.querySelector('.leaderboard-content-section');
    if (contentSection) {
        
        let staticHeader = contentSection.querySelector('div[style*="background-color: white"]');
        if (staticHeader) {
            contentSection.removeChild(staticHeader);
        }
    }


    leaderboardListEl.innerHTML = '<p style="text-align: center; color: #007bff;"><i class="fas fa-spinner fa-spin"></i> Memuat List Leaderboard ..</p>';
    
    const userID = localUser.ID;
    
    
    const leaderboardHeaderContent = `
        <div style="background-color: white; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);">
            <img src="https://nasukafoods.site/wingbiru.gif" alt="" style="width: 50px; height: 50px; margin-bottom: 10px;">
           
            <p class="blinking-glowing-text">Best Customers</p>
            <p id="rank-one-display" style="font-size: 24px; font-weight: 800; color: #f44336; margin: 5px 0;">
                <i class="fas fa-gem" style="margin-right: 5px;"></i> Memuat Juara...
            </p>
            <p>---------</p>
        </div>
    `;
    
    
    $(leaderboardHeaderContent).insertBefore(leaderboardListEl);
    
    const rankOneDisplayEl = document.getElementById('rank-one-display');


    db.ref("users").orderByChild("Poin").limitToLast(10).once("value")
        .then(top10Snapshot => {
            let top10Users = [];
            top10Snapshot.forEach(childSnapshot => {
                top10Users.push({
                    ID: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });

            
            top10Users.reverse(); 

            let listHTML = '';
            let isUserInTop10 = false;
            
            
            if (top10Users.length > 0) {
                const rankOneUser = top10Users[0];
                const rankOneName = rankOneUser.Nama || rankOneUser.Username || 'Pengguna Anonim';
                
                if (rankOneDisplayEl) {
                    rankOneDisplayEl.innerHTML = `<i class="fas fa-crown" style="color: #ffc107; margin-right: 5px;"></i> ${rankOneName} <i class="fas fa-crown" style="color: #ffc107; margin-left: 5px;"></i>`;
                }
            } else if (rankOneDisplayEl) {
                 rankOneDisplayEl.textContent = 'Belum Ada Data Poin';
            }
            
            
            
            top10Users.forEach((user, index) => {
                const rank = index + 1;
                const isMe = userID && user.ID === userID;
                
                if (isMe) {
                    isUserInTop10 = true;
                }
                
                const displayName = user.Nama || user.Username || 'Pengguna Anonim';
                
                
                const scoreDisplay = `${(user.Poin || 0).toLocaleString('id-ID')} Poin`;
                
                listHTML += `
                    <div class="leaderboard-item" style="${isMe ? 'border: 2px solid #007bff; background-color: #e6f7ff;' : ''}">
                        <span class="leaderboard-rank">${rank}</span>
                        <span class="leaderboard-name" style="${isMe ? 'font-weight: 700; color: #007bff;' : ''}">${displayName} ${isMe ? '(Anda)' : ''}</span>
                        <span class="leaderboard-score" style="color: #ff9800;">${scoreDisplay}</span>
                    </div>
                `;
            });

            if (top10Users.length > 0) {
                leaderboardListEl.innerHTML = listHTML;
            } else {
                 leaderboardListEl.innerHTML = '<p style="text-align: center; color: #666; margin-top: 20px;">Belum ada data Leaderboard.</p>';
            }
            
            
            if (userID && !isUserInTop10) {
                
                const userPoin = localUser.Poin || 0;
                
                
                db.ref("users").orderByChild("Poin").startAt(userPoin + 1).once("value")
                    .then(rankSnapshot => {
                        let rank = 1;
                        rankSnapshot.forEach(childSnapshot => {
                            rank++;
                        });
                        
                        const rankAndaHTML = `
                            <div style="margin-top: 20px; padding: 15px; border: 2px solid #ff9800; background-color: #fff3e0; border-radius: 8px; text-align: center;">
                                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #ff9800;">🏆 Dominasi Sultan<p>Peringkat Anda :</p>
                                <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: 700; color: #333;">${rank}</p>
                                <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Total Poin: ${userPoin.toLocaleString('id-ID')}</p>
                            </div>
                        `;
                        leaderboardListEl.innerHTML += rankAndaHTML;
                    })
                    .catch(error => {
                        console.error("Gagal mengambil peringkat pengguna:", error);
                        leaderboardListEl.innerHTML += `<p style="text-align: center; color: red; margin-top: 10px;">Gagal mengambil peringkat Anda.</p>`;
                    });
            } else if (!userID) {
                leaderboardListEl.innerHTML += `<p style="text-align: center; color: #666; margin-top: 10px;">Silakan login untuk melihat peringkat Anda.</p>`;
            }

        })
        .catch(error => {
            console.error("Gagal memuat Leaderboard:", error);
            leaderboardListEl.innerHTML = `<p style="text-align: center; color: red; margin-top: 20px;">Gagal memuat Leaderboard: ${error.message}</p>`;
        });
}


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
                    localStorage.setItem("Nama", user.Nama || 'Tanpa Nama');
                    localStorage.setItem("Saldo", user.Saldo || 0);
                    localStorage.setItem("Foto", user.Foto || "https://nasukafoods.site/gambarkosong.jpg"); 
                    localStorage.setItem("Alamat", user.Alamat || "Alamat belum diatur");
                    localStorage.setItem("NomorHP", user.NomorHP || "Nomor HP belum diatur");
                    localStorage.setItem("TanggalJoin", user.TanggalJoin || new Date().toISOString());
                    localStorage.setItem("TotalPengeluaran", user.TotalPengeluaran || 0);
                    localStorage.setItem("Poin", user.Poin || 0);

                    localUser.ID = user.ID;
                    localUser.Username = user.Username;
                    localUser.Nama = user.Nama || 'Tanpa Nama';
                    localUser.Saldo = user.Saldo || 0;
                    localUser.Foto = user.Foto || "https://nasukafoods.site/gambarkosong.jpg"; 
                    localUser.Alamat = user.Alamat || "Alamat belum diatur";
                    localUser.NomorHP = user.NomorHP || "Nomor HP belum diatur";
                    localUser.TotalPengeluaran = user.TotalPengeluaran || 0; 
                    localUser.Poin = user.Poin || 0;
                    
                    statusDiv.innerHTML = 'Lading...';
                    statusDiv.classList.add('success');
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
    
    
    const generateRandomNumber = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    
    const newID = "NASUKA" + generateRandomNumber(); 
    
    
    db.ref("users").orderByChild("Username").equalTo(username).once("value")
        .then(snapshot => {
            if (snapshot.exists()) {
                statusDiv.innerHTML = 'Username sudah digunakan. Silakan pilih yang lain.';
                statusDiv.classList.add('error');
            } else {
                
                const newUser = {
                    ID: newID, 
                    Username: username,
                    Nama: nama,
                    Password: password,
                    Saldo: 1,
                    Foto: "https://nasukafoods.site/gambarkosong.jpg", 
                    Jenis: "Member",
                    Alamat: "Alamat belum diatur",
                    NomorHP: "Nomor HP belum diatur",
                    TanggalJoin: new Date().toISOString(),
                    TotalPengeluaran: 0, 
                    Poin: 0,
                };
                
                
                db.ref(`users/${newID}`).set(newUser)
                    .then(() => {
                        localStorage.setItem("ID", newUser.ID);
                        localStorage.setItem("Username", newUser.Username);
                        localStorage.setItem("Nama", newUser.Nama);
                        localStorage.setItem("Saldo", newUser.Saldo);
                        localStorage.setItem("Foto", newUser.Foto);
                        localStorage.setItem("Alamat", newUser.Alamat);
                        localStorage.setItem("NomorHP", newUser.NomorHP);
                        localStorage.setItem("TanggalJoin", newUser.TanggalJoin);
                        localStorage.setItem("TotalPengeluaran", newUser.TotalPengeluaran); 
                        localStorage.setItem("Poin", newUser.Poin);
                        
                        localUser.ID = newUser.ID;
                        localUser.Username = newUser.Username;
                        localUser.Nama = newUser.Nama;
                        localUser.Saldo = newUser.Saldo;
                        localUser.Foto = newUser.Foto;
                        localUser.Alamat = newUser.Alamat;
                        localUser.NomorHP = newUser.NomorHP;
                        localUser.TotalPengeluaran = newUser.TotalPengeluaran; 
                        localUser.Poin = newUser.Poin;
                        
                        statusDiv.innerHTML = 'Pendaftaran Berhasil! Anda mendapatkan Saldo gratis 1 Rupiah';
                        statusDiv.classList.add('success');
                        setTimeout(showHome, 1500);
                    })
                    .catch(error => {
                        statusDiv.innerHTML = 'Gagal mendaftar. Silakan coba lagi.';
                        statusDiv.classList.add('error');
                    });
            }
        })
        .catch(error => {
            statusDiv.innerHTML = 'Terjadi kesalahan sistem. Silakan coba lagi.';
            statusDiv.classList.add('error');
        });
}

function logoutUser() {
    if (confirm("Anda yakin ingin keluar?")) {
        localStorage.clear(); 
        
        localUser.ID = null;
        localUser.Username = null;
        localUser.Nama = null;
        localUser.Saldo = 0;
        localUser.Alamat = "Alamat belum diatur";
        localUser.NomorHP = "Nomor HP belum diatur";
        localUser.Foto = "https://nasukafoods.site/gambarkosong.jpg"; 
        localUser.TotalPengeluaran = 0;
        localUser.Poin = 0;
        
        alert("Anda telah keluar.");
        showHome();
    }
}

function showProfil() {
    hideAllContainers();
    const userID = localStorage.getItem("ID");
    if (!userID) {
        alert("Silahkan login terlebih dahulu.");
        showLogin();
        return;
    }
    
    const profilContainer = document.getElementById('profil-container');
    profilContainer.style.display = 'block'; 
    
    document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const navAkun = document.querySelector('.bottom-nav').lastElementChild;
    if(navAkun) navAkun.classList.add('active');


    const renderProfil = () => {
        const nama = localUser.Nama || 'Nama belum diatur';
        const foto = localUser.Foto || "https://nasukafoods.site/gambarkosong.jpg"; 
        const Saldo = 'Rp ' + (localUser.Saldo || 0).toLocaleString('id-ID');
        
        const Poin = (localUser.Poin || 0).toLocaleString('id-ID') + ' Poin';
        
        const tanggalJoinISO = localStorage.getItem("TanggalJoin") || new Date().toISOString();
        const tanggalObj = new Date(tanggalJoinISO);
        const bulanJoin = tanggalObj.toLocaleString('id-ID', { month: 'short', year: 'numeric' });
        
        const displayNomorHP = localUser.NomorHP || 'Nomor HP belum diatur'; 
        
        
        document.getElementById('profilFoto').src = foto;
        document.getElementById('profilNamaDriver').textContent = nama;
        document.getElementById('profilBulanJoin').textContent = bulanJoin;
        
        
        document.getElementById('profilIDPlat').textContent = 'Nomor HP: ' + displayNomorHP; 
        
        
        document.getElementById('profilSaldoDisplay').textContent = Saldo; 
        
        const profilPoinDisplayEl = document.getElementById('profilPoinDisplay');
        if (profilPoinDisplayEl) {
            profilPoinDisplayEl.textContent = Poin;
        }
        
        const alamatPengirimanEl = document.getElementById('profilAlamatPengiriman');
        if (alamatPengirimanEl) {
            alamatPengirimanEl.textContent = localUser.Alamat || "Alamat belum diatur";
        }
        
        const safetyReport = document.querySelector('.safety-report');
        if (safetyReport) {
             safetyReport.onclick = showHistory;
        }

        // START: PERUBAHAN FOKUS KE DONATUR
        document.getElementById('profilRatingScore').textContent = ''; // Ubah teks utama
        
        // Ganti elemen-elemen rating bintang dengan daftar kontributor statis
        const contributorListEl = document.getElementById('contributor-list');
        if (contributorListEl) {
            contributorListEl.innerHTML = `
                <div class="contributor-rating-row">
                    <span class="contributor-name">Doni Prasetyo</span>
                    <span class="contributor-donation">Rp 50.000</span>
                </div>
                <div class="contributor-rating-row">
                    <span class="contributor-name">Siti Fatimah</span>
                    <span class="contributor-donation">Rp 30.000</span>
                </div>
                <div class="contributor-rating-row">
                    <span class="contributor-name">Budi Hartono</span>
                    <span class="contributor-donation">Rp 20.000</span>
                </div>
                <div class="contributor-rating-row">
                    <span class="contributor-name">Aulia Zahra</span>
                    <span class="contributor-donation">Rp 15.000</span>
                </div>
                <div class="contributor-rating-row">
                    <span class="contributor-name">Fajar Gemilang</span>
                    <span class="contributor-donation">Rp 10.000</span>
                </div>
                
            `;
        }

        // Tambahkan event listener untuk tautan Kontributor
        const ratingLabelEl = document.querySelector('.rating-label a');
        if (ratingLabelEl) {
            ratingLabelEl.href = 'https://nasukafoods.site/kontributor-saldo-publik.html';
        }
        // END: PERUBAHAN FOKUS KE DONATUR
        
        updateHomeDisplay();
    };
    
    renderProfil(); 
    
    const tabPencapaian = document.getElementById('tabPencapaian');
    const tabPerbaikan = document.getElementById('tabPerbaikan');
    const contentPencapaian = document.getElementById('contentPencapaian');
    const contentPerbaikan = document.getElementById('contentPerbaikan');
    
    const switchTab = (activeTab) => {
        tabPencapaian.classList.remove('active');
        tabPerbaikan.classList.remove('active');
        contentPencapaian.style.display = 'none';
        contentPerbaikan.style.display = 'none';

        if (activeTab === 'pencapaian') {
            tabPencapaian.classList.add('active');
            contentPencapaian.style.display = 'block';
             if (contentPencapaian.querySelector('#history-list')) {
                contentPencapaian.innerHTML = `
                    <div class="badge-section">
                        <h4>Informasi</h4>
                        <div class="badge-card">
                            <img src="https://nasukafoods.site/sayapunggu.gif" alt="Lencana" class="badge-image">
                            <div class="badge-text">
                                <strong>Alamat pengiriman</strong>
                                <span id="profilAlamatPengiriman">${localUser.Alamat || "Alamat belum diatur"}</span>
                            </div>
                        </div>
                    </div>
                    <div class="passenger-comments">
                        <h4>Apa Kata Anda</h4>
                        <img src="https://nasukafoods.site/pitasebar.gif" alt="Mencari Komentar" class="magnifying-glass">
                        <p style="text-align: center; color: #666; margin-top: 10px;">Belum ada kata kata untuk ditampilkan</p>
                    </div>
                `;
            }
        } else {
            tabPerbaikan.classList.add('active');
            contentPerbaikan.style.display = 'block';
        }
    };
    
    tabPencapaian.onclick = () => switchTab('pencapaian');
    tabPerbaikan.onclick = () => switchTab('perbaikan');
    
    switchTab('pencapaian');
}





function showHistory() {
    const contentPencapaian = document.getElementById('contentPencapaian');
    
    
    document.getElementById('tabPencapaian').classList.add('active');
    document.getElementById('tabPerbaikan').classList.remove('active');

    
    contentPencapaian.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <h4 style="margin-top: 0; color: #333; font-size: 16px; font-weight: 600;">Riwayat Pembelian</h4>
            <div id="history-list" style="margin-top: 15px; background-color: white; padding: 10px; border-radius: 8px;">
                <p style="color: #007bff;"><i class="fas fa-spinner fa-spin"></i> Memuat riwayat...</p>
            </div>
            <button onclick="showProfil()" style="margin-top: 20px; padding: 10px 20px; background-color: #f44336; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">
                Kembali ke Profil
            </button>
        </div>
    `;
    
    
    db.ref(`transactions/${localUser.ID}`).orderByChild('timestamp').limitToLast(20).once('value')
        .then(snapshot => {
            const historyListEl = document.getElementById('history-list');
            historyListEl.innerHTML = ''; 
            const transactions = [];
            snapshot.forEach(childSnapshot => {
                transactions.push(childSnapshot.val());
            });
            
            if (transactions.length === 0) {
                historyListEl.innerHTML = '<p style="color: #666; font-style: italic;">Belum ada riwayat pembelian.</p>';
                return;
            }

            transactions.reverse();

            transactions.forEach(tx => {
                const date = new Date(tx.timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
                const txItem = document.createElement('div');
                txItem.style.cssText = `
                    padding: 10px 0;
                    border-bottom: 1px solid #eee;
                    text-align: left;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: background-color 0.1s;
                `;
                txItem.onmouseover = function() { this.style.backgroundColor = '#f9f9f9'; };
                txItem.onmouseout = function() { this.style.backgroundColor = 'white'; };
                
                
                txItem.onclick = () => {
                    alert("Fungsi melihat detail resi telah dihapus.");
                };
                
                
                const pointsDisplay = tx.pointsEarned ? `<span style="font-size: 12px; color: #ff9800; margin-left: 10px;">(+${tx.pointsEarned} Poin)</span>` : '';

                txItem.innerHTML = `
                    <div>
                        <strong style="color: ${tx.status === 'Success' ? '#28a745' : '#f44336'};">${tx.productName}</strong><br>
                        <span style="font-size: 12px; color: #666;">${date} | ID: ${tx.transactionID.substring(0, 8)}...</span><br>
                        <span style="font-size: 14px; font-weight: 500;">Total: -Rp ${tx.amount.toLocaleString('id-ID')} ${pointsDisplay}</span>
                    </div>
                    <i class="fas fa-chevron-right" style="font-size: 12px; color: #999;"></i>
                `;
                historyListEl.appendChild(txItem);
            });
        })
        .catch(error => {
            document.getElementById('history-list').innerHTML = `<p style="color: red;">Gagal memuat riwayat: ${error.message}</p>`;
        });
}


function showEditProfil() {
    hideAllContainers();
    const editContainer = document.getElementById('editprofil-container');
    editContainer.style.display = 'flex'; 

    const currentUsername = localUser.Username || '';
    const currentNama = localUser.Nama || '';
    const currentNomorHP = localUser.NomorHP === 'Nomor HP belum diatur' ? '' : localUser.NomorHP; 
    const currentAlamat = localUser.Alamat === 'Alamat belum diatur' ? '' : localUser.Alamat; 
    const currentFoto = localUser.Foto || "https://nasukafoods.site/gambarkosong.jpg"; 
    
    editContainer.style.position = 'fixed';
    editContainer.style.top = '0';
    editContainer.style.left = '0';
    editContainer.style.width = '100%';
    editContainer.style.height = '100%';
    editContainer.style.zIndex = '200003';
    editContainer.style.padding = '0';
    editContainer.style.backgroundColor = '#f0f2f5'; 
    editContainer.style.alignItems = 'flex-start'; 
    editContainer.style.overflowY = 'auto'; 

    editContainer.innerHTML = `
        <div class="auth-card">
            
            <div class="edit-header-nav">
                <i class="fas fa-arrow-left" onclick="showProfil()"></i>
                <h3>Edit Profil</h3>
                <i class="fas fa-question-circle"></i>
            </div>
            
            <div class="edit-profile-photo-section">
                <img id="editFotoProfil" class="edit-profile-photo" src="${currentFoto}" alt="Foto Profil">
                <div class="change-photo-text" onclick="alert('Fitur ganti foto belum tersedia.')">Ubah foto profil</div>
            </div>

            <form id="editProfilForm">
                <div class="edit-form-section">
                    <h4>Informasi Kontak & Pengiriman</h4>
                    
                    
                   
                    
                    <div class="form-group">
                        <label for="editNama">Nama Lengkap</label>
                        <input type="text" id="editNama" placeholder="Nama Lengkap" value="${currentNama}" required>
                    </div>
                        <div class="form-group">
                        <label for="editNomorHP">Nomor HP</label>
                        <input type="text" id="editNomorHP" placeholder="Nomor HP" value="${currentNomorHP}" required>
                    </div>
                     <div class="form-group">
                        <label for="editAlamat">Alamat Pengiriman</label>
                        <textarea id="editAlamat" placeholder="Alamat Pengiriman" rows="3" required>${currentAlamat}</textarea>
                    </div>
                    
                  
                    
                </div>

                <div class="edit-form-section">
                    <h4>Informasi Akun</h4>
                   
                      
                    <div class="form-group">
                        <label for="editUsername">Username</label>
                        <input type="text" id="editUsername" placeholder="Username" value="${currentUsername}" required>
                    </div>
                    
                       <div class="form-group">
                        <label for="editPassword">Password Baru (Kosongkan jika tidak ingin ganti)</label>
                        <input type="password" id="editPassword" placeholder="Password Baru">
                    </div>
                    
                    
                </div>






                <button type="submit">Simpan Perubahan</button>
                <div id="editStatus" class="auth-status" style="margin-bottom: 10px; margin-top: 0;"></div>
            </form>
            
            <div class="edit-footer-buttons" style="padding-bottom: 20px;">
                <button onclick="showProfil()" class="btn-batal">Batal</button>
               
            </div>
        </div>
    `;
    document.getElementById('editProfilForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateProfile();
    });
}

function updateProfile() {
    const userID = localUser.ID;
    const newUsername = document.getElementById('editUsername').value.trim();
    const nama = document.getElementById('editNama').value.trim();
    const nomorHP = document.getElementById('editNomorHP').value.trim();
    const alamat = document.getElementById('editAlamat').value.trim();
    const password = document.getElementById('editPassword').value.trim();
    const statusDiv = document.getElementById('editStatus');
    statusDiv.className = 'auth-status';
    statusDiv.innerHTML = 'Menyimpan...';
    
    if (!newUsername || !nama || !nomorHP || !alamat) {
        statusDiv.innerHTML = 'Username, Nama, Nomor HP, dan Alamat wajib diisi.';
        statusDiv.classList.add('error');
        return;
    }
    if (newUsername.length < 5) {
        statusDiv.innerHTML = 'Username minimal 5 karakter.';
        statusDiv.classList.add('error');
        return;
    }
    if (password && password.length < 5) {
        statusDiv.innerHTML = 'Password minimal 5 karakter.';
        statusDiv.classList.add('error');
        return;
    }

    const updates = {
        Nama: nama,
        NomorHP: nomorHP,
        Alamat: alamat
    };
    if (password) {
        updates.Password = password;
    }

    const processUpdate = () => {
        db.ref(`users/${userID}`).update(updates)
            .then(() => {
                localUser.Username = newUsername;
                localUser.Nama = nama;
                localUser.NomorHP = nomorHP;
                localUser.Alamat = alamat;
                localStorage.setItem("Username", newUsername);
                localStorage.setItem("Nama", nama);
                localStorage.setItem("NomorHP", nomorHP);
                localStorage.setItem("Alamat", alamat);
                
                statusDiv.innerHTML = 'Profil berhasil diperbarui!';
                statusDiv.classList.add('success');
                updateProfileDisplay(localUser.Nama, localUser.Foto, localUser.ID);
                setTimeout(showProfil, 1500);
            })
            .catch(error => {
                statusDiv.innerHTML = 'Gagal memperbarui profil. Silakan coba lagi.';
                statusDiv.classList.add('error');
            });
    };

    if (newUsername !== localUser.Username) {
        db.ref("users").orderByChild("Username").equalTo(newUsername).once("value")
            .then(snapshot => {
                let isTaken = false;
                snapshot.forEach(child => {
                    if (child.val().ID !== userID) {
                        isTaken = true;
                    }
                });
                if (isTaken) {
                    statusDiv.innerHTML = 'Username sudah digunakan oleh pengguna lain. Silakan pilih yang lain.';
                    statusDiv.classList.add('error');
                } else {
                    updates.Username = newUsername;
                    processUpdate();
                }
            })
            .catch(error => {
                statusDiv.innerHTML = 'Terjadi kesalahan saat memeriksa username.';
                statusDiv.classList.add('error');
            });
    } else {
        processUpdate();
    }
}


function logPurchaseToDB(productName, amount, newSaldo, pointsEarned) {
    const userID = localUser.ID;
    if (!userID) return; 

    const transactionRef = db.ref(`transactions/${userID}`).push();
    const transactionID = transactionRef.key;
    const timestamp = new Date().toISOString();
    
    const transactionData = {
        transactionID: transactionID,
        userID: userID,
        productName: productName,
        amount: amount,
        timestamp: timestamp,
        status: 'Success',
        initialSaldo: localUser.Saldo + amount, 
        finalSaldo: newSaldo,
        deliveryAddress: localUser.Alamat,
        deliveryContact: localUser.NomorHP,
        totalPengeluaranSaatIni: localUser.TotalPengeluaran,
        pointsEarned: pointsEarned
    };

    transactionRef.set(transactionData)
        .then(() => {
            console.log("Transaction logged successfully with ID:", transactionID);
        })
        .catch(error => {
            console.error("Failed to log transaction:", error);
        });
        
    return transactionData;
}


document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    loginUser();
});
document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    signupUser();
});


// DATA PRODUK BARU
const productData = {
    polosan: {
        name: 'Cilok Polosan Premium',
        price: 'Rp 500',
        image: 'https://nasukafoods.site/paketcilok.jpg',
        article: `
            <h4>Deskripsi Produk: Kesederhanaan Rasa Premium</h4>
            <p><strong>Cilok Polosan Premium</strong> dari Nasuka Foods menawarkan cita rasa otentik yang tak tertandingi. Dibuat dari tepung tapioka pilihan dengan komposisi yang presisi, menghasilkan tekstur yang <strong>kenyal, lembut, dan tidak alot</strong>.</p>
            <p>Produk ini sangat cocok bagi Anda yang menyukai Cilok murni, tanpa isian, dan ingin menikmati kelezatan bumbu kacang atau sambal goang Nasuka Foods secara maksimal. Ideal juga sebagai base untuk kreasi Cilok rumahan Anda.</p>
            <h4>Informasi Nilai Jual:</h4>
            <ul>
                <li><strong>Tekstur Sempurna:</strong> Kenyal, lembut, dan empuk.</li>
                <li><strong>Rasa Otentik:</strong> Kekuatan rasa aci dan bumbu yang gurih.</li>
                <li><strong>Serbaguna:</strong> Cocok disajikan dengan berbagai saus.</li>
            </ul>
        `
    },
    gajih: {
        name: 'Cilok Isian Gajih Sapi Pilihan',
        price: 'Rp 1.000',
        image: 'https://nasukafoods.site/isiangajih.jpg',
        article: `
            <h4>Deskripsi Produk: Kekayaan Rasa Gurih Alami</h4>
            <p>Rasakan sensasi Cilok yang ditingkatkan dengan <strong>Isian Gajih Sapi Pilihan</strong>. Kami menggunakan gajih sapi kualitas terbaik yang telah diolah dan dibumbui secara khusus, menciptakan isian yang <strong>meleleh di mulut</strong> dengan aroma dan rasa gurih yang mendalam.</p>
            <p>Kombinasi tekstur Cilok yang kenyal dengan ledakan rasa gajih yang kaya membuat produk ini menjadi favorit bagi penggemar rasa autentik dan "nendang". Produk ini menjanjikan pengalaman kuliner Cilok yang lebih mewah.</p>
            <h4>Informasi Nilai Jual:</h4>
            <ul>
                <li><strong>Isian Premium:</strong> Menggunakan gajih sapi kualitas tinggi.</li>
                <li><strong>Gurih Maksimal:</strong> Rasa kaldu dan gajih yang kuat.</li>
                <li><strong>Pengalaman Rasa Unik:</strong> Meleleh dan kaya rasa.</li>
            </ul>
        `
    },
    telorPuyuh: {
        name: 'Cilok Isi Telor Puyuh Spesial',
        price: 'Rp 2.000',
        image: 'https://nasukafoods.site/isitelorpuyuh.jpg',
        article: `
            <h4>Deskripsi Produk: Kejutan Lezat di Setiap Gigitan</h4>
            <p><strong>Cilok Isi Telor Puyuh Spesial</strong> hadir sebagai pilihan Cilok yang mengenyangkan sekaligus memanjakan lidah. Setiap butir Cilok diisi dengan <strong>telur puyuh utuh</strong>, menawarkan kejutan protein yang lezat.</p>
            <p>Produk ini merupakan pilihan cerdas untuk camilan bernutrisi atau pendamping hidangan utama. Kualitas Cilok yang kenyal berpadu sempurna dengan kelembutan telur puyuh yang sudah dibumbui, menjadikannya pilihan favorit keluarga.</p>
            <h4>Informasi Nilai Jual:</h4>
            <ul>
                <li><strong>Isian Nutrisi:</strong> Telur puyuh utuh yang kaya protein.</li>
                <li><strong>Porsi Mengenyangkan:</strong> Ideal sebagai camilan utama.</li>
                <li><strong>Kualitas Terjamin:</strong> Telur puyuh segar dan Cilok yang empuk.</li>
            </ul>
        `
    },
    telorAyam: {
        name: 'Cilok Isi Telor Ayam Premium',
        price: 'Rp 5.000',
        image: 'https://nasukafoods.site/isitelorayam.jpg',
        article: `
            <h4>Deskripsi Produk: Pilihan Eksklusif Penuh Rasa</h4>
            <p>Nikmati <strong>Cilok Isi Telor Ayam Premium</strong>, varian Cilok eksklusif dengan isian <strong>potongan telur ayam rebus</strong> yang melimpah dan gurih. Telur ayam memberikan tekstur yang lebih padat dan rasa umami yang lebih kuat pada isian Cilok.</p>
            <p>Produk ini disiapkan dengan standar kebersihan tertinggi dan bumbu rahasia Nasuka Foods, menjamin kualitas rasa dan keamanan pangan. Pilihan sempurna bagi Anda yang menginginkan Cilok dengan isian berkelas dan porsi yang memuaskan.</p>
            <h4>Informasi Nilai Jual:</h4>
            <ul>
                <li><strong>Isian Melimpah:</strong> Potongan telur ayam rebus premium.</li>
                <li><strong>Rasa Umami Kuat:</strong> Cita rasa gurih yang elegan.</li>
                <li><strong>Standar Kebersihan:</strong> Diproduksi dengan protokol pangan yang ketat.</li>
            </ul>
        `
    }
};

/**
 * Menampilkan detail produk berdasarkan ID.
 * @param {string} produkID - ID produk (polosan, gajih, telorPuyuh, telorAyam).
 */
function showProduk(produkID) {
    hideAllContainers(); 

    const produk = productData[produkID];
    const produkContainer = document.getElementById('produk-detail-container');
    
    if (!produk || !produkContainer) {
        alert('Produk tidak ditemukan atau container belum siap.');
        showHome();
        return;
    }

    // Update elemen-elemen detail produk
    document.getElementById('produk-title').textContent = produk.name;
    document.getElementById('produk-name').textContent = produk.name;
    document.getElementById('produk-price').textContent = produk.price;
    document.getElementById('produk-image').src = produk.image;
    document.getElementById('produk-article-container').innerHTML = produk.article;
    
    
    const btnBeliSekarang = document.getElementById('btn-beli-sekarang');
    if (btnBeliSekarang) {
        // Hapus event listener lama
        btnBeliSekarang.onclick = null; 
        
         
        btnBeliSekarang.onclick = function() {
            window.location.href = 'https://nasukafoods.site/belanja.html';
        };
    }
    // --- END PERUBAHAN UNTUK MENGARAHKAN KE SERLOK.HTML ---

    produkContainer.style.display = 'flex';
    produkContainer.scrollTop = 0; 
}


$(document).ready(function() {
    showHome(); 
});


function showTopUp() {
    hideAllContainers();
    
    const topupContainer = document.getElementById('dokumen-container');
    
    if (topupContainer) {
        topupContainer.style.display = 'flex';
        topupContainer.scrollTop = 0;
        
        const headerTitle = topupContainer.querySelector('.dokumen-header h3');
        if(headerTitle) headerTitle.textContent = 'Isi Saldo';

        const contentSection = topupContainer.querySelector('.dokumen-content-section');
        
        const waBase = "https://wa.me/62859109819017";
        const msg = encodeURIComponent(`Halo Admin Nasuka Foods,\n\nSaya ingin Top Up Saldo.\n\nDetail Akun:\n- ID: ${localUser.ID || '-'}\n- Nama: ${localUser.Nama || '-'}\n\nMohon informasi instruksi pembayarannya.`);
        
        contentSection.innerHTML = `
            <div style="text-align: center; margin-bottom: 25px; padding: 20px 10px; background: linear-gradient(to bottom, #f0f7ff, #ffffff); border-radius: 15px;">
                <div style="margin: 0 auto 15px; width: 65px; height: 65px; line-height: 65px; font-size: 26px; background: #007bff; color: white; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,123,255,0.3);">
                    <i class="fas fa-wallet"></i>
                </div>
                <h3 style="margin: 0; color: #333; font-weight: 800; font-size: 20px;">Deposit</h3>
                <p style="font-size: 13px; color: #666; margin-top: 5px;">Silakan masukan kode voucher  di bawah ini</p>
            </div>

            <div style="background: #ffffff; border: 1px solid #e0e0e0; padding: 18px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <h4 style="margin: 0 0 12px 0; color: #333; font-size: 15px; display: flex; align-items: center;">
                    <i class="fas fa-ticket-alt" style="color: #ff9800; margin-right: 10px;"></i> 
                </h4>
                <div style="display: flex; gap: 8px;">
                    <input type="number" id="inputVoucher" placeholder="Masukkan kode voucher" 
                        oninput="if(this.value.length > 6) this.value = this.value.slice(0,6)"
                        style="flex: 1; padding: 12px; border: 2px solid #eee; border-radius: 8px; font-size: 16px; font-weight: bold; text-align: center; outline: none; transition: border-color 0.3s;">
                    <button onclick="prosesVoucher6Digit()" 
                        style="background: #333; color: white; border: none; padding: 0 15px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px;">
                        Ok
                    </button>
                </div>
                <div id="statusVoucher" style="margin-top: 10px; font-size: 12px; font-weight: 600; text-align: center;"></div>
            </div>

            <div style="background: #ffffff; border: 1px solid #e0e0e0; padding: 18px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <h4 style="margin: 0 0 10px 0; color: #333; font-size: 15px; display: flex; align-items: center;">
                    <i class="fas fa-university" style="color: #007bff; margin-right: 10px;"></i> Transfer Bank / E-Wallet
                </h4>
                <p style="font-size: 13px; color: #666; line-height: 1.5; margin-bottom: 15px;">
                    Isi saldo secara manual melalui konfirmasi Admin via WhatsApp. Kami mempermudah pembayaran voucher dengan QRIS yang support untuk semua bank dan eWallet
                </p>
                <a href="${waBase}?text=${msg}" target="_blank" style="display: flex; align-items: center; justify-content: center; background-color: #25d366; color: white; padding: 14px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px; transition: transform 0.2s active;">
                    <i class="fab fa-whatsapp" style="font-size: 20px; margin-right: 8px;"></i> Hubungi Admin Sekarang
                </a>
            </div>

            <div style="background: #fff8e1; border-left: 4px solid #ffc107; padding: 12px; border-radius: 4px;">
                <p style="font-size: 11px; color: #856404; margin: 0; line-height: 1.4;">
                    <strong>Catatan:</strong> Minimal pengisian saldo adalah <strong>Rp 1.000</strong>. Pastikan Anda mengirimkan bukti transfer yang jelas kepada Admin.
                </p>
            </div>
            
            <div style="height: 40px;"></div>
        `;

        // Menambahkan sedikit efek focus pada input voucher
        const inputVoucher = document.getElementById('inputVoucher');
        if (inputVoucher) {
            inputVoucher.addEventListener('focus', function() { this.style.borderColor = '#007bff'; });
            inputVoucher.addEventListener('blur', function() { this.style.borderColor = '#eee'; });
        }
    }
}














function prosesVoucher6Digit() {
    const kode = document.getElementById('inputVoucher').value;
    const statusDiv = document.getElementById('statusVoucher');
    const userID = localUser.ID;

    // Validasi Dasar
    if (!userID) { alert("Login dulu yuk!"); return; }
    if (kode.length !== 6) {
        statusDiv.innerHTML = "❌ Kode harus 6 digit angka!";
        statusDiv.style.color = "red";
        return;
    }

    statusDiv.innerHTML = "⏳ Menghubungkan ke server...";
    statusDiv.style.color = "#666";

    // 1. Cari kode di tabel 'vouchers'
    const vRef = db.ref(`vouchers/${kode}`);
    
    vRef.once('value').then(snapshot => {
        if (snapshot.exists()) {
            const nominal = snapshot.val();

            // 2. Gunakan transaction untuk mencegah dua orang klaim di detik yang sama
            // Kita hapus kodenya dulu, jika berhasil baru tambah saldo
            vRef.remove().then(() => {
                
                // 3. Update saldo user di database
                const userSaldoRef = db.ref(`users/${userID}/Saldo`);
                userSaldoRef.transaction((currentSaldo) => {
                    return (currentSaldo || 0) + nominal;
                }, (error, committed) => {
                    if (committed) {
                        // 4. Update tampilan lokal
                        localUser.Saldo += nominal;
                        localStorage.setItem("Saldo", localUser.Saldo);
                        updateSaldoDisplay();

                        statusDiv.innerHTML = `✅ Berhasil! Saldo Rp ${nominal.toLocaleString('id-ID')} telah ditambahkan.`;
                        statusDiv.style.color = "green";
                        document.getElementById('inputVoucher').value = "";
                    } else {
                        statusDiv.innerHTML = "❌ Gagal memperbarui saldo.";
                        statusDiv.style.color = "red";
                    }
                });
            }).catch(() => {
                statusDiv.innerHTML = "❌ Kode ini baru saja diklaim orang lain!";
                statusDiv.style.color = "red";
            });

        } else {
            statusDiv.innerHTML = "❌ Kode tidak ditemukan atau sudah hangus.";
            statusDiv.style.color = "red";
        }
    });
}
