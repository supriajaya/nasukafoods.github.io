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
          window.location.href = `inbox.html?id=${encodeURIComponent(id)}`;
        };
        container.appendChild(btn);
      });

      document.body.appendChild(container);
    }

   
    const ROLL_PER_REEL = 10;
    const REEL_RADIUS = 400;
    const SPIN_DURATION = 5;
    const MANUAL_SPIN_COOLDOWN = 4 * 400;

    const WIN_MULTIPLIERS = {
      'dua': 2,
      'tiga': 3,
      'empat': 4,
      'lima': 5,
      'jackpot': 10
    };

    const WIN_PROBABILITIES = {
      'dua': 0.1,
      'tiga': 0.03,
      'empat': 0.02,
      'lima': 0.0000000000000000000000000000000000000001,
      'jackpot': 0.00000000000000000000000000000000000000000000000000001
    };

    let currentSeeds = [0, 0, 0, 0, 0];
    let isSpinning = false;
    let lastManualSpinTime = 0;
    let currentmain = 0;
    let isAutomainEnabled = false;
    let playerWinStreak = 0;
    let playerLoseStreak = 0;
    const HOUSE_EDGE = 0;
    let totalPerakBurung = 0;

    function showErrorMessage(message) {
      $('#errorMessage').text(message).fadeIn().delay(3000).fadeOut();
    }

    function createROLL(ring) {
      const rollAngle = 360 / ROLL_PER_REEL;
      for (let i = 0; i < ROLL_PER_REEL; i++) {
        const roll = document.createElement('div');
        roll.className = 'roll backface-on';
        roll.style.transform = `rotateX(${rollAngle * i}deg) translateZ(${REEL_RADIUS}px)`;
        const p = document.createElement('p');
        p.textContent = i;
        roll.appendChild(p);
        ring.append(roll);
      }
    }

    function saveRollToDatabase(result, isManual = false) {
      console.log("Logging roll data has been disabled.");
    }

    function generateDua() {
      const num = Math.floor(Math.random() * 10);
      const result = [num, num];
      while (result.length < 5) {
        const uniqueNum = Math.floor(Math.random() * 10);
        if (!result.includes(uniqueNum)) {
          result.push(uniqueNum);
        }
      }
      return shuffleArray(result);
    }

    function generateTiga() {
      const num = Math.floor(Math.random() * 10);
      const result = [num, num, num];
      while (result.length < 5) {
        const uniqueNum = Math.floor(Math.random() * 10);
        if (!result.includes(uniqueNum)) {
          result.push(uniqueNum);
        }
      }
      return shuffleArray(result);
    }

    function generateEmpat() {
      const num = Math.floor(Math.random() * 10);
      const result = [num, num, num, num];
      while (result.length < 5) {
        const uniqueNum = Math.floor(Math.random() * 10);
        if (!result.includes(uniqueNum)) {
          result.push(uniqueNum);
        }
      }
      return shuffleArray(result);
    }

    function generateLima() {
      const num = Math.floor(Math.random() * 10);
      return [num, num, num, num, num];
    }

    function generateJackpot() {
      const result = [1, 2, 3, 4, 5];
      return shuffleArray(result);
    }

    function generateRandomResult() {
      const result = [];
      while (result.length < 5) {
        const num = Math.floor(Math.random() * 10);
        if (!result.includes(num)) {
          result.push(num);
        }
      }
      return result;
    }

    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    function generateControlledResult() {
      const rand = Math.random();
      let cumulativeProb = 0;

      for (const type in WIN_PROBABILITIES) {
        cumulativeProb += WIN_PROBABILITIES[type];
        if (rand < cumulativeProb) {
          switch (type) {
            case 'dua':
              return generateDua();
            case 'tiga':
              return generateTiga();
            case 'empat':
              return generateEmpat();
            case 'lima':
              return generateLima();
            case 'jackpot':
              return generateJackpot();
          }
        }
      }
      return generateRandomResult();
    }

    function checkWin(result) {
      const sortedResult = [...result].sort((a, b) => a - b).join('');
      if (sortedResult === '12345') {
        return 'jackpot';
      }

      const frequency = {};
      result.forEach(num => {
        frequency[num] = (frequency[num] || 0) + 1;
      });

      const counts = Object.values(frequency);
      const hasLima = counts.some(count => count >= 5);
      const hasEmpat = counts.some(count => count >= 4);
      const hasTiga = counts.some(count => count >= 3);
      const hasDua = counts.some(count => count >= 2);

      if (hasLima) {
        return 'lima';
      } else if (hasEmpat) {
        return 'empat';
      } else if (hasTiga) {
        return 'tiga';
      } else if (hasDua) {
        return 'dua';
      }
      return null;
    }

    function selectmain(amount) {
      if (amount > 0 && amount <= localUser.Perak) {
        currentmain = amount;
        $('#mainAmount').val(amount);
        $('#automainButtons button').removeClass('active');
        $(`#main${amount}`).addClass('active');
      } else if (amount === 0) {
        currentmain = 0;
        $('#mainAmount').val('');
        $('#automainButtons button').removeClass('active');
      } else {
        showErrorMessage('');
      }
    }

    function startAutoSpin() {
      if (currentmain <= 0) {
        showErrorMessage('');
        return;
      }
      isAutomainEnabled = true;
      $('#startAutoSpinButton').hide();
      $('#stopAutoSpinButton').show();
      $('#spinButton').prop('disabled', true);
      spin(false);
    }

    function stopAutoSpin() {
      isAutomainEnabled = false;
      $('#stopAutoSpinButton').hide();
      $('#startAutoSpinButton').show();
      $('#spinButton').prop('disabled', false);
    }

    function spin(isManual) {
      if (isSpinning) return;

      const slotAudio = document.getElementById('slotAudio');
      slotAudio.currentTime = 0;
      slotAudio.play().catch(err => console.log("Autoplay blocked:", err));

      if (currentmain <= 0) {
        showErrorMessage('');
        return;
      }
      if (currentmain > localUser.Perak) {
        showErrorMessage('');
        return;
      }

      localUser.Perak -= currentmain;
      updatePerakDisplay();
      userRef.child('Perak').set(localUser.Perak);
      const winAudio = document.getElementById('winAudio');
      if (!winAudio.paused) {
        winAudio.pause();
        winAudio.currentTime = 0;
      }

      isSpinning = true;
      $('#mainResult').addClass('result-hidden');

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
        currentSeeds = result;

        for (let i = 1; i <= 5; i++) {
          const seed = result[i - 1];
          $(`#ring${i}`)
            .css('animation', `spin-${seed} ${SPIN_DURATION}s cubic-bezier(0.1, 0.7, 0.1, 1)`)
            .attr('class', `ring spin-${seed}`);
        }

        setTimeout(() => {
          for (let i = 0; i < result.length; i++) {
            const numberElement = $(`#ring${i + 1} .roll`).eq(result[i]).find('p');
            numberElement.addClass('bling-bling');
          }

          saveRollToDatabase(result, isManual);
          processmainResult(result, isManual);

          isSpinning = false;
          if (isAutomainEnabled) {
            setTimeout(() => {
              if (isAutomainEnabled) {
                spin(false);
              }
            }, 3000);
          }
        }, SPIN_DURATION * 1000);
      }, 1000);
    }

    function processmainResult(result, isManual) {
      const winType = checkWin(result);
      let message = "try again";
      let messageClass = "lose";
      let winAmount = 0;

      if (winType) {
        playerWinStreak++;
        playerLoseStreak = 0;
        const baseMultiplier = WIN_MULTIPLIERS[winType];
        const totalMultiplier = baseMultiplier * (1 - HOUSE_EDGE);
        winAmount = Math.round(currentmain * totalMultiplier);

        message = `Congratulations! You WIN +${winAmount.toLocaleString('id-ID')} `;
        messageClass = "win";
        triggerConfetti();
        document.getElementById('winAudio').play();
      } else {
        playerWinStreak = 0;
        playerLoseStreak++;
      }

      localUser.Perak += winAmount;

      userRef.transaction((currentData) => {
        if (currentData) {
          let finalPerak = (currentData.Perak || 0) + winAmount;
          return {
            ...currentData,
            Perak: finalPerak,
          };
        } else {
          return;
        }
      }).then(() => {
        updatePerakDisplay();
        $('#mainResult')
          .text(message)
          .removeClass('result-hidden')
          .addClass(messageClass);
      }).catch(error => {
        console.error("Transaction failed:", error);
      });
    }

    function updateManualSpinButton() {
      const now = Date.now();
      const timeSinceLastSpin = now - lastManualSpinTime;
      const remainingCooldown = Math.max(0, MANUAL_SPIN_COOLDOWN - timeSinceLastSpin);

      if (remainingCooldown <= 0) {
        $('#spinButton').prop('disabled', false).text('Putar');
      } else {
        const seconds = Math.ceil(remainingCooldown / 1000);
        setTimeout(updateManualSpinButton, 1000);
      }
    }

    function triggerConfetti() {
      const defaults = {
        spread: 360,
        ticks: 200,
        gravity: 0.4,
        decay: 0.94,
        startVelocity: 90,
        colors: ['#FFC107', '#E91E63', '#4CAF50', '#2196F3']
      };
      function shoot() {
        confetti({
          ...defaults,
          particleCount: 2000,
          scalar: 1.2,
          shapes: ['star']
        });
        confetti({
          ...defaults,
          particleCount: 300,
          scalar: 0.8,
          shapes: ['circle']
        });
      }
      setTimeout(shoot, 0);
      setTimeout(shoot, 150);
      setTimeout(shoot, 300);
    }

  
    function showCustomAlert(message, type = 'info') {
      const alertDiv = document.getElementById('customAlert');
      const alertMessage = document.getElementById('alertMessage');
      const alertIcon = document.getElementById('alertIcon');

      alertMessage.textContent = message;
      switch (type) {
        case 'success':
          alertIcon.textContent = '✔️';
          alertDiv.style.border = '2px solid #4CAF50';
          break;
        case 'error':
          alertIcon.textContent = '❌';
          alertDiv.style.border = '2px solid #f44336';
          break;
        case 'warning':
          alertIcon.textContent = '⚠️';
          alertDiv.style.border = '2px solid #FFC107';
          break;
        default:
          alertIcon.textContent = 'ℹ️';
          alertDiv.style.border = '2px solid #2196F3';
      }

      alertDiv.style.display = 'block';
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.background = 'rgba(0,0,0,0.5)';
      overlay.style.zIndex = '1000';
      overlay.id = 'alertOverlay';
      document.body.appendChild(overlay);
      document.getElementById('alertOkBtn').onclick = function() {
        alertDiv.style.display = 'none';
        document.getElementById('alertOverlay').remove();
      };
    }


    $(document).ready(function() {

      for (let i = 1; i <= 5; i++) createROLL($('#ring' + i));
      $('#rotate').addClass('tilted');
      $('.roll').addClass('backface-on');

      // Hide loading screen after a delay
      setTimeout(() => {
        $('#loading').fadeOut();
      }, 2000);

   
      let winAudio = document.getElementById('winAudio');
      let userInteracted = false;
      $('#spinButton').click(function() {
        if (!userInteracted) {
          winAudio.muted = true;
          winAudio.play().then(() => {
            winAudio.pause();
            winAudio.currentTime = 0;
            winAudio.muted = false;
            userInteracted = true;
          }).catch(error => {
            console.error("Audio play blocked:", error);
          });
        }

        if (!$(this).prop('disabled')) {
          spin(true);
        }
      });

    
      $('#startAutoSpinButton').click(startAutoSpin);
      $('#stopAutoSpinButton').click(stopAutoSpin);

   
      const totalPerakSpan = document.getElementById("total-perak");
      let totalPerak = 0;
      const inputs = document.querySelectorAll('.input-circle');
      inputs.forEach(input => {
        input.addEventListener('change', () => {
          if (input.checked) {
            totalPerak++;
            totalPerakSpan.textContent = totalPerak;
          } else {
            totalPerak--;
            totalPerakSpan.textContent = totalPerak;
          }
        });
      });

      const selesaiBtn = document.getElementById("selesaiBtn");
      selesaiBtn.addEventListener("click", () => {
        if (localUser.ID && totalPerak > 0) {
          const usersRef = db.ref('users');
          usersRef.orderByChild('ID').equalTo(localUser.ID).once('value')
            .then(snapshot => {
              if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                  const userId = childSnapshot.key;
                  let currentPerak = childSnapshot.val().Perak ? parseInt(childSnapshot.val().Perak) : 0;
                  let newPerak = currentPerak + totalPerak;

                  return db.ref('users/' + userId).update({
                      Perak: newPerak
                    })
                    .then(() => {
                      showCustomAlert(` ${totalPerak} Perak successfully claimed!`, "success");
                      totalPerak = 0;
                      totalPerakSpan.textContent = totalPerak;
                      inputs.forEach(input => input.checked = false);
                    });
                });
              } else {
                showCustomAlert("User not found.", "error");
              }
            })
            .catch(error => {
              console.error("Failed to send Perak:", error);
              showCustomAlert("Failed to send Perak. Please try again.", "error");
            });
        } else {
          showCustomAlert("No Perak to claim.", "info");
        }
      });



      initializeHome();
    });
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

    initializeHome();

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
      initializeHome();   
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
    
