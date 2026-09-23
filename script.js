const CANDLE_COUNT = 3;

const cake = document.getElementById('cake');
const subtitle = document.getElementById('subtitle');
const openLetterBtn = document.getElementById('open-letter-btn');
const modal = document.getElementById('letter-modal');
const closeBtn = document.getElementById('close-btn');

// 1. Inisialisasi Audio Elements
const bgm = document.getElementById('bgm');
const sfxConfetti = document.getElementById('sfx-confetti');
const sfxCheer = document.getElementById('sfx-cheer');

// -------------------------------------------------------------
// SETTING VOLUME AUDIO (Skala 0.0 sampai 1.0)
// -------------------------------------------------------------
bgm.volume = 0.3;          // BGM diatur ke 30% (biar gak ketuan)
sfxConfetti.volume = 0.6;  // SFX Confetti diatur ke 60%
sfxCheer.volume = 0.7;     // SFX Cheer/Hore diatur ke 70%
// -------------------------------------------------------------

let candlesBlown = false;
let bgmStarted = false;

// Fungsi KHUSUS untuk memutar BGM saja
function startBGMOnly() {
  if (!bgmStarted) {
    bgm.currentTime = 0;
    bgm.play().then(() => {
      bgmStarted = true;
    }).catch(err => console.log("Menunggu interaksi user:", err));
  }
}

// BGM cuma bakal diputar pas user pertama kali klik area mana aja
document.body.addEventListener('click', startBGMOnly, { once: true });

// Render Lilin
function renderCandles() {
  const container = document.createElement('div');
  container.className = 'candle-container';

  for (let i = 0; i < CANDLE_COUNT; i++) {
    const candle = document.createElement('div');
    candle.className = 'candle';
    
    const flame = document.createElement('div');
    flame.className = 'flame';
    
    candle.appendChild(flame);
    container.appendChild(candle);
  }
  cake.appendChild(container);
}

// Deteksi Tiupan
async function initBlowDetection() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Otomatis putar BGM pas izin mic disetujui
    startBGMOnly();

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    
    analyser.fftSize = 256;
    microphone.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function checkBlow() {
      if (candlesBlown) return;

      analyser.getByteFrequencyData(dataArray);
      
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      let average = sum / bufferLength;

      if (average > 51) { // Threshold untuk mendeteksi tiupan
        blowOutCandles();
      }

      requestAnimationFrame(checkBlow);
    }

    checkBlow();
  } catch (err) {
    console.warn("Mikrofon tidak aktif:", err);
    subtitle.innerHTML = "give access to microphone dulu baru di refresh ya!";
    cake.addEventListener('click', () => {
      startBGMOnly();
      blowOutCandles();
    });
  }
}

// Aksi Saat Lilin Padam (Disini SFX baru ke-play)
function blowOutCandles() {
  if (candlesBlown) return;
  candlesBlown = true;

  // Padamkan api
  const flames = document.querySelectorAll('.flame');
  flames.forEach(flame => flame.classList.add('out'));

  subtitle.innerHTML = "Hooray! kuenya di sini aja yah soalnya kalo di rl kan gabisa hehe 🎉✨";
  openLetterBtn.classList.remove('hidden');

  // BARU DIPUTAR SAAT LILIN DITIUP/PADAM
  if (sfxConfetti) {
    sfxConfetti.currentTime = 0;
    sfxConfetti.play();
  }
  if (sfxCheer) {
    sfxCheer.currentTime = 0;
    sfxCheer.play();
  }

  // Effect Confetti Visual
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 160,
      spread: 80,
      origin: { y: 0.6 }
    });
  }
}

// Modal Events
openLetterBtn.addEventListener('click', () => modal.classList.remove('hidden'));
closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

// Inisialisasi
renderCandles();
initBlowDetection();