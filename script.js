// --- CONFIGURACIÓN DEL TIEMPO ---
// NOTA: Para probar ahora, dejamos esto así (Fecha Actual). 
// Para el lanzamiento real, cambia a: const targetDate = new Date(2025, 10, 28, 15, 0, 0);
const targetDate = new Date().getTime() + 10000; 

gsap.registerPlugin(ScrollTrigger);

// 1. CONTADOR
function updateTimer() {
    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
        unlockExperience();
        return;
    }

    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('hours').innerText = h < 10 ? '0' + h : h;
    document.getElementById('minutes').innerText = m < 10 ? '0' + m : m;
    document.getElementById('seconds').innerText = s < 10 ? '0' + s : s;
    
    requestAnimationFrame(updateTimer);
}

function unlockExperience() {
    const overlay = document.getElementById('countdown-overlay');
    
    if (overlay.style.transform !== 'translateY(-100%)') {
        overlay.style.transform = 'translateY(-100%)';
        document.getElementById('main-experience').style.opacity = '1';
        
        // --- AQUÍ OCURRE LA MAGIA ---
        const hearts = document.querySelector('.hearts-container');
        if(hearts) hearts.classList.add('active-animation');
        
        // Iniciamos animaciones GSAP
        initGSAP();
    }
}

updateTimer();

// 2. ANIMACIONES GSAP
function initGSAP() {
    // Título Hero
    gsap.from(".line", {
        duration: 1.5, y: 100, opacity: 0, stagger: 0.2, ease: "power3.out", delay: 0.5
    });

    // Textos al hacer scroll
    gsap.utils.toArray(".text-block").forEach(block => {
        gsap.from(block, {
            scrollTrigger: { trigger: block, start: "top 80%" },
            y: 50, opacity: 0, duration: 1
        });
    });

    // Galería
    gsap.from(".photo-card", {
        scrollTrigger: { 
            trigger: ".gallery", 
            start: "top 60%" 
        },
        y: 100, 
        opacity: 0,
        rotation: 15, 
        stagger: 0.1, 
        duration: 0.8,
        ease: "back.out(1.7)" 
    });
}

// 3. RASPA Y GANA MÚLTIPLE
const scratchPads = document.querySelectorAll('.scratch-pad');

scratchPads.forEach(canvas => {
    const ctx = canvas.getContext('2d');
    
    // Ajustar tamaño al tamaño real de la tarjeta CSS
    const width = canvas.parentElement.offsetWidth;
    const height = canvas.parentElement.offsetHeight;
    
    canvas.width = width;
    canvas.height = height;

    // 1. Pintar la capa gris
    ctx.fillStyle = '#C0C0C0'; // Plateado
    ctx.fillRect(0, 0, width, height);
    
    // 2. Decoración
    ctx.fillStyle = '#555';
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("❤️ Raspa ❤️", width / 2, height / 2 + 5);

    // Variables de estado para ESTE canvas
    let isDrawing = false;

    // Función de raspar local
    const scratch = (x, y) => {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2); 
        ctx.fill();
    };

    // --- EVENTOS DEL MOUSE ---
    canvas.addEventListener('mousedown', () => isDrawing = true);
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseleave', () => isDrawing = false);
    
    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        scratch(x, y);
    });

    // --- EVENTOS TACTILES (Móvil) ---
    canvas.addEventListener('touchstart', (e) => {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        scratch(x, y);
    }, { passive: false });

    canvas.addEventListener('touchend', () => isDrawing = false);
    
    canvas.addEventListener('touchmove', (e) => {
        if (!isDrawing) return;
        e.preventDefault(); 
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        scratch(x, y);
    }, { passive: false });
});

// 4. FUEGOS ARTIFICIALES DE CORAZONES (CORREGIDO Y LIMPIO)
const fwCanvas = document.getElementById('sakura-canvas');
const fwCtx = fwCanvas.getContext('2d');
fwCanvas.width = window.innerWidth;
fwCanvas.height = window.innerHeight;

let fireworks = [];
let particles = [];

// Colores neón brillantes para resaltar sobre el fondo
const colors = ['#FF0055', '#00F7FF', '#BD00FF', '#FFFFFF', '#FFD700'];

class Firework {
    constructor() {
        this.x = Math.random() * fwCanvas.width;
        this.y = fwCanvas.height;
        this.targetY = Math.random() * (fwCanvas.height / 2.5); // Explota más arriba
        this.speed = Math.random() * 3 + 5; 
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.y -= this.speed;
    }

    draw() {
        fwCtx.beginPath();
        fwCtx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        fwCtx.fillStyle = this.color;
        fwCtx.fill();
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.alpha = 1; 
        this.decay = Math.random() * 0.02 + 0.015; // Desvanecimiento

        // --- FORMA DE CORAZÓN PERFECTO ---
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 2 + 0.5; 
        
        // Ecuación del corazón
        const heartX = 16 * Math.pow(Math.sin(angle), 3);
        const heartY = -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle));

        this.vx = (heartX / 12) * velocity;
        this.vy = (heartY / 12) * velocity;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay; 
    }

    draw() {
        fwCtx.save();
        fwCtx.globalAlpha = this.alpha;
        fwCtx.beginPath();
        fwCtx.arc(this.x, this.y, 2.5, 0, Math.PI * 2); // Partículas un poco más grandes
        fwCtx.fillStyle = this.color;
        fwCtx.fill();
        fwCtx.restore();
    }
}

function animateParticles() {
    // CORRECCIÓN CLAVE: Usamos clearRect para borrar TODO.
    // Al ser transparente, se ve el fondo azul de tu página web (CSS).
    fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);

    // 1. Crear cohetes
    if (Math.random() < 0.04) { // Frecuencia de disparos
        fireworks.push(new Firework());
    }

    // 2. Actualizar Cohetes
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        fireworks[i].draw();

        if (fireworks[i].y <= fireworks[i].targetY) {
            // Explosión: Generamos partículas
            for (let j = 0; j < 50; j++) { 
                particles.push(new Particle(fireworks[i].x, fireworks[i].y, fireworks[i].color));
            }
            fireworks.splice(i, 1); 
        }
    }

    // 3. Actualizar Partículas
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();

        if (particles[i].alpha <= 0) {
            particles.splice(i, 1);
        }
    }

    requestAnimationFrame(animateParticles);
}

// Redimensionar si cambia la pantalla
window.addEventListener('resize', () => {
    fwCanvas.width = window.innerWidth; 
    fwCanvas.height = window.innerHeight;
});

// Iniciar animación

animateParticles();


