const firebaseConfig = {
apiKey: "AIzaSyDPJfJgUg8a_e1zS3nSbU8RqHj3TOALX2s",
authDomain: "nasuka-fc780.firebaseapp.com",
databaseURL: "https://nasuka-fc780-default-rtdb.asia-southeast1.firebasedatabase.app",
projectId: "nasuka-fc780",
messagingSenderId: "860641747257",
appId: "1:860641747257:web:d1dc28bf34cc1f64ad48e8"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const localUser = {
    Username: localStorage.getItem("Username"),
    Nama: localStorage.getItem("Nama"),
    Perak: localStorage.getItem("Perak"),
};
      
      
      
      
      
      
    const ROLL_PER_REEL = 10;
    const REEL_RADIUS = 300;
    const TIME_TOLERANCE = 5 * 60 * 1000;
    const SPIN_DURATION = 60;
    
    const AUTO_SPIN_SCHEDULES = [
 { hour: 01, minute: 00, second: 00 },
 { hour: 02, minute: 00, second: 00 },
 { hour: 21, minute: 50, second: 00 },
 { hour: 22, minute: 05, second: 00 },
 
 
    ];
    
    let currentSeeds = [0, 0, 0, 0, 0];
    let nextAutoSpinTime = null;
    let timeOffset = 0;
    let timeValidated = false;
    let isSpinning = false;

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

    function spin() {
      if (isSpinning) return;
      isSpinning = true;
      
      $('#resultDisplay').empty();
      $('#numbersDisplay').empty();
      
    
      for (let i = 1; i <= 5; i++) {
        $(`#ring${i}`).css('animation', `back-spin 1s`);
      }
      
      setTimeout(() => {
       
        for (let i = 1; i <= 5; i++) {
          let seed = Math.floor(Math.random() * ROLL_PER_REEL);
          while (seed === currentSeeds[i - 1]) {
            seed = Math.floor(Math.random() * ROLL_PER_REEL);
          }
          currentSeeds[i - 1] = seed;
          
          $(`#ring${i}`)
            .css('animation', `spin-${seed} ${SPIN_DURATION}s cubic-bezier(0.1, 0.7, 0.1, 1)`)
            .attr('class', `ring spin-${seed}`);
        }
        
   
        setTimeout(() => {
          const result = currentSeeds;
          $('#numbersDisplay').html(
            result.map(num => `<span>${num}</span>`).join('')
          );
          isSpinning = false;
          
          
          calculateNextAutoSpin();
        }, SPIN_DURATION * 1000);
      }, 1000);
    }

    async function getAccurateTime() {
      try {
        const response = await fetch('https://worldtimeapi.org/api/timezone/Asia/Jakarta');
        const data = await response.json();
        const serverTime = new Date(data.utc_datetime);
        
        const deviceTime = new Date();
        timeOffset = serverTime - deviceTime;
        
        if (Math.abs(timeOffset) > TIME_TOLERANCE) {
          $('.time-warning').text('Waktu perangkat tidak akurat! Menggunakan waktu server.').show();
          return serverTime;
        }
        
        timeValidated = true;
        return deviceTime;
      } catch (error) {
        console.error('Gagal mengambil waktu server:', error);
        return new Date();
      }
    }

    function getJakartaTime() {
      const now = new Date(new Date().getTime() + timeOffset);
      return new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    }

    function calculateNextAutoSpin() {
      const now = getJakartaTime();
      let closestTime = null;

      for (const schedule of AUTO_SPIN_SCHEDULES) {
        const targetTime = new Date(now);
        targetTime.setHours(schedule.hour, schedule.minute, schedule.second, 0);
        
        if (targetTime <= now) {
          targetTime.setDate(targetTime.getDate() + 1);
        }
        
        if (!closestTime || targetTime < closestTime) {
          closestTime = targetTime;
        }
      }
      
      nextAutoSpinTime = closestTime;
    }

    function updateTimeDisplay() {
      const now = getJakartaTime();
      const timeStr = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/\./g, ':');
      
      if (!nextAutoSpinTime) calculateNextAutoSpin();
      const diff = nextAutoSpinTime - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      
      $('.time-text').html(`Waktu Indonesia Barat: <strong>${timeStr}</strong>`);
      $('.countdown').html(
        `Acak Nomor : ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      );
      
      if (diff <= 0 && !isSpinning) {
        spin();
      }
    }

    $(document).ready(async function() {
     
      for (let i = 1; i <= 5; i++) createROLL($('#ring' + i));
      
      $('#rotate').addClass('tilted');
      $('.roll').addClass('backface-on');
      await getAccurateTime();
      calculateNextAutoSpin();
      updateTimeDisplay();
      setInterval(updateTimeDisplay, 1000);   
      setTimeout(() => {
        $('#loading').fadeOut();
      }, 2000);
    });
