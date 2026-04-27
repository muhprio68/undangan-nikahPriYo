// 1. Inisialisasi AOS
AOS.init({ duration: 1000, once: false, mirror: true });

// 2. Logika Nama Tamu
const urlParams = new URLSearchParams(window.location.search);
const namaTamu = urlParams.get('to') || urlParams.get('nama');
if (namaTamu) { document.getElementById('nama-tamu').innerText = namaTamu; }

// 3. Kontrol Musik & Buka Undangan
const btnBuka = document.getElementById('btn-buka');
const music = document.getElementById('bg-music');
const musicToggle = document.getElementById('musicToggle');

btnBuka.addEventListener('click', () => {
    music.play();
    document.getElementById('cover-screen').classList.add('buka-transisi');
    document.getElementById('isi-undangan').style.display = 'block';
    musicToggle.style.display = 'flex';
    setTimeout(() => { 
        document.getElementById('cover-screen').style.display = 'none'; 
        AOS.refresh(); 
    }, 1200);
});

// 4. Logika Ucapan API & Counter (Copy sisanya di sini)