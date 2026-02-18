
document.addEventListener('DOMContentLoaded', () => {
    initEnvironment();
    initSnow();
    initFlightBoard();
});

/* =========================================
   1. Environment Control (Time & Season)
   ========================================= */
function initEnvironment() {
    const now = new Date();
    const hours = now.getHours();
    const month = now.getMonth() + 1; // 0-11 -> 1-12
    const root = document.documentElement;

    // --- Time of Day Logic ---
    let timeClass = '';

    if (hours >= 5 && hours < 10) {
        // Morning
        timeClass = 'morning';
        root.style.setProperty('--sky-top', '#a1c4fd');
        root.style.setProperty('--sky-bottom', '#c2e9fb');
    } else if (hours >= 10 && hours < 16) {
        // Noon (Day)
        timeClass = 'day';
        root.style.setProperty('--sky-top', '#4fc3f7');
        root.style.setProperty('--sky-bottom', '#e1f5fe');
    } else if (hours >= 16 && hours < 19) {
        // Evening (Sunset)
        timeClass = 'evening';
        root.style.setProperty('--sky-top', '#ff7e5f');
        root.style.setProperty('--sky-bottom', '#feb47b');
    } else {
        // Night
        timeClass = 'night';
        root.style.setProperty('--sky-top', '#0f2027');
        root.style.setProperty('--sky-bottom', '#203a43');
        document.body.style.color = '#e0e0e0'; // Light text for night
        root.style.setProperty('--card-bg', 'rgba(30, 30, 40, 0.95)'); // Dark card for night
        root.style.setProperty('--text-main', '#e0e0e0');
    }

    document.body.classList.add(timeClass);
    console.log(`Current Time Mode: ${timeClass}`);

    // --- Season / Special Event Logic ---
    // Setsubun (Feb 3)
    if (month === 2 && now.getDate() === 3) {
        // Setsubun - Maybe Oni colors or Beans? Let's use Red/Yellow
        root.style.setProperty('--accent-blue', '#ffb300'); // Yellow/Orange
        createFloatingElements('👹'); // Oni mask or Beans if available, usually text emoji works
    }
    // Mikemike Birthday (Feb 1)
    else if (month === 2 && now.getDate() === 1) {
        root.style.setProperty('--accent-blue', '#ff9800'); // Orange for Mike?
        createFloatingElements('🎂'); // Cake
    }
    // Valentine's Day
    else if (month === 2 && now.getDate() === 14) {
        root.style.setProperty('--accent-blue', '#e91e63'); // Pink
        createFloatingElements('❤️');
    }
    // Minori Birthday (Dec 20)
    else if (month === 12 && now.getDate() === 20) {
        root.style.setProperty('--accent-blue', '#9c27b0'); // Purple for Minori?
        createFloatingElements('🎉');
    }
    // Christmas
    else if (month === 12 && now.getDate() >= 24 && now.getDate() <= 25) {
        root.style.setProperty('--accent-blue', '#d32f2f'); // Red
        createFloatingElements('🎄');
    }
    // Spring (Sakura)
    else if (month >= 3 && month <= 4) {
        createFloatingElements('🌸');
    }

    // Force Snow in Winter (Dec, Jan, Feb)
    if (month === 12 || month === 1 || month === 2) {
        // Snow canvas is handled in initSnow, this check just confirms season
    }
}

/* =========================================
   2. Effects (Snow / Floating Icons)
   ========================================= */
function initSnow() {
    const month = new Date().getMonth() + 1;
    if (!(month === 12 || month === 1 || month === 2)) return;

    const c = document.getElementById('snow-canvas');
    if (!c) return;

    const ctx = c.getContext('2d');

    const resize = () => {
        c.width = window.innerWidth;
        c.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const particles = Array.from({ length: 100 }, () => ({
        x: Math.random() * c.width,
        y: Math.random() * c.height,
        r: Math.random() * 3 + 1,
        speedY: Math.random() * 2 + 0.5,
        speedX: Math.random() * 1 - 0.5
    }));

    function draw() {
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.beginPath();

        particles.forEach(p => {
            ctx.moveTo(p.x, p.y);
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);

            p.y += p.speedY;
            p.x += p.speedX;

            if (p.y > c.height) {
                p.y = -10;
                p.x = Math.random() * c.width;
            }
        });

        ctx.fill();
        requestAnimationFrame(draw);
    }
    draw();
}

function createFloatingElements(char) {
    let container = document.getElementById('floating-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'floating-container';
        document.body.prepend(container);
    }

    const count = 20; // Number of floating items
    for (let i = 0; i < count; i++) {
        const span = document.createElement('span');
        span.classList.add('floating-item');
        span.innerText = char;

        // Randomize
        const size = Math.random() * 1.5 + 1; // 1rem to 2.5rem
        span.style.fontSize = `${size}rem`;
        span.style.left = `${Math.random() * 100}vw`;
        span.style.animationDuration = `${Math.random() * 10 + 10}s`; // 10-20s duration
        span.style.animationDelay = `${Math.random() * 10}s`;

        container.appendChild(span);
    }
}

/* =========================================
   3. Modal Control
   ========================================= */
window.openModal = function (el) {
    const date = el.querySelector('.news-date').innerText;
    const title = el.querySelector('.news-title').innerText;
    const bodyContent = el.querySelector('.hidden-body').innerHTML;

    document.getElementById('modal-date').innerText = date;
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-body').innerHTML = bodyContent;

    document.getElementById('modal-overlay').classList.add('active');
}

window.openCrewModal = function (el) {
    const name = el.querySelector('.crew-name').innerText;
    const role = el.querySelector('.crew-role').innerText;
    const details = el.querySelector('.hidden-crew-details').innerHTML;

    document.getElementById('modal-date').innerText = role; // Reusing date field for role
    document.getElementById('modal-title').innerText = name;
    document.getElementById('modal-body').innerHTML = details;

    document.getElementById('modal-overlay').classList.add('active');
}

window.closeModalBtn = function () {
    document.getElementById('modal-overlay').classList.remove('active');
}

window.closeModalClick = function (e) {
    if (e.target.id === 'modal-overlay') window.closeModalBtn();
}

/* =========================================
   4. Flight Board Logic
   ========================================= */
function initFlightBoard() {
    const statusCells = document.querySelectorAll('.status-cell');
    const statuses = [
        { text: 'BOARDING', class: 'status-boarding' },
        { text: 'ON TIME', class: 'status-boarding' },
        { text: 'DEPARTED', class: 'status-departed' },
        { text: 'DELAYED', class: 'status-delayed' },
        { text: 'CANCELLED', class: 'status-cancelled' },
        { text: 'GATE OPEN', class: 'status-boarding' }
    ];

    statusCells.forEach(cell => {
        // Simple random pick for variety
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

        // Clear previous classes
        cell.className = 'status-cell';
        cell.innerText = randomStatus.text;
        cell.classList.add(randomStatus.class);
    });
}
