document.addEventListener('DOMContentLoaded', () => {
    initEnvironment();
    initSnow();
    initFlightBoard();
    initBackToTop();
});

/* =========================================
   1. Environment Control (Time & Season)
   ========================================= */
/* =========================================
   1. Environment Control (Time & Season)
   ========================================= */
function initEnvironment() {
    const now = new Date();
    const hours = now.getHours();
    const root = document.documentElement;

    // --- Time of Day Logic ---
    let timeClass = '';
    if (hours >= 5 && hours < 10) {
        timeClass = 'morning';
        root.style.setProperty('--sky-top', '#a1c4fd');
        root.style.setProperty('--sky-bottom', '#c2e9fb');
    } else if (hours >= 10 && hours < 16) {
        timeClass = 'day';
        root.style.setProperty('--sky-top', '#4fc3f7');
        root.style.setProperty('--sky-bottom', '#e1f5fe');
    } else if (hours >= 16 && hours < 19) {
        timeClass = 'evening';
        root.style.setProperty('--sky-top', '#ff7e5f');
        root.style.setProperty('--sky-bottom', '#feb47b');
    } else {
        timeClass = 'night';
        root.style.setProperty('--sky-top', '#0f2027');
        root.style.setProperty('--sky-bottom', '#203a43');
        document.body.style.color = '#e0e0e0';
        root.style.setProperty('--card-bg', 'rgba(30, 30, 40, 0.95)');
        root.style.setProperty('--text-main', '#e0e0e0');
    }
    document.body.classList.add(timeClass);
    console.log(`Current Time Mode: ${timeClass}`);

    // --- Special Event Logic (Fixed Dates & Holidays) ---
    checkSpecialEvents(now, root);

    // --- Real-time Weather Logic (Open-Meteo for Haneda) ---
    fetchWeatherForHaneda();
}

function checkSpecialEvents(date, root) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    // Helper to calculate "Nth Monday" etc if needed, but for now fixed dates are prioritized

    // --- Specific Dates Loopup ---
    const events = {
        // January
        "1/1": { icon: "🎍", color: "#d32f2f" }, // New Year
        "1/2": { icon: "🎍", color: "#d32f2f" },
        "1/3": { icon: "🎍", color: "#d32f2f" },
        // February
        "2/1": { icon: "🎂", color: "#ff9800" }, // Mikemike Birthday
        "2/3": { icon: "👹", color: "#ffb300" }, // Setsubun
        "2/11": { icon: "🇯🇵", color: "#ef5350" }, // Foundation Day
        "2/14": { icon: "❤️", color: "#e91e63" }, // Valentine
        // March
        "3/3": { icon: "🎎", color: "#f48fb1" }, // Hinamatsuri
        "3/14": { icon: "💙", color: "#2196f3" }, // White Day
        // April
        "4/29": { icon: "🌿", color: "#66bb6a" }, // Showa Day
        // May
        "5/3": { icon: "📜", color: "#ffd54f" }, // Constitution Memorial
        "5/4": { icon: "🍃", color: "#81c784" }, // Greenery Day
        "5/5": { icon: "🎏", color: "#42a5f5" }, // Children's Day
        // July
        "7/7": { icon: "🎋", color: "#80deea" }, // Tanabata
        "7/15": { icon: "🌊", color: "#0277bd" }, // Marine Day (Fixed approx)
        // August
        "8/11": { icon: "⛰️", color: "#4caf50" }, // Mountain Day
        // September
        // "9/xx": Respect for Aged/Equinox (Variable) 
        // October
        "10/31": { icon: "🎃", color: "#ff9800" }, // Halloween
        // November
        "11/3": { icon: "🎨", color: "#ffa726" }, // Culture Day
        "11/23": { icon: "🌾", color: "#8d6e63" }, // Labor Thanksgiving
        // December
        "12/20": { icon: "🎉", color: "#9c27b0" }, // Minori Birthday
        "12/24": { icon: "🎄", color: "#d32f2f" }, // Xmas Eve
        "12/25": { icon: "🎄", color: "#d32f2f" }, // Xmas
    };

    const monthlyEmojis = {
        1: '❄️',
        2: '⛄',
        3: '🌸',
        4: '🍡',
        5: '🌿',
        6: '☔',
        7: '🌻',
        8: '🍉',
        9: '🎑',
        10: '🍠',
        11: '🍂',
        12: '❄️'
    };

    const key = `${month}/${day}`;
    if (events[key]) {
        if (events[key].color) root.style.setProperty('--accent-blue', events[key].color);
        createFloatingElements(events[key].icon);
        console.log(`Event Active: ${key} -> ${events[key].icon}`);
    } else {
        createFloatingElements(monthlyEmojis[month] || '🌸');
    }
}

function fetchWeatherForHaneda() {
    // Haneda Airport: 35.549, 139.779
    const url = "https://api.open-meteo.com/v1/forecast?latitude=35.549&longitude=139.779&current=temperature_2m,weather_code&timezone=Asia%2FTokyo";

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (!data.current) return;

            const code = data.current.weather_code;
            const temp = data.current.temperature_2m;
            console.log(`Haneda Weather: Code ${code}, Temp ${temp}°C`);

            // Snow Logic:
            // WMO Codes: 71, 73, 75, 77 (Snow fall), 85, 86 (Snow showers)
            // OR Temp <= 3.0 degrees
            const isSnowing = [71, 73, 75, 77, 85, 86].includes(code);
            const isCold = temp <= 3.0;

            if (isSnowing || isCold) {
                console.log("Snow condition met! Starting snow animation.");
                // Ensure snow canvas is initialized
                initSnow();
                // We could also force a grey sky here if desired, but user said "only snow"
            }
        })
        .catch(err => console.error("Weather fetch failed:", err));
}

/* =========================================
   2. Effects (Snow / Floating Icons)
   ========================================= */
function initSnow() {
    // Removed hardcoded month check to allow Weather API to trigger snow
    // const month = new Date().getMonth() + 1;
    // if (!(month === 12 || month === 1 || month === 2)) return;

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

/* =========================================
   5. Back to Top Button
   ========================================= */
function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            btn.classList.add('show');
        } else {
            btn.classList.remove('show');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}
