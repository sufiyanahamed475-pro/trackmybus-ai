// ═══════════════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════════════
let currentRole = 'student';
let selectedRole = 'student';
let tripActive = false;
let trackMap = null;
let driverMap = null;
let busMarker = null;
let routeLine = null;
let liveBusPoll = null;

// ═══════════════════════════════════════════════════════
//  AUTH  (Backend connected for Student + Driver)
// ═══════════════════════════════════════════════════════
const API = 'https://name-trackmybus-ai-backend.onrender.com';

const DEMO_ADMIN = {
    email: 'admin@amet.ac.in',
    pass: 'admin123',
    role: 'admin',
    name: 'Admin'
};

function selectRole(role, el) {
    selectedRole = role;
    document.querySelectorAll('.role-card').forEach(c => c.classList.remove('active'));
    el.classList.add('active');

    const pairs = {
        student: ['sufiyan@amet.ac.in', 'student123'],
        driver: ['rajan@amet.ac.in', 'driver123'],
        admin: ['admin@amet.ac.in', 'admin123']
    };

    document.getElementById('login-email').value = pairs[role][0];
    document.getElementById('login-pass').value = pairs[role][1];
}

async function doLogin() {
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value.trim();

    if (!email || !pass) {
        showToast('❌ Email and password required', 'amber');
        return;
    }

    // Admin backend is not created yet, so admin works as local demo only.
    if (selectedRole === 'admin') {
        if (email === DEMO_ADMIN.email && pass === DEMO_ADMIN.pass) {
            openApp(DEMO_ADMIN);
            showToast('✅ Admin demo opened', 'green');
            return;
        }
        showToast('❌ Invalid admin credentials', 'amber');
        return;
    }

    try {
        const response = await fetch(`${API}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: pass })
        });

        const data = await response.json();

        if (!response.ok) {
            showToast('❌ ' + (data.message || 'Login failed'), 'amber');
            return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('name', data.name);
        localStorage.setItem('email', data.email);
        localStorage.setItem('busNumber', data.busNumber || '');

        openApp(data);
        showToast(`✅ Welcome, ${data.name}!`, 'green');

    } catch (err) {
        showToast('❌ Server not running! Start backend first.', 'amber');
        console.log('Login error:', err);
    }
}

function openApp(user) {
    currentRole = user.role || selectedRole || 'student';

    document.getElementById('screen-login').classList.remove('active');
    document.getElementById('screen-app').classList.add('active');

    buildNav();
    setPortalBadge();
    updateUserUI(user);

    setTimeout(() => { initMaps(); }, 300);
}

function updateUserUI(user) {
    const name = user.name || 'Sufiyan Ahmed';
    const firstName = name.split(' ')[0] || name;
    const busNumber = user.busNumber || 23;

    const greetingName = document.getElementById('greeting-name');
    if (greetingName) greetingName.textContent = firstName;

    const heroBus = document.getElementById('hero-bus-num');
    if (heroBus) heroBus.textContent = busNumber;

    const profileName = document.getElementById('profile-name');
    if (profileName) profileName.textContent = name;

    const profileAvatar = document.getElementById('profile-avatar');
    if (profileAvatar) profileAvatar.textContent = firstName.charAt(0).toUpperCase();

    const profileSub = document.getElementById('profile-sub');
    if (profileSub && currentRole === 'student') profileSub.textContent = 'B.Tech CSE · Year 2 · AMET2024';
    if (profileSub && currentRole === 'driver') profileSub.textContent = 'Driver · Bus 23 · DRV-047';
    if (profileSub && currentRole === 'admin') profileSub.textContent = 'Transport Admin · AMET University';
}

function doLogout() {
    localStorage.clear();
    clearInterval(moveInterval);
    document.getElementById('screen-app').classList.remove('active');
    document.getElementById('screen-login').classList.add('active');
    trackMap = null;
    driverMap = null;
    busMarker = null;
}

function setPortalBadge() {
    const badge = document.getElementById('portal-badge');
    const labels = { student: 'Student', driver: 'Driver', admin: 'Admin' };
    badge.textContent = labels[currentRole];
    badge.className = 'portal-badge ' + currentRole;
}

// ═══════════════════════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════════════════════
const NAV_CONFIG = {
    student: [
        { id: 'home', icon: '🏠', label: 'Home', pane: 'pane-home' },
        { id: 'track', icon: '📡', label: 'Track', pane: 'pane-track' },
        { id: 'alerts', icon: '🔔', label: 'Alerts', pane: 'pane-alerts' },
        { id: 'profile', icon: '👤', label: 'Profile', pane: 'pane-profile' }
    ],
    driver: [
        { id: 'driver-home', icon: '🏠', label: 'Home', pane: 'pane-driver-home' },
        { id: 'driver-gps', icon: '📡', label: 'GPS', pane: 'pane-driver-gps' },
        { id: 'profile', icon: '👤', label: 'Profile', pane: 'pane-profile' }
    ],
    admin: [
        { id: 'admin-dash', icon: '📊', label: 'Dashboard', pane: 'pane-admin-dash' },
        { id: 'admin-gate', icon: '🚧', label: 'Gate', pane: 'pane-admin-gate' },
        { id: 'admin-reports', icon: '📄', label: 'Reports', pane: 'pane-admin-reports' }
    ]
};

let activeTab = null;

function buildNav() {
    const nav = document.getElementById('bottom-nav');
    const items = NAV_CONFIG[currentRole];
    nav.innerHTML = items.map((item, i) => `
    <div class="nav-item${i === 0 ? ' active' : ''}" onclick="switchTab('${item.id}')">
      <div class="nav-icon">${item.icon}</div>
      <div class="nav-label">${item.label}</div>
    </div>
  `).join('');
    activeTab = items[0].id;
    showPane(items[0].pane);
}

function switchTab(tabId) {
    const items = NAV_CONFIG[currentRole];
    const item = items.find(i => i.id === tabId);
    if (!item) return;

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((el, i) => {
        el.classList.toggle('active', items[i].id === tabId);
    });

    showPane(item.pane);
    activeTab = tabId;

    if (tabId === 'track') {
        setTimeout(() => {
            if (!trackMap) {
                initTrackMap();
            } else {
                trackMap.invalidateSize();
                if (busMarker) {
                    trackMap.setView(busMarker.getLatLng(), 14);
                }
            }
        }, 300);
    }

    if (tabId === 'driver-gps') {
        setTimeout(() => {
            if (!driverMap) {
                initDriverMap();
            } else {
                driverMap.invalidateSize();
            }
        }, 300);
    }
}

function showPane(paneId) {
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    const pane = document.getElementById(paneId);
    if (pane) pane.classList.add('active');
}

// ═══════════════════════════════════════════════════════
//  MAPS
// ═══════════════════════════════════════════════════════
const BUS_POS = [12.8406, 80.2534];
const AMET_POS = [12.8186, 80.2018];
function initMaps() {
    // Do not initialize student map while it is hidden.
    // Leaflet maps must be created only after the Track tab is visible.
    if (currentRole === 'driver') {
        setTimeout(initDriverMap, 400);
    }
}

function initTrackMap() {
    if (trackMap || !document.getElementById('track-map')) return;

    if (typeof L === 'undefined') {
        showToast('⚠️ Map library not loaded. Check internet/CDN.', 'amber');
        return;
    }

    // Default center. Actual bus position will come from backend.
    const defaultPos = [13.14685, 80.300475];

    trackMap = L.map('track-map', {
        zoomControl: false,
        attributionControl: false
    }).setView(defaultPos, 15);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
    }).addTo(trackMap);

    const busIcon = L.divIcon({
        html: `<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#00b8d4,#0062a0);border:2px solid #00e5ff;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 0 12px rgba(0,229,255,0.6);">🚌</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });

    busMarker = L.marker(defaultPos, { icon: busIcon }).addTo(trackMap);
    busMarker.bindPopup('<b>Bus 23</b><br>Loading real GPS...');

    setTimeout(() => {
        trackMap.invalidateSize();
        loadLiveBusFromBackend(true);
    }, 300);

    clearInterval(liveBusPoll);
    liveBusPoll = setInterval(() => {
        loadLiveBusFromBackend(false);
    }, 5000);
}

function initDriverMap() {
    if (driverMap || !document.getElementById('driver-map')) return;
    if (typeof L === 'undefined') {
        showToast('⚠️ Map library not loaded. Check internet/CDN.', 'amber');
        return;
    }
    driverMap = L.map('driver-map', { zoomControl: false, attributionControl: false })
        .setView(BUS_POS, 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(driverMap);
    const drvIcon = L.divIcon({ html: `<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#00c853,#00796b);border:2px solid #00e676;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 0 12px rgba(0,230,118,0.6);">🚗</div>`, iconSize: [32, 32], iconAnchor: [16, 16] });
    L.marker(BUS_POS, { icon: drvIcon }).addTo(driverMap).bindPopup('<b>Your Location</b><br>Bus 23');
}

let moveInterval = null;
let busLat = 12.8406, busLng = 80.2534;
async function loadLiveBusFromBackend(focusMap = false) {
    try {
        const response = await fetch(`${API}/api/bus/23`);
        const bus = await response.json();

        if (!response.ok) {
            console.log('Bus fetch failed:', bus);
            return;
        }

        const lat = Number(bus.latitude);
        const lng = Number(bus.longitude);
        const speed = Number(bus.speed || 0);
        const passengers = Number(bus.passengerCount || 0);

        if (!lat || !lng || !busMarker || !trackMap) return;

        const livePos = [lat, lng];

        busMarker.setLatLng(livePos);
        busMarker.setPopupContent(`
      <b>Bus ${bus.busNumber}</b><br>
      Route ${bus.route || 'ECR'}<br>
      Speed: ${speed} km/h<br>
      Status: ${bus.status || 'on-time'}
    `);

        if (focusMap) {
            trackMap.setView(livePos, 15);
            busMarker.openPopup();
        }

        document.getElementById('meta-speed').innerHTML =
            `${speed}<span style="font-size:11px;color:var(--text2)"> km/h</span>`;

        const passengerBox = document.querySelector('.stats-row .stat-card:nth-child(2) .stat-val');
        if (passengerBox) passengerBox.textContent = passengers;

        const heroStatus = document.getElementById('hero-status');
        if (heroStatus) {
            heroStatus.textContent = bus.status === 'delayed' ? '● Delayed' : '● On Time';
            heroStatus.className = bus.status === 'delayed'
                ? 'status-pill delayed'
                : 'status-pill on-time';
        }

        console.log('✅ Student map updated from backend:', livePos);

    } catch (err) {
        console.log('❌ Live bus fetch error:', err);
    }
}

function simulateBusMove() {
    // Fake movement disabled.
    // Student map now uses real backend GPS from /api/bus/23.
    loadLiveBusFromBackend(false);
}

// ═══════════════════════════════════════════════════════
//  DRIVER ACTIONS
// ═══════════════════════════════════════════════════════
function startTrip() {
    tripActive = true;
    document.getElementById('btn-start-trip').classList.add('active-start');
    document.getElementById('driver-status').textContent = '● On Route';
    document.getElementById('driver-status').className = 'status-pill on-time';
    showToast('▶ Trip started — GPS broadcasting', 'green');
}

function endTrip() {
    tripActive = false;
    document.getElementById('btn-start-trip').classList.remove('active-start');
    document.getElementById('driver-status').textContent = '● Trip Ended';
    document.getElementById('driver-status').className = 'status-pill delayed';
    document.getElementById('d-trips').textContent = '3';
    showToast('■ Trip ended — Summary saved', 'amber');
}

function updateGPS() {
    if (!navigator.geolocation) {
        showToast('❌ GPS not supported in this browser', 'amber');
        return;
    }

    showToast('📡 Getting real GPS location...', 'cyan');

    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            const latitude = pos.coords.latitude;
            const longitude = pos.coords.longitude;
            const speed = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0;

            try {
                const response = await fetch(`${API}/api/bus/23/location`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        latitude,
                        longitude,
                        speed
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    console.log('GPS backend update failed:', data);
                    showToast('❌ GPS update failed', 'amber');
                    return;
                }

                document.getElementById('gps-lat').textContent = latitude.toFixed(6);
                document.getElementById('gps-lng').textContent = longitude.toFixed(6);
                document.getElementById('gps-speed').textContent = speed + ' km/h';

                if (driverMap && typeof L !== 'undefined') {
                    driverMap.setView([latitude, longitude], 16);
                }

                console.log('✅ Driver real GPS updated:', data);
                showToast('✅ Real GPS synced to Bus 23', 'green');

            } catch (err) {
                console.log('GPS sync error:', err);
                showToast('❌ Backend not reachable', 'amber');
            }
        },
        (err) => {
            console.log('GPS permission/error:', err);
            showToast('❌ Location permission denied or GPS timeout', 'amber');
        },
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }
    );
}

// ═══════════════════════════════════════════════════════
//  GATE SIMULATION
// ═══════════════════════════════════════════════════════
const PLATES = ['TN09 KL45', 'TN09 MN19', 'TN09 PQ88', 'TN09 RS62'];
let pIdx = 0;
function simulateGateDetect() {
    const plate = PLATES[pIdx++ % PLATES.length];
    const busNums = [42, 17, 28, 36];
    const busNum = busNums[pIdx % busNums.length];
    const now = new Date();
    const t = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
    const entry = document.createElement('div');
    entry.className = 'gate-entry';
    entry.style.cssText = 'background:rgba(0,229,255,0.05);border-radius:8px;padding:10px;margin-bottom:2px;animation:fadeIn 0.5s ease;';
    entry.innerHTML = `
    <div class="gate-plate" style="animation:glowPulse 0.8s ease;">${plate}</div>
    <div class="gate-info">
      <p>Bus ${busNum} · NEW DETECTION ✨</p>
      <span>Entry: ${t} · Exit: —</span>
    </div>
    <span class="table-badge active">Detected</span>
  `;
    const card = document.getElementById('gate-log-card');
    card.insertBefore(entry, card.firstChild);
    showToast(`🔍 OCR Detected: ${plate} — Bus ${busNum}`, 'cyan');
}

// ═══════════════════════════════════════════════════════
//  CHART BARS (init heights)
// ═══════════════════════════════════════════════════════
function initBars() {
    document.querySelectorAll('[data-h]').forEach(bar => {
        bar.style.height = bar.getAttribute('data-h') + 'px';
    });
}

// ═══════════════════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════════════════
let toastTimer;
function showToast(msg, type = 'cyan') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast ' + type + ' show';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

// ═══════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════
window.addEventListener('load', () => {
    initBars();

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    const email = localStorage.getItem('email');
    const busNumber = localStorage.getItem('busNumber');

    if (token && role && name) {
        openApp({ role, name, email, busNumber });
    }
});
