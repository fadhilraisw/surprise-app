/* ============================================================
   BIRTHDAY SPA - script.js
   Base viewport: 1836 x 1240
   ============================================================ */

'use strict';
// Ganti angka ini setiap kali kamu upload video baru yang namanya sama
const WEB_VERSION = "1.0";

// ── STATE ROUTER & BUBBLE LOGIC ─────────────────────────────
const states = document.querySelectorAll('.state');
const globalNav = document.getElementById('global-navbar');
const bubble = document.getElementById('glass-bubble');
const navItems = document.querySelectorAll('.nav-item');
let currentState = 1;

// Fungsi untuk menggeser & merubah ukuran gelembung secara dinamis
function moveBubble(targetBtn) {
    if(!targetBtn || !bubble) return;
    const leftPos = targetBtn.offsetLeft;
    const btnWidth = targetBtn.offsetWidth;
    bubble.style.left = `${leftPos}px`;
    bubble.style.width = `${btnWidth}px`;
}

function goTo(n) {
  states.forEach(s => s.classList.remove('active'));
  document.getElementById('state-' + n).classList.add('active');
  currentState = n;
  
  if (n >= 3 && n <= 5) {
      globalNav.style.display = 'flex';
      navItems.forEach(nav => {
          nav.classList.remove('active');
          if (parseInt(nav.getAttribute('data-state')) === n) {
              nav.classList.add('active');
              setTimeout(() => moveBubble(nav), 50); 
          }
      });
  } else {
      globalNav.style.display = 'none';
  }

  // --- tambahan logika mematikan video ---
  // kita cari video utama, kalau ada dan kita pindah dari state 4, matikan videonya
  const mainVid = document.getElementById('main-video');
  if (mainVid && n !== 4) {
      mainVid.pause();
  }
  // ---------------------------------------  
  
  if (n === 3) initHome();
  if (n === 4) initFamily();
  if (n === 5) initPhotobooth();

  // Memicu Sistem Musik Setiap Pindah Halaman!
  manageAudioForState(n); 
}

// EVENT LISTENER UNTUK GLOBAL NAVBAR BUTTONS
navItems.forEach(btn => {
  btn.addEventListener('click', () => {
      goTo(+btn.getAttribute('data-state'));
  });
});



// ── STATE 1: LANDING ─────────────────────────────────────────
document.getElementById('btn-welcome-next').addEventListener('click', () => goTo(2));

// ── STATE 2: GATEKEEPER ──────────────────────────────────────
const q1 = document.getElementById('quiz-q1');
const q2 = document.getElementById('quiz-q2');
const btnQuizSubmit = document.getElementById('btn-quiz-submit');
const quizError = document.getElementById('quiz-error-msg');

btnQuizSubmit.addEventListener('click', checkQuizLogic);
document.addEventListener('keydown', e => { 
    if (e.key === 'Enter' && currentState === 2) checkQuizLogic(); 
});

function checkQuizLogic() {
    const a1 = q1.value.toLowerCase().trim();
    const a2 = q2.value.toLowerCase().trim();
    
    // Validasi
    const isA1Correct = ["shamyla", "sha", "shamyla diandra", "shamyla diandra veranti"].some(keyword => a1.includes(keyword));
    const isA2Correct = ["gatau", "ga tau", "gak tau", "terserah", "bebas", "dimana aja"].some(keyword => a2.includes(keyword));

    if (isA1Correct && isA2Correct) {
        quizError.classList.add('hidden');
        goTo(3); // Cukup ini saja, initHome() sudah ada di dalam goTo()
    } else {
        quizError.classList.remove('hidden');
        setTimeout(() => quizError.classList.add('hidden'), 2500);
    }
}


// ── STATE 3: HOME ─────────────────────────────────────────────
let candlesLit = true;
let micStream = null;
let audioCtx = null;
let blowCount = 0;        // Penghitung jumlah tiupan
let blowCooldown = false; // Sistem jeda antar tiupan

function initHome() {
  candlesLit = true;
  blowCount = 0;
  blowCooldown = false;

  // --- tambahan reset visual amplop dan tombol ---
  const btnSendWish = document.getElementById('btn-send-wish');
  const btnBlow = document.getElementById('btn-blow');
  const micBarWrap = document.getElementById('mic-bar-wrap');
  const envWrapper = document.getElementById('envelope-wrapper');
  const wishInput = document.getElementById('wish-input');
  const envImg = document.getElementById('envelope-img');
  const planeImg = document.getElementById('plane-img');

  // kembalikan tombol send dan sembunyikan mic/blow
  if (btnSendWish) btnSendWish.style.display = 'block';
  if (btnBlow) btnBlow.style.display = 'none';
  if (micBarWrap) micBarWrap.style.display = 'none';
  
  // kembalikan amplop ke posisi semula dan hapus class animasi terbangnya
  if (envWrapper) {
      envWrapper.style.display = 'block';
      envWrapper.classList.remove('plane-fly');
  }
  
  // munculkan lagi gambar amplop, sembunyikan gambar pesawat
  if (envImg) envImg.style.opacity = '1';
  if (planeImg) planeImg.style.opacity = '0';

  // munculkan lagi teks inputan dan kosongkan isinya
  if (wishInput) {
      wishInput.style.opacity = '1';
      wishInput.value = ''; 
  }
  // -----------------------------------------------

  // 1. restart kue memantul (svg)
  const cakeContainer = document.getElementById('cake-container');
  const oldSvg = document.getElementById('cake');
  if (oldSvg && cakeContainer) {
      const newSvg = oldSvg.cloneNode(true);
      oldSvg.parentNode.replaceChild(newSvg, oldSvg);
  }

  // 2. generator 21 lilin jatuh 1 per 1 (dengan miring acak)
  const candlesWrapper = document.getElementById('candles-wrapper');
  if (candlesWrapper) {
      candlesWrapper.innerHTML = ''; 

      for (let i = 0; i < 21; i++) {
          const candle = document.createElement('div');
          candle.className = 'velas api-lilin-item';
          
          // KEMBALIKAN KE 5 LAPIS API BIAR CAKEP!
          for(let j = 0; j < 5; j++) {
              const api = document.createElement('div');
              api.className = 'fuego';
              candle.appendChild(api);
          }
          
          candle.style.height = (12 + Math.random() * 6) + 'px';
          const tiltAngle = (Math.random() * 24 - 12) + 'deg';
          candle.style.setProperty('--tilt', tiltAngle);
          const delay = 3.5 + (i * 0.1); 
          candle.style.animation = `dropCandle 0.5s ease-in ${delay}s both`;
          
          candlesWrapper.appendChild(candle);
      }
  }
}

// FUNGSI MATIKAN SEBAGIAN LILIN (Tiupan ke-1 dan ke-2)
function matikanSebagianLilin() {
    // Cari semua lilin yang MASIH hidup (belum display: none)
    const semuaLilin = Array.from(document.querySelectorAll('.api-lilin-item')).filter(l => l.style.display !== 'none');
    
    // Acak urutan array lilin biar matinya random
    const diacak = semuaLilin.sort(() => 0.5 - Math.random());
    
    // Matikan 7 lilin di setiap tiupan (karena 21 / 3 = 7)
    const jumlahDimatikan = Math.min(7, diacak.length);
    for (let i = 0; i < jumlahDimatikan; i++) {
        diacak[i].style.animation = 'none'; // Matikan paksaan keyframes
        diacak[i].style.transition = 'opacity 0.3s ease';
        diacak[i].style.opacity = '0';
        setTimeout(() => { diacak[i].style.display = 'none'; }, 300);
    }
}

// FUNGSI BLOW FINAL (Tiupan ke-3 / Terakhir)
function blowOutCandles() {
  candlesLit = false;
  
  const sisaLilin = document.querySelectorAll('.api-lilin-item');
  sisaLilin.forEach(lilin => {
      lilin.style.animation = 'none';
      lilin.style.transition = 'opacity 0.3s ease';
      lilin.style.opacity = '0';
      setTimeout(() => { lilin.style.display = 'none'; }, 300);
  });

  const micWrap = document.getElementById('mic-bar-wrap');
  const btnBlow = document.getElementById('btn-blow');
  
  if(micWrap) micWrap.style.display = 'none';
  if(btnBlow) btnBlow.style.display = 'none';
  
  if (micStream) micStream.getTracks().forEach(t => t.stop());
  
  setTimeout(launchConfetti, 300); // Confetti meledak setelah lilin benar-benar hilang
}

// SENSOR MICROPHONE (CEK SUARA TIUPAN)
async function requestMic() {
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(micStream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    const buf = new Uint8Array(analyser.frequencyBinCount);

    function checkVolume() {
      if (!candlesLit) return; // Kalau lilin udah habis, stop ngecek suara

      analyser.getByteFrequencyData(buf);
      const avg = buf.reduce((a, b) => a + b) / buf.length;
      const pct = Math.min(100, (avg / 128) * 100);
      const bar = document.getElementById('mic-bar');
      if (bar) bar.style.width = pct + '%';

      // JIKA SUARA MELEBIHI THRESHOLD 60 (Tiupan kencang)
      if (avg > 60 && candlesLit) {
        if (!blowCooldown) {
          blowCooldown = true; // Kunci biar ga kedeteksi dobel
          blowCount++;         // Tambah jumlah tiupan

          if (blowCount >= 3) {
            blowOutCandles();  // TIUPAN KE-3: MATIKAN SEMUA!
          } else {
            matikanSebagianLilin(); // TIUPAN 1 & 2: Matikan random
            // Kasih jeda 1 detik sebelum dia bisa niup lagi (biar realistis harus ambil napas)
            setTimeout(() => { blowCooldown = false; }, 1000); 
            requestAnimationFrame(checkVolume);
          }
        } else {
          requestAnimationFrame(checkVolume); // Sedang cooldown
        }
      } else {
        requestAnimationFrame(checkVolume); // Suara kurang kencang
      }
    }
    checkVolume();
  } catch {
    // Mic denied, ditangani oleh klik tombol
  }
}

// PENGELOLAAN TOMBOL SEND & BLOW
document.getElementById('btn-send-wish').addEventListener('click', sendWish);

function sendWish() {
  const wrapper = document.getElementById('envelope-wrapper');
  const envImg = document.getElementById('envelope-img');
  const planeImg = document.getElementById('plane-img');
  const wishInput = document.getElementById('wish-input');
  
  // Sembunyikan tombol send
  document.getElementById('btn-send-wish').style.display = 'none';

  // 1. Pudarkan teks tulisan secara instan
  if (wishInput) {
      wishInput.style.transition = 'opacity 0.3s ease';
      wishInput.style.opacity = '0';
  }

  // 2. Transisi crossfade: Amplop memudar, Pesawat Kertas muncul
  if (envImg && planeImg) {
      envImg.style.opacity = '0';
      planeImg.style.opacity = '1';
  }

  // 3. Tambahkan jeda sangat sedikit (100ms) agar transisi perubahannya terlihat 
  // sebelum keseluruhannya melesat terbang!
  setTimeout(() => {
      wrapper.classList.add('plane-fly');
  }, 100);

  // 4. Setelah terbang selesai (1300ms), munculkan tombol Blow
  setTimeout(() => {
    document.getElementById('btn-blow').style.display = 'block';
    document.getElementById('mic-bar-wrap').style.display = 'block';
    
    // Matikan/sembunyikan wadah amplop sepenuhnya agar tidak nge-bug di background
    wrapper.style.display = 'none';
  }, 1400);
}

// FALLBACK JIKA MIC MATI/DITOLAK: KLIK TOMBOL UNTUK NIUP 1 PER 1
document.getElementById('btn-blow').addEventListener('click', () => {
  requestMic();
  
  // Simulasi klik sebagai 1 tarikan napas tiupan
  if (candlesLit && !blowCooldown) {
      blowCooldown = true;
      blowCount++;
      if (blowCount >= 3) {
          blowOutCandles();
      } else {
          matikanSebagianLilin();
          setTimeout(() => { blowCooldown = false; }, 800);
      }
  }
});

// CONFETTI
function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  const scene = canvas.parentElement;
  canvas.width = scene.offsetWidth;
  canvas.height = scene.offsetHeight;
  const ctx = canvas.getContext('2d');
  const COLORS = ['#ff6b9d','#c0002a','#ffd700','#ff9f43','#48dbfb','#ff9ff3'];
  const pieces = Array.from({ length: 180 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height,
    r: Math.random() * 8 + 4,
    d: Math.random() * 10 + 5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    tilt: Math.random() * 10 - 5,
    tiltAngle: 0,
    tiltSpeed: Math.random() * 0.1 + 0.05
  }));
  let angle = 0, frame = 0;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    angle += 0.01;
    pieces.forEach(p => {
      p.tiltAngle += p.tiltSpeed;
      p.y += (Math.cos(angle + p.d) + 1.5) * 2;
      p.x += Math.sin(angle) * 1.5;
      p.tilt = Math.sin(p.tiltAngle) * 12;
      ctx.beginPath();
      ctx.lineWidth = p.r / 2;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
      ctx.stroke();
    });
    frame++;
    if (frame < 300) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  draw();
}

// ── state 4: family & friends ─────────────────────────────────
/*
  videos array: add your video src paths here.
  format: { src: 'https://res.cloudinary.com/.../video1.mp4' }
*/
const VIDEOS = [
  { src: 'https://res.cloudinary.com/db8o82eov/video/upload/v1779894172/video1_baru_1_1_r9kapv.mov' }, //bunda ayah teteh
  { src: 'https://res.cloudinary.com/db8o82eov/video/upload/v1779894413/video2_d97cda.mp4' }, //kakek 
  { src: 'https://res.cloudinary.com/db8o82eov/video/upload/v1779082847/video3_cjjpgm.mp4' }, // uti dan keluarga pak anjar
  { src: 'https://res.cloudinary.com/db8o82eov/video/upload/v1779521967/video4_vo0pq3.mp4' }, // dastan jabbar 
  { src: 'assets/videos/video5.mp4' },
  { src: 'assets/videos/video6.mp4' },
  { src: 'assets/videos/video7.mp4' },
  { src: 'https://res.cloudinary.com/db8o82eov/video/upload/v1779507751/video8_vzgm6a.mov' },
  { src: 'https://res.cloudinary.com/db8o82eov/video/upload/v1778906870/video9_uomau5.mp4' },
  { src: 'assets/videos/video10.mp4' },
  { src: 'assets/videos/video11.mp4' },
  { src: 'assets/videos/video12.mp4' },
  { src: '' },
];

let vidIndex = 0;
let familyInited = false;

function initFamily() {
  if (familyInited) return;
  familyInited = true;
  
  buildVideoDots();
  loadVideo(0); 

  document.getElementById('btn-prev-vid').addEventListener('click', () => {
    // Kalau array kosong, cegah error
    if (VIDEOS.length === 0) return;
    vidIndex = (vidIndex - 1 + VIDEOS.length) % VIDEOS.length;
    loadVideo(vidIndex);
  });
  
  document.getElementById('btn-next-vid').addEventListener('click', () => {
    if (VIDEOS.length === 0) return;
    vidIndex = (vidIndex + 1) % VIDEOS.length;
    loadVideo(vidIndex);
  });
  
  // --- PENGAMAN: Cek dulu elemennya ada atau tidak sebelum dipasang event ---
  const btnGift = document.getElementById('btn-gift');
  if (btnGift) {
      btnGift.addEventListener('click', openGift);
  }

  // --- logika kontrol volume musik otomatis (audio ducking) ---
  const vid = document.getElementById('main-video');
  const volSlider = document.getElementById('music-volume-slider');

  vid.addEventListener('play', () => {
      bgaudio.volume = 0.05; 
      if(volSlider) volSlider.value = 0.05;
  });

  vid.addEventListener('pause', () => {
      if (currentState === 4) {
          bgaudio.volume = 0.2;
          if(volSlider) volSlider.value = 0.2;
      }
  });
  
  vid.addEventListener('ended', () => {
      if (currentState === 4) {
          bgaudio.volume = 0.2;
          if(volSlider) volSlider.value = 0.2;
      }
  });
}

function buildVideoDots() {
  const wrap = document.getElementById('video-dots');
  wrap.innerHTML = '';
  
  for (let i = 0; i < VIDEOS.length; i++) {
    const d = document.createElement('div');
    d.className = 'vid-dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => loadVideo(i));
    wrap.appendChild(d);
  }
}

function loadVideo(i) {
  if (VIDEOS.length === 0) return; 
  
  vidIndex = i;
  const vid = document.getElementById('main-video');
  const giftOverlay = document.getElementById('gift-overlay');
  const vidControls = document.getElementById('custom-vid-controls'); // Ambil panel netflix
  
  // Nyalakan titik navigasi
  document.querySelectorAll('.vid-dot').forEach((d, idx) => d.classList.toggle('active', idx === i));

  // Matikan dan reset video bawaan
  vid.pause();
  vid.currentTime = 0;
  
  // CEK APAKAH VIDEO SENGAJA DIKOSONGKAN
  if (VIDEOS[i].src === '' || !VIDEOS[i].src) {
      vid.removeAttribute('src'); 
      vid.load(); 
      
      if (vidControls) vidControls.style.display = 'none'; 
  } else {
      // --- TRIK CACHE BUSTING ---
      // Menambahkan buntut ?v=1.0 agar browser dipaksa download ulang
      vid.src = VIDEOS[i].src + "?v=" + WEB_VERSION;
      
      vid.play().catch(() => {});
      
      if (vidControls) vidControls.style.display = 'flex'; 
  }
  
  // Logika memunculkan Emoji Kado (🎁) KHUSUS di urutan paling terakhir
  const isLast = (i === VIDEOS.length - 1);
  
  if (giftOverlay) {
      giftOverlay.style.display = isLast ? 'flex' : 'none';
  }
  
  vid.onended = () => {
    if (isLast && giftOverlay) {
        giftOverlay.style.display = 'flex';
    }
  };
}

// Tambahan sedikit revisi di fungsi openGift biar animasinya nyambung ke gambar PNG
function openGift() {
  const overlay = document.getElementById('gift-open-overlay');
  overlay.style.display = 'flex';
  
  const explode = document.getElementById('gift-explode-img');
  if(explode) {
      explode.style.animation = 'none';
      void explode.offsetWidth; // reset animasi css
      explode.style.animation = 'giftPop 0.6s ease';
  }
  
  overlay.addEventListener('click', () => overlay.style.display = 'none', { once: true });
}

// ── STATE 5: PHOTOBOOTH ───────────────────────────────────────
/*
  FRAMES CONFIG — fill in hole coords after you measure your actual PNG assets.
  holes: array of { x, y, w, h } in CANVAS pixels (at the frame's native size).
  frameW / frameH: native pixel dimensions of the frame image.
*/
const FRAMES = [
  {
    src: 'assets/images/frame1.png',
    thumbSrc: 'assets/images/thumb-frame1.png',
    frameW: 252,
    frameH: 492,
    holes: [
      { x: 39, y: 10,  w: 163, h: 128 },
      { x: 39, y: 144, w: 163, h: 128 },
      { x: 39, y: 281, w: 163, h: 128 },
    ]
  },
  {
    src: 'assets/images/frame2.png',
    thumbSrc: 'assets/images/thumb-frame2.png',
    frameW: 273,
    frameH: 809,
    holes: [
      { x: 31, y: 212, w: 215, h: 128 },
      { x: 31, y: 352, w: 215, h: 128 },
      { x: 31, y: 492, w: 215, h: 128 },
    ]
  },
  {
    src: 'assets/images/frame3.png',
    thumbSrc: 'assets/images/thumb-frame3.png',
    frameW: 510,
    frameH: 916,
    holes: [
      { x: 151, y: 292, w: 173, h: 127 },
      { x: 151, y: 439, w: 173, h: 127 },
      { x: 151, y: 586, w: 173, h: 127 },
      { x: 151, y: 723, w: 173, h: 127 }, // Tambahan foto ke-4
    ]
  },
];

let selectedFrame = 0;
let webcamStream = null;
let capturedImages = [];  // 3 ImageData / dataURLs
let photoboothInited = false;
let shootingInProgress = false;

function initPhotobooth() {
  if (photoboothInited) return;
  photoboothInited = true;
  buildFrameThumbs();
  document.getElementById('btn-start').addEventListener('click', startCapture);
  document.getElementById('btn-print').addEventListener('click', printResult);
  // Tambahkan event listener ini di luar fungsi (di kumpulan event listener photobooth)
  document.getElementById('btn-retake').addEventListener('click', () => {
  // Sembunyikan layar hasil, kembali ke layar pemilihan frame
  document.getElementById('pb-result').style.display = 'none';
  document.getElementById('pb-select').style.display = 'block';
  
  // Bersihkan pilihan yang lama
  document.querySelectorAll('.frame-thumb').forEach(t => t.classList.remove('selected'));
  document.querySelectorAll('.pb-frame-dot').forEach(d => d.classList.remove('active'));
  selectedFrame = null;
  capturedImages = [];
});
}

function buildFrameThumbs() {
  const wrap = document.getElementById('frame-thumbnails');
  wrap.innerHTML = '';
  
  selectedFrame = null; 

  FRAMES.forEach((f, i) => {
    // Bikin pembungkus buat frame dan titik
    const bundle = document.createElement('div');
    bundle.className = 'frame-bundle';
    bundle.addEventListener('click', () => selectFrame(i));

    // Masukin Frame
    const div = document.createElement('div');
    div.className = 'frame-thumb'; 
    const img = document.createElement('img');
    img.src = f.thumbSrc || f.src; 
    div.appendChild(img);
    bundle.appendChild(div);

    // Masukin Titik
    const d = document.createElement('div');
    d.className = 'pb-frame-dot'; 
    bundle.appendChild(d);

    wrap.appendChild(bundle);
  });
}

function selectFrame(i) {
  selectedFrame = i;
  document.querySelectorAll('.frame-thumb').forEach((t, idx) => t.classList.toggle('selected', idx === i));
  document.querySelectorAll('.pb-frame-dot').forEach((d, idx) => d.classList.toggle('active', idx === i));
  
  document.getElementById('pb-select').style.display = 'none';
  document.getElementById('pb-camera').style.display = 'block';
  document.getElementById('pb-result').style.display = 'none';
  
  const frame = FRAMES[i];
  document.getElementById('frame-preview-img').src = frame.src;
  
  // WAJIB ADA: Reset dan Setel ukuran Canvas Live Preview agar sejajar dengan PNG
  const liveCanvas = document.getElementById('live-preview-canvas');
  if(liveCanvas) {
      liveCanvas.width = frame.frameW;
      liveCanvas.height = frame.frameH;
      liveCanvas.getContext('2d').clearRect(0, 0, liveCanvas.width, liveCanvas.height);
  }

  startWebcam();
}

async function startWebcam() {
  try {
    webcamStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
    document.getElementById('webcam').srcObject = webcamStream;
  } catch (e) {
    alert('Cannot access camera: ' + e.message);
  }
}

async function startCapture() {
  if (shootingInProgress) return;
  shootingInProgress = true;
  capturedImages = [];
  const webcam = document.getElementById('webcam');
  const countdownEl = document.getElementById('countdown-overlay');
  const flashEl = document.getElementById('flash-overlay');

  const frame = FRAMES[selectedFrame];
  const totalShots = frame.holes.length; // KUNCI: Hitung otomatis jumlah lubang (3 atau 4)

  for (let shot = 0; shot < totalShots; shot++) {
    // Countdown 3,2,1
    for (let c = 3; c >= 1; c--) {
      countdownEl.textContent = c;
      countdownEl.style.opacity = '1';
      countdownEl.style.animation = 'none';
      void countdownEl.offsetWidth;
      countdownEl.style.animation = 'countdownPop 0.4s ease';
      await sleep(900);
    }
    countdownEl.style.opacity = '0';

    // Flash
    flashEl.style.opacity = '1';
    await sleep(120);
    flashEl.style.opacity = '0';

    // Capture frame dari webcam
    const offscreen = document.createElement('canvas');
    offscreen.width = webcam.videoWidth || 640;
    offscreen.height = webcam.videoHeight || 480;
    offscreen.getContext('2d').drawImage(webcam, 0, 0);
    
    const dataURL = offscreen.toDataURL('image/jpeg', 0.95);
    capturedImages.push(dataURL);

    // Memicu gambar masuk ke Live Preview di kiri!
    updateLivePreview(shot, dataURL);

    await sleep(500); // Jeda sebelum foto berikutnya
  }

  shootingInProgress = false;
  stopWebcam();
  renderResult();
}

function stopWebcam() {
  if (webcamStream) webcamStream.getTracks().forEach(t => t.stop());
}

function renderResult() {
  document.getElementById('pb-camera').style.display = 'none';
  document.getElementById('pb-result').style.display = 'block';

  const frame = FRAMES[selectedFrame];
  const canvas = document.getElementById('result-canvas');
  canvas.width = frame.frameW;
  canvas.height = frame.frameH;
  const ctx = canvas.getContext('2d');

  const frameImg = new Image();
  // Gunakan 'async' agar JS mau menunggu foto masuk dulu!
  frameImg.onload = async () => {
    
    // 1. Gambar semua jepretan webcam terlebih dahulu
    for(let i = 0; i < capturedImages.length; i++) {
      if (i >= frame.holes.length) continue;
      const hole = frame.holes[i];
      
      // Promise: Paksa sistem menunda sampai foto selesai dimuat
      await new Promise(resolve => {
        const camImg = new Image();
        camImg.onload = () => {
          const destRatio = hole.w / hole.h;
          const srcRatio  = camImg.width / camImg.height;
          let sx, sy, sW, sH;
          
          if (srcRatio > destRatio) {
            sH = camImg.height; sW = sH * destRatio;
            sx = (camImg.width - sW) / 2; sy = 0;
          } else {
            sW = camImg.width; sH = sW / destRatio;
            sx = 0; sy = (camImg.height - sH) / 2;
          }
          // Potong dan pasangkan persis di ukuran "hole"
          ctx.drawImage(camImg, sx, sy, sW, sH, hole.x, hole.y, hole.w, hole.h);
          resolve(); 
        };
        camImg.src = capturedImages[i];
      });
    }

    // 2. SETELAH semua foto masuk, BARU gambar Frame transparan di lapisan teratas! (Z-INDEX FIX)
    ctx.drawImage(frameImg, 0, 0, frame.frameW, frame.frameH);
  };
  frameImg.src = frame.src;
}

function printResult() {
  const canvas = document.getElementById('result-canvas');
  
  // Ubah isi canvas menjadi format gambar PNG resolusi tinggi
  const dataURL = canvas.toDataURL('image/png', 1.0);

  // --- FITUR 1: AUTO DOWNLOAD OTOMATIS ---
  const downloadLink = document.createElement('a');
  downloadLink.download = 'Photobooth-Shamyla.png'; // Nama file otomatis
  downloadLink.href = dataURL;
  downloadLink.click(); // Eksekusi klik otomatis untuk download

  // --- FITUR 2: BUKA TAB BARU DENGAN BACKGROUND RAPI (NGGAK HITAM) ---
  const newWindow = window.open();
  newWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Photobooth Result</title>
        <style>
          body {
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #FFE7EE; /* Tema warna pink kamu */
            overflow: hidden;
          }
          img {
            max-width: 90vw;
            max-height: 90vh;
            object-fit: contain;
            border-radius: 20px;
            box-shadow: 0 15px 40px rgba(0,0,0,0.3);
          }
        </style>
      </head>
      <body>
        <img src="${dataURL}" alt="Hasil Photobooth">
      </body>
    </html>
  `);
}

// FUNGSI BARU: Nembak foto langsung ke preview saat proses jepret
function updateLivePreview(shotIndex, dataURL) {
  const frame = FRAMES[selectedFrame];
  if (shotIndex >= frame.holes.length) return; // Cegah error kalau kelebihan jepret
  
  const liveCanvas = document.getElementById('live-preview-canvas');
  const ctx = liveCanvas.getContext('2d');
  const hole = frame.holes[shotIndex];
  
  const camImg = new Image();
  camImg.onload = () => {
    const destRatio = hole.w / hole.h;
    const srcRatio  = camImg.width / camImg.height;
    let sx, sy, sW, sH;
    
    if (srcRatio > destRatio) {
      sH = camImg.height; sW = sH * destRatio;
      sx = (camImg.width - sW) / 2; sy = 0;
    } else {
      sW = camImg.width; sH = sW / destRatio;
      sx = 0; sy = (camImg.height - sH) / 2;
    }
    
    // Gambar persis di koordinat "hole"
    ctx.drawImage(camImg, sx, sy, sW, sH, hole.x, hole.y, hole.w, hole.h);
  };
  camImg.src = dataURL;
}

// Back to frame select from camera
document.getElementById('pb-camera') && (() => {
  // Keyboard ESC to go back
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && currentState === 5) {
      stopWebcam();
      document.getElementById('pb-select').style.display = 'block';
      document.getElementById('pb-camera').style.display = 'none';
      document.getElementById('pb-result').style.display = 'none';
    }
  });
})();


// =========================================================================
// TARUH KODE INI DI BAGIAN PALING BAWAH FILE SCRIPT.JS KAMU
// =========================================================================

// ── audio & music player ─────────────────────────────────────
// fungsi untuk me-restart halaman web (sekarang pakai ID baru)
function restartapp() { location.reload(); }
const btnWebRestart = document.getElementById('btn-web-restart');
if (btnWebRestart) {
    btnWebRestart.addEventListener('click', restartapp);
}

// ... (kode inisialisasi musicplayer dkk biarkan sama persis di bawahnya)
// inisialisasi elemen pemutar musik dari html
const musicplayer = document.getElementById('global-music-player');
const progressbarfill = document.getElementById('music-progress-fill');
const progresswrap = document.getElementById('music-progress-wrap');

// buat objek audio utama agar lagunya bisa diulang-ulang
let bgaudio = new Audio();
bgaudio.loop = true;

// fungsi pengatur lagu dan volume tiap pindah halaman
// PASTIKAN HURUF BESAR/KECILNYA SEPERTI INI:
// fungsi pengatur lagu dan volume tiap pindah halaman
// fungsi pengatur lagu dan volume tiap pindah halaman
function manageAudioForState(n) {
  const volSlider = document.getElementById('music-volume-slider');
  const btnPlay = document.getElementById('btn-music-play');
  
  // PAKSA STOP LAGU SEBELUMNYA BIAR GAK NUMPUK
  if (typeof bgaudio !== 'undefined') {
      bgaudio.pause();
      bgaudio.currentTime = 0;
  }
  
  if (n === 3) {
    bgaudio.src = 'assets/audio/lagu-home.mp3'; 
    bgaudio.volume = 0.5; 
    if(volSlider) volSlider.value = 0.5; 
    
    bgaudio.play().then(() => {
        if(btnPlay) btnPlay.textContent = '⏸'; 
    }).catch(() => console.log('autoplay dicegah browser'));
    
    if (musicplayer) musicplayer.style.display = 'flex';
  }
  else if (n === 4) {
    bgaudio.src = 'assets/audio/lagu-family.mp3'; 
    bgaudio.volume = 0.08; 
    if(volSlider) volSlider.value = 0.08; 
    
    bgaudio.play().then(() => {
        if(btnPlay) btnPlay.textContent = '⏸';
    }).catch(() => console.log('autoplay dicegah browser'));
    
    if (musicplayer) musicplayer.style.display = 'flex';
  }
  else {
    if(btnPlay) btnPlay.textContent = '▶️'; 
    if (musicplayer) musicplayer.style.display = 'none';
  }
}

// logika tombol mute dan unmute musik
const btnMute = document.getElementById('btn-music-mute');
if(btnMute) {
  btnMute.addEventListener('click', (e) => {
    bgaudio.muted = !bgaudio.muted;
    e.target.textContent = bgaudio.muted ? '🔇' : '🔊';
    
    if (bgaudio.muted) {
      e.target.classList.add('is-muted');
    } else {
      e.target.classList.remove('is-muted');
    }
  });
}

// logika tombol play atau stop
const btnPlay = document.getElementById('btn-music-play');
if(btnPlay) {
  btnPlay.addEventListener('click', () => {
    if (bgaudio.paused) {
      bgaudio.play();
      btnPlay.textContent = '⏸'; // ganti ke ikon pause
    } else {
      bgaudio.pause();
      btnPlay.textContent = '▶️'; // ganti ke ikon play
    }
  });
}

// logika slider volume
const volSlider = document.getElementById('music-volume-slider');
if(volSlider) {
  volSlider.addEventListener('input', (e) => {
    bgaudio.volume = e.target.value;
    
    // kalau lagu lagi di-mute, otomatis nyalain suaranya pas slider digeser
    if(bgaudio.muted) {
      bgaudio.muted = false;
      const btnMute = document.getElementById('btn-music-mute');
      if(btnMute) {
        btnMute.textContent = '🔊';
        btnMute.classList.remove('is-muted');
      }
    }
  });
}

// logika tombol restart lagu
const btnRestart = document.getElementById('btn-music-restart');
if(btnRestart) {
  btnRestart.addEventListener('click', () => {
    bgaudio.currentTime = 0; 
    bgaudio.play();
  });
}

// logika tombol mundur 10 detik
const btnRewind = document.getElementById('btn-music-rewind');
if(btnRewind) {
  btnRewind.addEventListener('click', () => {
    bgaudio.currentTime = Math.max(0, bgaudio.currentTime - 10);
  });
}

// logika tombol maju 10 detik
const btnForward = document.getElementById('btn-music-forward');
if(btnForward) {
  btnForward.addEventListener('click', () => {
    bgaudio.currentTime = Math.min(bgaudio.duration, bgaudio.currentTime + 10);
  });
}

// sistem progress bar 
bgaudio.addEventListener('timeupdate', () => {
  if (bgaudio.duration && progressbarfill) {
    const percentage = (bgaudio.currentTime / bgaudio.duration) * 100;
    progressbarfill.style.width = percentage + '%';
  }
});

if(progresswrap) {
  progresswrap.addEventListener('click', (e) => {
    const rect = progresswrap.getBoundingClientRect();
    const clickx = e.clientX - rect.left;
    const percentage = clickx / rect.width;
    bgaudio.currentTime = percentage * bgaudio.duration;
  });
}

// =========================================================================
// SFX CLICK UNTUK TOMBOL BOUNCY
// =========================================================================
const clickSfx = new Audio('assets/audio/click.mp3');
clickSfx.volume = 0.8; // Sesuaikan volume (0.0 sampai 1.0)

// Cari semua tombol yang punya class bouncy-btn
document.querySelectorAll('.bouncy-btn').forEach(btn => {
  // Gunakan 'mousedown' agar suaranya langsung keluar sebelum jari diangkat
  btn.addEventListener('mousedown', () => {
    clickSfx.currentTime = 0; // Reset ke detik 0 biar bisa diklik cepat berkali-kali
    clickSfx.play().catch(() => console.log('Interaksi user diperlukan untuk play audio'));
  });
});



// =========================================================================
// LOGIKA CUSTOM VIDEO CONTROLLER (NETFLIX STYLE)
// =========================================================================
const mainVid = document.getElementById('main-video');
const vidContainer = document.getElementById('vid-container');
const vidControls = document.getElementById('custom-vid-controls');
const btnVidPlay = document.getElementById('btn-vid-play');
const btnVidRew = document.getElementById('btn-vid-rewind');
const btnVidFwd = document.getElementById('btn-vid-forward');
const btnVidMute = document.getElementById('btn-vid-mute');
const vidVolSlider = document.getElementById('vid-volume-slider');
const vidProgWrap = document.getElementById('vid-progress-wrap');
const vidProgFill = document.getElementById('vid-progress-fill');
const vidTime = document.getElementById('vid-time');

let hideControlsTimeout;

// Fungsi mengubah detik jadi format 00:00
function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
}

// SENSOR AUTOHIDE 1 DETIK
function showControls() {
    vidControls.classList.remove('hide');
    clearTimeout(hideControlsTimeout);
    // Hitung mundur 1 detik (1000ms) untuk menyembunyikan
    hideControlsTimeout = setTimeout(() => {
        if (!mainVid.paused) { 
            vidControls.classList.add('hide');
        }
    }, 1000);
}

// Pas mouse gerak di atas video, munculkan controller
if(vidContainer) {
    vidContainer.addEventListener('mousemove', showControls);
    vidContainer.addEventListener('mouseleave', () => {
        if (!mainVid.paused) vidControls.classList.add('hide');
    });
}

// TOMBOL PLAY/PAUSE & KLIK LAYAR
function toggleVidPlay() {
    if (mainVid.paused) mainVid.play();
    else mainVid.pause();
}
if(btnVidPlay) btnVidPlay.addEventListener('click', toggleVidPlay);
if(mainVid) mainVid.addEventListener('click', toggleVidPlay);

if(mainVid) {
    mainVid.addEventListener('play', () => btnVidPlay.textContent = '⏸');
    mainVid.addEventListener('pause', () => {
        btnVidPlay.textContent = '▶️';
        showControls(); // Kalau di-pause, controller nampil terus
    });

    // MAJU MUNDUR 10 DETIK
    if(btnVidRew) btnVidRew.addEventListener('click', () => mainVid.currentTime = Math.max(0, mainVid.currentTime - 10));
    if(btnVidFwd) btnVidFwd.addEventListener('click', () => mainVid.currentTime = Math.min(mainVid.duration, mainVid.currentTime + 10));

    // UPDATE PROGRESS BAR & WAKTU
    mainVid.addEventListener('timeupdate', () => {
        if (mainVid.duration) {
            const pct = (mainVid.currentTime / mainVid.duration) * 100;
            if(vidProgFill) vidProgFill.style.width = pct + '%';
            if(vidTime) vidTime.textContent = formatTime(mainVid.currentTime) + " / " + formatTime(mainVid.duration);
        }
    });

    mainVid.addEventListener('loadedmetadata', () => {
         if(vidTime) vidTime.textContent = "00:00 / " + formatTime(mainVid.duration);
    });
}

// KLIK PROGRESS BAR UNTUK CECEP (SEEKING)
if(vidProgWrap) {
    vidProgWrap.addEventListener('click', (e) => {
        const rect = vidProgWrap.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        mainVid.currentTime = pos * mainVid.duration;
    });
}

// KONTROL VOLUME VIDEO
if(vidVolSlider) {
    vidVolSlider.addEventListener('input', (e) => {
        mainVid.volume = e.target.value;
        mainVid.muted = e.target.value === "0";
        if(btnVidMute) btnVidMute.textContent = mainVid.muted ? '🔇' : '🔊';
    });
}
if(btnVidMute) {
    btnVidMute.addEventListener('click', () => {
        mainVid.muted = !mainVid.muted;
        btnVidMute.textContent = mainVid.muted ? '🔇' : '🔊';
        if (!mainVid.muted && mainVid.volume === 0) {
            mainVid.volume = 0.5;
            vidVolSlider.value = 0.5;
        } else {
            vidVolSlider.value = mainVid.muted ? 0 : mainVid.volume;
        }
    });
}


// ── HELPERS ───────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }



