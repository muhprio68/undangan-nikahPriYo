// =====================================================
// INISIALISASI AOS
// =====================================================
AOS.init({ duration: 1000, once: false, mirror: true });

// =====================================================
// PRELOADER
// =====================================================
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.classList.add('preloader-hide');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 600);
    }, 1800); // tampil 1.8 detik, cukup buat resources keburu load
});

// =====================================================
// SCROLL PROGRESS BAR
// =====================================================
window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    document.getElementById('scroll-progress-bar').style.width = progress + '%';
});

// =====================================================
// TYPEWRITER EFFECT - "The Wedding Of"
// =====================================================
const typewriterText = 'The Wedding Of';
let twIndex = 0;

function typeWriter() {
    const el = document.getElementById('typewriter-label');
    if (!el) return;
    if (twIndex < typewriterText.length) {
        el.textContent += typewriterText.charAt(twIndex);
        twIndex++;
        setTimeout(typeWriter, 100);
    } else {
        // sembunyikan cursor setelah selesai
        const cursor = document.querySelector('.typewriter-cursor');
        if (cursor) {
            setTimeout(() => cursor.style.display = 'none', 1500);
        }
    }
}

// Mulai typewriter setelah preloader kelar (~2 detik)
setTimeout(typeWriter, 2000);

// =====================================================
// NANGKEP NAMA TAMU DARI URL
// =====================================================
const urlParams = new URLSearchParams(window.location.search);
const namaTamu = urlParams.get('to') || urlParams.get('nama');

if (namaTamu) {
    document.getElementById('nama-tamu').innerText = namaTamu;
    document.getElementById('inputNama').value = namaTamu;
}

// =====================================================
// PETAL / KELOPAK BUNGA EFFECT DI COVER
// =====================================================
const canvas = document.getElementById('petal-canvas');
const ctx = canvas.getContext('2d');
let petals = [];
let petalAnimRunning = false;
let petalAnimId = null;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Gambar kelopak dengan canvas (pure CSS shape, tanpa img eksternal)
function drawPetal(x, y, size, rotation, opacity) {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Kelopak bunga: ellips dengan sedikit curve
    ctx.beginPath();
    ctx.scale(1, 1.6);
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fillStyle = '#e8c4c4';
    ctx.fill();

    // Aksen tengah
    ctx.beginPath();
    ctx.scale(0.5, 0.5);
    ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#f2d5d5';
    ctx.fill();

    ctx.restore();
}

function createPetal() {
    return {
        x: Math.random() * canvas.width,
        y: -20,
        size: Math.random() * 6 + 4,
        speedY: Math.random() * 1.5 + 0.8,
        speedX: Math.random() * 1 - 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.04,
        opacity: Math.random() * 0.5 + 0.3,
        sway: Math.random() * 0.5,
        swayOffset: Math.random() * Math.PI * 2,
        tick: 0,
    };
}

function animatePetals() {
    if (!petalAnimRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Tambah kelopak baru secara berkala
    if (petals.length < 35 && Math.random() < 0.15) {
        petals.push(createPetal());
    }

    petals.forEach((p, i) => {
        p.tick++;
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.tick * 0.03 + p.swayOffset) * p.sway;
        p.rotation += p.rotationSpeed;

        drawPetal(p.x, p.y, p.size, p.rotation, p.opacity);

        // Hapus kalau sudah di luar layar
        if (p.y > canvas.height + 20) {
            petals.splice(i, 1);
        }
    });

    petalAnimId = requestAnimationFrame(animatePetals);
}

function startPetals() {
    petalAnimRunning = true;
    animatePetals();
}

function stopPetals() {
    petalAnimRunning = false;
    if (petalAnimId) cancelAnimationFrame(petalAnimId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    petals = [];
}

// Mulai petal setelah preloader selesai
setTimeout(startPetals, 2000);

// =====================================================
// KONTROL COVER & AUDIO
// =====================================================
const btnBuka = document.getElementById('btn-buka');
const music = document.getElementById('bg-music');
const musicToggle = document.getElementById('musicToggle');
const musicIcon = document.getElementById('musicIcon');

btnBuka.addEventListener('click', () => {
    music.play();
    stopPetals(); // hentikan petal saat cover ditutup

    document.getElementById('cover-screen').classList.add('buka-transisi');
    document.getElementById('isi-undangan').style.display = 'block';
    musicToggle.style.display = 'flex';

    setTimeout(() => {
        document.getElementById('cover-screen').style.display = 'none';
        AOS.refresh();
    }, 1200);
});

let isPlaying = true;
musicToggle.onclick = () => {
    if (isPlaying) {
        music.pause();
        musicIcon.classList.remove('spin');
        musicToggle.style.opacity = '0.6';
    } else {
        music.play();
        musicIcon.classList.add('spin');
        musicToggle.style.opacity = '1';
    }
    isPlaying = !isPlaying;
};

document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
        music.pause();
    } else {
        music.play().catch(() => {});
    }
});

// =====================================================
// COUNTDOWN WAKTU
// =====================================================
const targetDate = new Date('June 7, 2026 07:00:00').getTime();
const countdownInterval = setInterval(() => {
    const now = new Date().getTime();
    const distance = targetDate - now;
    if (distance < 0) {
        clearInterval(countdownInterval);
        ['hari','jam','menit','detik'].forEach(id => {
            document.getElementById(id).innerText = '00';
        });
        return;
    }
    document.getElementById('hari').innerText = Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
    document.getElementById('jam').innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
    document.getElementById('menit').innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
    document.getElementById('detik').innerText = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0');
}, 1000);

// =====================================================
// GALERI FOTO + SWIPE GESTURE
// =====================================================
let currentImgIndex = 0;
const galleryImages = [
    'assets/img/priyo1.jpg', 'assets/img/priyo2.jpg', 'assets/img/priyo3.jpg',
    'assets/img/priyo4.jpg', 'assets/img/priyo5.png', 'assets/img/priyo6.jpg', 'assets/img/priyo7.jpg'
];

function openFullView(src) {
    const fileName = src.split('/').pop();
    currentImgIndex = galleryImages.findIndex(img => img.includes(fileName));
    if (currentImgIndex === -1) currentImgIndex = 0;
    document.getElementById('fullViewImg').src = galleryImages[currentImgIndex];
    document.getElementById('fullViewOverlay').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeFullView() {
    document.getElementById('fullViewOverlay').style.display = 'none';
    document.body.style.overflow = '';
}

function changeImg(dir) {
    currentImgIndex += dir;
    if (currentImgIndex >= galleryImages.length) currentImgIndex = 0;
    if (currentImgIndex < 0) currentImgIndex = galleryImages.length - 1;

    const img = document.getElementById('fullViewImg');
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.2s';
    setTimeout(() => {
        img.src = galleryImages[currentImgIndex];
        img.style.opacity = '1';
    }, 200);
}

// Swipe gesture untuk galeri fullview
let touchStartX = 0;
let touchStartY = 0;

document.getElementById('fullViewOverlay').addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.getElementById('fullViewOverlay').addEventListener('touchend', (e) => {
    const deltaX = e.changedTouches[0].screenX - touchStartX;
    const deltaY = e.changedTouches[0].screenY - touchStartY;

    // Hanya proses swipe horizontal (bukan scroll vertikal)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX < 0) {
            changeImg(1);  // swipe kiri = next
        } else {
            changeImg(-1); // swipe kanan = prev
        }
    }
}, { passive: true });

// Keyboard navigation untuk galeri
document.addEventListener('keydown', (e) => {
    if (document.getElementById('fullViewOverlay').style.display === 'block') {
        if (e.key === 'ArrowRight') changeImg(1);
        if (e.key === 'ArrowLeft') changeImg(-1);
        if (e.key === 'Escape') closeFullView();
    }
});

// =====================================================
// WEDDING GIFT & SALIN DATA
// =====================================================
function toggleGift() {
    const container = document.getElementById('giftContainer');
    const btn = document.getElementById('btnToggleGift');

    if (container.style.display === 'none') {
        container.style.display = 'block';
        container.classList.add('show-gift');
        btn.innerHTML = '<i class="bi bi-eye-slash-fill me-2"></i> Sembunyikan Hadiah';
        btn.classList.remove('btn-abu-tipis');
        btn.classList.add('btn-vintage');
        setTimeout(() => AOS.refresh(), 500);
    } else {
        container.style.display = 'none';
        container.classList.remove('show-gift');
        btn.innerHTML = '<i class="bi bi-gift-fill me-2"></i> Kirim Hadiah';
        btn.classList.remove('btn-vintage');
        btn.classList.add('btn-abu-tipis');
    }
}

function salinData(elementId, type) {
    const textToCopy = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('✅ ' + type + ' berhasil disalin!', 'success');
    }).catch(() => {
        showToast('❌ Gagal menyalin, coba manual ya.', 'error');
    });
}

// =====================================================
// TOAST NOTIFICATION
// =====================================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');

    const toast = document.createElement('div');
    toast.className = 'toast-notif toast-' + type;
    toast.innerHTML = message;
    container.appendChild(toast);

    // Trigger animasi masuk
    setTimeout(() => toast.classList.add('toast-show'), 10);

    // Hapus setelah 3.5 detik
    setTimeout(() => {
        toast.classList.remove('toast-show');
        toast.classList.add('toast-hide');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// =====================================================
// CONFETTI SUKSES KIRIM UCAPAN
// =====================================================
function tembakKonfeti() {
    // Konfeti dari kiri dan kanan bawah
    confetti({
        particleCount: 80,
        spread: 70,
        origin: { x: 0.3, y: 0.9 },
        colors: ['#8C9A83', '#f2c4ce', '#fff', '#e8d5b7', '#717d69'],
    });
    confetti({
        particleCount: 80,
        spread: 70,
        origin: { x: 0.7, y: 0.9 },
        colors: ['#8C9A83', '#f2c4ce', '#fff', '#e8d5b7', '#717d69'],
    });
}

// =====================================================
// API UCAPAN & DOA
// =====================================================
const apiUrl = '/api/ucapan';
let semuaUcapan = [];
let halamanSaatIni = 1;
const itemPerHalaman = 3;

async function fetchUcapan() {
    // Tampilkan skeleton, sembunyikan list
    document.getElementById('skeletonUcapan').style.display = 'block';
    document.getElementById('daftarUcapan').style.display = 'none';

    try {
        const response = await fetch(apiUrl);
        semuaUcapan = await response.json();
        if (!Array.isArray(semuaUcapan)) semuaUcapan = [];
        halamanSaatIni = 1;
        renderUcapan();
    } catch (error) {
        console.error('Gagal load ucapan:', error);
        semuaUcapan = [];
        renderUcapan();
    }
}

function formatTanggal(tglStr) {
    if (!tglStr) return 'Baru saja';
    const date = new Date(tglStr);
    if (isNaN(date)) return tglStr;
    const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('id-ID', options).replace(/\./g, ':');
}

function renderUcapan() {
    const wadah = document.getElementById('daftarUcapan');
    const wadahPagination = document.getElementById('wadahPagination');

    // Sembunyikan skeleton, tampilkan list
    document.getElementById('skeletonUcapan').style.display = 'none';
    wadah.style.display = 'block';
    wadah.innerHTML = '';

    if (!semuaUcapan || semuaUcapan.length === 0) {
        wadah.innerHTML = '<p class="text-muted small text-center mt-4">Belum ada ucapan. Jadilah yang pertama! 🌸</p>';
        wadahPagination.classList.add('d-none');
        return;
    }

    const totalHalaman = Math.ceil(semuaUcapan.length / itemPerHalaman);
    const indexMulai = (halamanSaatIni - 1) * itemPerHalaman;
    const dataTampil = semuaUcapan.slice(indexMulai, indexMulai + itemPerHalaman);

    dataTampil.forEach(item => {
        const inisial = (item.nama ? item.nama.charAt(0) : 'A').toUpperCase();
        const namaEscaped = escapeHtml(item.nama || '');
        const pesanEscaped = escapeHtml(item.pesan || '');

        wadah.innerHTML += `
            <div class="d-flex mb-3 p-3 bg-white rounded-4 shadow-sm border" style="border-color: rgba(140, 154, 131, 0.2) !important;">
                <div class="flex-shrink-0">
                    <div class="rounded-circle d-flex align-items-center justify-content-center border shadow-sm" 
                         style="width: 45px; height: 45px; font-weight: bold; font-size: 1.3rem; color: #333; background-color: #f8f9fa; font-family: 'Playfair Display', Georgia, serif;">
                        ${inisial}
                    </div>
                </div>
                <div class="ms-3 flex-grow-1">
                    <h6 class="mb-0 fw-bold" style="color: var(--warna-teks);">${namaEscaped}</h6>
                    <small class="text-muted" style="font-size: 0.7rem; display: block; margin-bottom: 8px;">
                        <i class="bi bi-clock me-1"></i> ${formatTanggal(item.created_at)}
                    </small>
                    <p class="mb-0 text-muted small" style="line-height: 1.5;">${pesanEscaped}</p>
                </div>
            </div>
        `;
    });

    wadahPagination.classList.remove('d-none');
    document.getElementById('infoHalaman').innerText = `Hal ${halamanSaatIni} / ${totalHalaman}`;
    document.getElementById('btnPrev').disabled = (halamanSaatIni === 1);
    document.getElementById('btnNext').disabled = (halamanSaatIni === totalHalaman);
}

// Escape HTML untuk keamanan tampilan (bukan sanitasi input, itu di backend)
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function gantiHalaman(arah) {
    halamanSaatIni += arah;
    renderUcapan();
}

document.getElementById('formUcapan').addEventListener('submit', async function (e) {
    e.preventDefault();

    const nama = document.getElementById('inputNama').value.trim();
    const pesan = document.getElementById('inputPesan').value.trim();

    // Validasi tidak boleh kosong setelah trim
    if (!nama) {
        showToast('⚠️ Nama tidak boleh kosong!', 'warning');
        document.getElementById('inputNama').focus();
        return;
    }
    if (!pesan) {
        showToast('⚠️ Ucapan tidak boleh kosong!', 'warning');
        document.getElementById('inputPesan').focus();
        return;
    }

    const btn = document.getElementById('btnKirim');
    btn.innerHTML = 'Mengirim... <span class="spinner-border spinner-border-sm" role="status"></span>';
    btn.disabled = true;

    const payload = { nama, pesan };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            document.getElementById('inputNama').value = '';
            document.getElementById('inputPesan').value = '';

            // Isi ulang nama tamu dari URL kalau ada
            if (namaTamu) document.getElementById('inputNama').value = namaTamu;

            showToast('🎉 Ucapan berhasil terkirim! Terima kasih 🌸', 'success');
            tembakKonfeti();
            fetchUcapan();
        } else {
            showToast('❌ Gagal kirim pesan, coba lagi ya!', 'error');
        }
    } catch (error) {
        showToast('❌ Koneksi bermasalah!', 'error');
    } finally {
        btn.innerHTML = 'Kirim Pesan';
        btn.disabled = false;
    }
});

// =====================================================
// INITIAL LOAD
// =====================================================
window.addEventListener('DOMContentLoaded', fetchUcapan);