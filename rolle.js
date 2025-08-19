// Memastikan variabel global dari app.js bisa diakses
const db = firebase.database();

function initializeRoll() {
    console.log('Halaman Roll berhasil dimuat dan diinisialisasi.');

    const localUser = {
        Username: localStorage.getItem("Username"),
        Nama: localStorage.getItem("Nama"),
        Perak: parseInt(localStorage.getItem("Perak")) || 0,
        TotalLoss: parseInt(localStorage.getItem("TotalLoss")) || 0,
        operatorCapital: 1000
    };

    if (!localUser.Username) {
        console.log("Username tidak ditemukan di localStorage. Silakan login.");
    }

    const userRef = db.ref(`users/${localUser.Username}`);
    const operatorCapitalRef = db.ref(`users/${localUser.Username}/operatorCapital`);

    userRef.on('value', (snapshot) => {
      const userData = snapshot.val();
      if (userData !== null) {
          localUser.Perak = userData.Perak || 0;
          localUser.TotalLoss = userData.TotalLoss || 0;
          
          localStorage.setItem("Perak", localUser.Perak);
          localStorage.setItem("TotalLoss", localUser.TotalLoss);
          
          updatePerakDisplay();
          console.log("Saldo dan total kekalahan berhasil disinkronkan.");
      }
    });

    operatorCapitalRef.on('value', (snapshot) => {
      const capitalData = snapshot.val();
      if (capitalData !== null) {
        localUser.operatorCapital = capitalData;
      } else {
        localUser.operatorCapital = 1000;
        operatorCapitalRef.set(1000); 
        console.log("Modal operator baru diinisialisasi.");
      }
      updateOperatorCapitalDisplay();
    });

    // Semua variabel dan fungsi permainan roll
    const ROLL_PER_REEL = 10;
    const REEL_RADIUS = 400;
    const TIME_TOLERANCE = 5 * 60 * 1000;
    const SPIN_DURATION = 5;
    const MANUAL_SPIN_COOLDOWN = 4 * 400;
    
    const WIN_MULTIPLIERS = {
      'dua': 2,
      'tiga': 2.5,
      'empat': 2.75,
      'lima': 3,
      'jackpot': 5
    };
    
    const WIN_PROBABILITIES = {
      'dua': 0.9,
      'tiga': 0.7,
      'empat': 0.5,
      'lima': 0.000000000000000000000000000000001,
      'jackpot': 0.0000000000000000000000000000000001
    };
    
    const MIN_OPERATOR_CAPITAL = 100;
    
    let currentSeeds = [0, 0, 0, 0, 0];
    let timeOffset = 0;
    let timeValidated = false;
    let isSpinning = false;
    let lastManualSpinTime = 0;
    let currentmain = 0;
    let hasPlacedmain = false;
    let automainAmount = 0;
    let isAutomainEnabled = false;
    let playerWinStreak = 0;
    let playerLoseStreak = 0;
    const HOUSE_EDGE = 0;
    
    function updatePerakDisplay() {
      $('#perakBalance').text(localUser.Perak.toLocaleString('id-ID'));
      $('#lossCounter').text(localUser.TotalLoss.toLocaleString('id-ID'));
    }

    function updateOperatorCapitalDisplay() {
      $('#operatorCapitalDisplay').text(localUser.operatorCapital.toLocaleString('id-ID'));
    }
    
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
      const now = new Date();
      const rollData = {
        numbers: result.join(''),
        timestamp: now.getTime(),
        date: now.toISOString(),
        username: localUser.Username || 'system',
        type: isManual ? 'manual' : 'auto',
        main: hasPlacedmain ? currentmain : 0
      };
      db.ref('rolls').push(rollData)
        .then(() => console.log('Roll saved to database'))
        .catch(error => console.error('Error saving roll:', error));
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
      let currentProbabilities = WIN_PROBABILITIES;

      if (localUser.operatorCapital < MIN_OPERATOR_CAPITAL) {
          console.log("Modal operator di bawah ambang batas. Memaksa pemain kalah.");
          return generateRandomResult();
      }
      
      const rand = Math.random();
      let cumulativeProb = 0;

      for (const type in currentProbabilities) {
          cumulativeProb += currentProbabilities[type];
          if (rand < cumulativeProb) {
              switch(type) {
                  case 'dua': return generateDua();
                  case 'tiga': return generateTiga();
                  case 'empat': return generateEmpat();
                  case 'lima': return generateLima();
                  case 'jackpot': return generateJackpot();
              }
          }
      }
      return generateRandomResult();
    }

    function adjustWinProbability(baseProbability) {
      if (playerWinStreak > 0) {
        return baseProbability * 0.00000001;
      }
      if (playerLoseStreak > 0) {
        return Math.min(baseProbability * (1 + (playerLoseStreak * 0.0001)), 0.0001);
      }
      return baseProbability;
    }
    
    function checkWin(result) {
      if (!hasPlacedmain || currentmain <= 0) return null;
      
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

    function toggleAutomain(amount) {
      if (amount > 0 && !isAutomainEnabled && amount <= localUser.Perak) {
      }
      
      automainAmount = amount;
      isAutomainEnabled = amount > 0;
      
      if (isAutomainEnabled) {
        $('#automainButtons button').removeClass('active');
        $(`#automain${amount}`).addClass('active');
        $('#mainAmount').val(amount);
        placemain(amount);
      } else {
        $('#automainButtons button').removeClass('active');
        cancelmain();
      }
    }

    function placemain(amount) {
      if (amount > localUser.Perak) {
        showErrorMessage('Saldo Perak tidak mencukupi');
        return false;
      }
      currentmain = amount;
      hasPlacedmain = true;
      $('#placemainButton').prop('disabled', true);
      $('#cancelmainButton').prop('disabled', false);
      return true;
    }

    function cancelmain() {
      currentmain = 0;
      hasPlacedmain = false;
      $('#mainAmount').val('');
      $('#placemainButton').prop('disabled', false);
      $('#cancelmainButton').prop('disabled', true);
      $('#mainResult').addClass('result-hidden').removeClass('win lose');
    }

    function processmainResult(result) {
      if (!hasPlacedmain) {
        if (isAutomainEnabled) {
          placemain(automainAmount);
        }
        return;
      }
      
      const winType = checkWin(result);
      let message = "";
      let messageClass = "";
      let mainAmount = currentmain;

      userRef.transaction((currentData) => {
        if (currentData) {
          let finalPerak = currentData.Perak || 0;
          let finalLoss = currentData.TotalLoss || 0;
          let finalOperatorCapital = currentData.operatorCapital || 1000;
          
          if (winType) {
            playerWinStreak++;
            playerLoseStreak = 0;
            
            const baseMultiplier = WIN_MULTIPLIERS[winType];
            const totalMultiplier = baseMultiplier * (1 - HOUSE_EDGE);
            const winAmount = Math.round(mainAmount * totalMultiplier);

            finalPerak += winAmount;
            finalLoss -= winAmount;
            finalOperatorCapital -= winAmount;
            
            const winTypes = {
              'dua': 'Dua Angka Sama',
              'tiga': 'Tiga Angka Sama',
              'empat': 'Empat Angka Sama',
              'lima': 'Lima Angka Sama',
              'jackpot': 'Jackpot 12345'
            };
            
            message = `Selamat Anda MENDAPATKAN +${winAmount.toLocaleString('id-ID')} `;
            messageClass = "win";           
            triggerConfetti(); 
            document.getElementById('winAudio').play();
            
            saveWinToDatabase(winAmount, winType, result.join(''), mainAmount);
          } else {
            playerWinStreak = 0;
            playerLoseStreak++;
            finalPerak -= mainAmount;
            finalLoss += mainAmount;
            finalOperatorCapital += mainAmount;
          }
          
          return {
            ...currentData,
            Perak: finalPerak,
            TotalLoss: finalLoss,
            operatorCapital: finalOperatorCapital
          };
        } else {
          return;
        }
      }).then(() => {
        $('#mainResult')
          .text(message)
          .removeClass('result-hidden')
          .addClass(messageClass);
          
        if (isAutomainEnabled) {
          setTimeout(() => {
            placemain(automainAmount);
          }, 3000);
        } else {
          currentmain = 0;
          hasPlacedmain = false;
          $('#placemainButton').prop('disabled', false);
          $('#cancelmainButton').prop('disabled', true);
        }
      }).catch(error => {
        console.error("Transaksi gagal:", error);
      });
    }

    function saveWinToDatabase(amount, winType, numbers, mainAmount) {
      const now = new Date();
      const winData = {
        username: localUser.Username,
        amount: amount,
        type: winType,
        numbers: numbers,
        timestamp: now.getTime(),
        date: now.toISOString(),
        main: mainAmount
      };
      
      db.ref('wins').push(winData)
        .then(() => console.log('Win saved to database'))
        .catch(error => console.error('Error saving win:', error));
    }
    
    function spin(isManual = false) {
      if (isSpinning) return;
      
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
          const seed = result[i-1];
          $(`#ring${i}`)
            .css('animation', `spin-${seed} ${SPIN_DURATION}s cubic-bezier(0.1, 0.7, 0.1, 1)`)
            .attr('class', `ring spin-${seed}`);
        }
          
        setTimeout(() => {
          for (let i = 0; i < result.length; i++) {
            const numberElement = $(`#ring${i+1} .roll`).eq(result[i]).find('p');
            numberElement.addClass('bling-bling');
          }
          
          saveRollToDatabase(result, isManual);
          processmainResult(result);
          
          isSpinning = false;
        }, SPIN_DURATION * 1000);
      }, 1000);
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
          ticks: 400,
          gravity: 0.5,
          decay: 0.94,
          startVelocity: 30,
          colors: ['#FFC107', '#E91E63', '#4CAF50', '#2196F3']
      };
      function shoot() {
          confetti({
              ...defaults,
              particleCount: 400,
              scalar: 1.2,
              shapes: ['star']
          });
          confetti({
              ...defaults,
              particleCount: 50,
              scalar: 0.8,
              shapes: ['circle']
          });
      }
      setTimeout(shoot, 0);
      setTimeout(shoot, 150);
      setTimeout(shoot, 300);
    }

    // Event listener yang berada di dalam $(document).ready()
    $(document).ready(function() {
        for (let i = 1; i <= 5; i++) createROLL($('#ring' + i));
          
        $('#rotate').addClass('tilted');
        $('.roll').addClass('backface-on');
        
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
        
        $('#placemainButton').click(function() {
            const mainAmount = parseInt($('#mainAmount').val());
            
            if (isNaN(mainAmount) || mainAmount <= 0) {
                showErrorMessage('Masukkan jumlah pasangan yang valid');
                return;
            }
            
            placemain(mainAmount);
        });
        
        $('#cancelmainButton').click(function() {
            cancelmain();
        });
    });
}

// Daftarkan fungsi inisialisasi ke app.js
pageInitializers['roll'] = initializeRoll;
