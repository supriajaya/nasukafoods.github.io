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
let isSpinning = false;
let lastManualSpinTime = 0;
let currentmain = 0;
let isAutomainEnabled = false;
let playerWinStreak = 0;
let playerLoseStreak = 0;
const HOUSE_EDGE = 0;
let totalPerakBurung = 0;

function updatePerakDisplay() {
    $('#perakBalance').text(localUser.Perak.toLocaleString('id-ID'));
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
    const rand = Math.random();
    let cumulativeProb = 0;
    for (const type in currentProbabilities) {
        cumulativeProb += currentProbabilities[type];
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
        for (let i = 1; i <= 5; i++) {
            const seed = result[i - 1];
            $(`#ring${i}`).css('animation', `spin-${seed} ${SPIN_DURATION}s cubic-bezier(0.1, 0.7, 0.1, 1)`).attr('class', `ring spin-${seed}`);
        }
        setTimeout(() => {
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
            }
        }, SPIN_DURATION * 1000);
    }, 1000);
}

function processmainResult(result, isManual) {
    const winType = checkWin(result);
    let message = "Coba lagi.";
    let messageClass = "lose";
    let winAmount = 0;
    let netChange = 0;
    if (winType) {
        playerWinStreak++;
        playerLoseStreak = 0;
        const baseMultiplier = WIN_MULTIPLIERS[winType];
        const totalMultiplier = baseMultiplier * (1 - HOUSE_EDGE);
        winAmount = Math.round(currentmain * totalMultiplier);
        message = `Selamat! Anda mendapatkan +${winAmount.toLocaleString('id-ID')} Perak!`;
        messageClass = "win";
        triggerConfetti();
        document.getElementById('winAudio').play();
        netChange = winAmount;
    } else {
        playerWinStreak = 0;
        playerLoseStreak++;
        netChange = 0;
    }
    localUser.Perak += netChange;
    db.ref(`users/${localUser.Username}`).child('Perak').set(localUser.Perak)
        .then(() => {
            localStorage.setItem("Perak", localUser.Perak);
            updatePerakDisplay();
            $('#mainResult').text(message).removeClass('result-hidden').addClass(messageClass);
        })
        .catch(error => {
            console.error("Gagal memperbarui Perak di database:", error);
            showErrorMessage("Gagal memperbarui perak. Silakan coba lagi.");
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
                console.error("Autoplay blocked:", error);
            });
        }
        if (!$(this).prop('disabled')) {
            spin(true);
        }
    });
    $('#startAutoSpinButton').click(startAutoSpin);
    $('#stopAutoSpinButton').click(stopAutoSpin);
});





