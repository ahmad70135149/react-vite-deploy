/**

 * SMART IOT IRRIGATION SYSTEM — app.js

 */

'use strict';

const AppState = {
  isLoggedIn: false,
  currentUser: null,
  currentPage: 'dashboard',
  sidebarOpen: true,
  liveUpdateInterval: null,
  charts: {},           // Stores Chart.js instances
  selectedField: null,
  selectedZone: null,
};

/* ============================================================
   2. DUMMY DATA (Replace with API calls)
   All data is centralized here for easy backend integration.
============================================================ */
const DATA = {

  // Current logged-in user
  // API: GET /api/auth/me
  user: {
    id: 'USR001',
    name: 'Muhammad Ahmad',
    cnic: '31024-1234567-8',
    email: '70135149@student.uol.edu.pk',
    phone: '+92 300 1234567',
    role: 'Farmer',
    avatar: 'MA',
    farmName: 'Ahmad Farms',
    location: 'Lahore, Punjab',
    joinDate: 'March 2024',
  },

  // Dashboard stats
  // API: GET /api/dashboard/stats
  dashboardStats: {
    soilMoisture: 64,
    temperature: 28.0,
    humidity: 51,
    waterUsed: 348,
    activePumps: 2,
    totalFields: 3,
    alerts: 3,
    efficiency: 89,
  },

  // Agricultural fields
  // API: GET /api/fields
  fields: [
    { id: 1, name: 'North Field', crop: 'Wheat',       emoji: '🌾', area: '5.2 ha', stage: 'Tillering',  progress: 45, planted: 'Oct 15, 2024', health: 92, waterEff: 88, yield: '6.8 T', daysLeft: 75,  status: 'Healthy',   bg: '#fef3c7' },
    { id: 2, name: 'East Field',  crop: 'Corn',        emoji: '🌽', area: '3.8 ha', stage: 'Vegetative', progress: 30, planted: 'Nov 5, 2024',  health: 78, waterEff: 74, yield: '4.2 T', daysLeft: 95,  status: 'Healthy',   bg: '#dcfce7' },
    { id: 3, name: 'South Field', crop: 'Vegetables',  emoji: '🥦', area: '2.5 ha', stage: 'Mature',     progress: 85, planted: 'Sep 20, 2024', health: 65, waterEff: 61, yield: '3.1 T', daysLeft: 15,  status: 'Attention', bg: '#cffafe' },
  ],

  // Crop types
  // API: GET /api/crops
  crops: [
    { id: 1, name: 'Wheat',      emoji: '🌾', season: 'Rabi (Oct-Apr)',    water: '450-650mm', duration: '120-150 days' },
    { id: 2, name: 'Rice',       emoji: '🌾', season: 'Kharif (Jun-Nov)',  water: '1200-1800mm',duration: '90-120 days' },
    { id: 3, name: 'Corn',       emoji: '🌽', season: 'Kharif (Apr-Sep)',  water: '500-800mm', duration: '90-110 days' },
    { id: 4, name: 'Cotton',     emoji: '🪻', season: 'Kharif (May-Nov)', water: '700-1300mm', duration: '150-180 days' },
    { id: 5, name: 'Sugarcane',  emoji: '🎋', season: 'Year-round',        water: '1500-2500mm',duration: '12-18 months' },
    { id: 6, name: 'Tomatoes',   emoji: '🍅', season: 'Spring/Autumn',     water: '400-600mm', duration: '70-100 days' },
    { id: 7, name: 'Potatoes',   emoji: '🥔', season: 'Rabi (Oct-Mar)',    water: '500-700mm', duration: '80-100 days' },
    { id: 8, name: 'Onions',     emoji: '🧅', season: 'Rabi (Nov-Apr)',    water: '350-550mm', duration: '100-140 days' },
  ],

  // Irrigation zones
  // API: GET /api/zones
  zones: [
    { id: 1, name: 'Zone 1 – North Field', crop: 'Wheat',      moisture: 62, next: 'Today 6:00 AM',     status: 'Scheduled', efficiency: 92 },
    { id: 2, name: 'Zone 2 – East Field',  crop: 'Corn',       moisture: 58, next: 'Tomorrow 6:00 AM',  status: 'Idle',      efficiency: 85 },
    { id: 3, name: 'Zone 3 – South Field', crop: 'Vegetables', moisture: 45, next: 'In Progress',       status: 'Active',    efficiency: 88 },
  ],

  // Live sensor data
  // API: GET /api/sensors/live  or  WebSocket: ws://server/ws/sensors
  sensors: [
    { id: 'sm', icon: '💧', label: 'Soil Moisture', value: 45,  unit: '%',    status: 'Active',  location: 'Field A – Zone 1', min: 20, max: 80 },
    { id: 'st', icon: '🌡️', label: 'Soil Temp',     value: 22,  unit: '°C',   status: 'Active',  location: 'Field A – Zone 1', min: 18, max: 35 },
    { id: 'ah', icon: '💨', label: 'Air Humidity',  value: 62,  unit: '%',    status: 'Active',  location: 'Field A – Zone 2', min: 40, max: 80 },
    { id: 'ph', icon: '⚗️', label: 'Soil pH',       value: 5.8, unit: '',     status: 'Warning', location: 'Field B – Zone 1', min: 5.0, max: 8.0 },
    { id: 'li', icon: '☀️', label: 'Light Intensity', value: 850, unit: ' Lux', status: 'Active', location: 'Field A – Zone 3', min: 500, max: 1200 },
    { id: 'wf', icon: '🔄', label: 'Water Flow',    value: 15,  unit: ' L/m', status: 'Active',  location: 'Main Pipeline',    min: 8, max: 25 },
  ],

  // 7-day weather forecast
  // API: GET /api/weather/forecast?lat=31.12&lng=74.35  or  OpenWeatherMap API
  weather: {
    current: { temp: 21, condition: 'Sunny', icon: '☀️', humidity: 50, wind: 10, precip: 0, feelsLike: 19 },
    forecast: [
      { day: 'Wed', icon: '☀️', condition: 'Sunny',        hi: 21, lo: 7,  precip: 0 },
      { day: 'Thu', icon: '🌧️', condition: 'Rainy',        hi: 18, lo: 12, precip: 80 },
      { day: 'Fri', icon: '⛈️', condition: 'Heavy Rain',  hi: 17, lo: 13, precip: 95 },
      { day: 'Sat', icon: '🌤️', condition: 'Partly Cloudy',hi: 21, lo: 8,  precip: 10 },
      { day: 'Sun', icon: '☀️', condition: 'Sunny',        hi: 21, lo: 8,  precip: 0 },
      { day: 'Mon', icon: '🌤️', condition: 'Partly Cloudy',hi: 20, lo: 8,  precip: 15 },
      { day: 'Tue', icon: '🌦️', condition: 'Light Rain',  hi: 19, lo: 11, precip: 40 },
    ],
  },

  // Alerts / Notifications
  // API: GET /api/alerts
  alerts: [
    { id: 1, type: 'critical', icon: '🚨', title: 'Low Water Pressure',       msg: 'Main pipeline pressure below 30 PSI. Immediate attention required.', location: 'Main Pipeline',  time: '3 min ago',  read: false },
    { id: 2, type: 'warning',  icon: '⚠️', title: 'Low Soil Moisture – Field B', msg: 'Moisture dropped to 28%. Schedule irrigation soon.', location: 'Field B – Zone 1', time: '15 min ago', read: false },
    { id: 3, type: 'warning',  icon: '🌡️', title: 'High Temperature Alert',   msg: 'Soil temperature exceeded 35°C in Zone 3.',        location: 'Field A – Zone 3', time: '30 min ago', read: false },
    { id: 4, type: 'info',     icon: '🌧️', title: 'Heavy Rain Forecast',      msg: 'Irrigation auto-adjusted for next 24 hours.',       location: 'All Fields',       time: '1 hr ago',   read: true },
    { id: 5, type: 'success',  icon: '✅', title: 'Irrigation Cycle Completed', msg: 'Field A – Zone 2 irrigation completed. Used 450L.', location: 'Field A – Zone 2', time: '2 hrs ago',  read: true },
  ],

  // Activity logs
  // API: GET /api/activity-logs
  activityLogs: [
    { time: '10:30 AM', activity: 'Auto Irrigation Started',    zone: 'Zone 2',      user: 'System',   status: 'Completed' },
    { time: '09:45 AM', activity: 'Moisture Alert – Zone 2',   zone: 'Zone 2',      user: 'System',   status: 'Warning' },
    { time: '08:15 AM', activity: 'Scheduled Irrigation Run',  zone: 'Zone 1',      user: 'M. Ahmad', status: 'Completed' },
    { time: '07:00 AM', activity: 'Weather Data Fetched',      zone: 'All Zones',   user: 'System',   status: 'Updated' },
    { time: 'Yesterday','activity': 'New Crop: Wheat Added',   zone: 'North Field', user: 'M. Ahmad', status: 'Updated' },
    { time: '2 days ago','activity': 'pH Sensor Calibrated',   zone: 'Zone 3',      user: 'M. Ahmad', status: 'Completed' },
    { time: '3 days ago','activity': 'Report Generated',       zone: 'All Fields',  user: 'M. Ahmad', status: 'Completed' },
    { time: '4 days ago','activity': 'Manual Override – Zone 1', zone: 'Zone 1',    user: 'M. Ahmad', status: 'Completed' },
  ],

  // IoT Devices
  // API: GET /api/devices
  devices: [
    { id: 'DEV001', name: 'Soil Moisture Sensor A1', type: 'Sensor',     location: 'Field A – Zone 1', battery: 85, signal: 92, status: 'Online',  firmware: 'v2.1.4', lastSeen: '1 min ago' },
    { id: 'DEV002', name: 'Temperature Sensor B2',   type: 'Sensor',     location: 'Field B – Zone 2', battery: 45, signal: 78, status: 'Online',  firmware: 'v2.1.3', lastSeen: '2 min ago' },
    { id: 'DEV003', name: 'Water Pump Controller 1', type: 'Controller', location: 'Main Pipeline',    battery: 100,signal: 95, status: 'Online',  firmware: 'v3.0.1', lastSeen: '30 sec ago' },
    { id: 'DEV004', name: 'pH Sensor C1',            type: 'Sensor',     location: 'Field C – Zone 1', battery: 15, signal: 45, status: 'Warning', firmware: 'v2.0.8', lastSeen: '5 min ago' },
    { id: 'DEV005', name: 'Weather Station',         type: 'Station',    location: 'Farm Center',      battery: 90, signal: 99, status: 'Online',  firmware: 'v1.5.2', lastSeen: '10 sec ago' },
    { id: 'DEV006', name: 'Flow Meter FM1',          type: 'Meter',      location: 'Main Pipeline',    battery: 72, signal: 88, status: 'Online',  firmware: 'v2.3.0', lastSeen: '1 min ago' },
  ],

  // Irrigation Schedule
  // API: GET /api/schedules
  schedules: [
    { id: 1, zone: 'Zone 1 – North Field', time: '5:30 PM Today',     duration: '20 min', type: 'Auto',   status: 'Upcoming' },
    { id: 2, zone: 'Zone 2 – East Field',  time: '6:00 PM Today',     duration: '15 min', type: 'Manual', status: 'Upcoming' },
    { id: 3, zone: 'Zone 1 – North Field', time: '6:00 AM Tomorrow',  duration: '25 min', type: 'Auto',   status: 'Upcoming' },
    { id: 4, zone: 'Zone 3 – South Field', time: '6:30 AM Tomorrow',  duration: '18 min', type: 'Auto',   status: 'Upcoming' },
  ],

  // Admin Users
  // API: GET /api/admin/users
  adminUsers: [
    { id: '#F001', name: 'Muhammad Ahmad',   role: 'Farmer',     status: 'Active',   last: '2 min ago',  email: 'ahmad@farm.pk' },
    { id: '#F002', name: 'Ali Hassan',       role: 'Farmer',     status: 'Active',   last: '15 min ago', email: 'ali@farm.pk' },
    { id: '#E001', name: 'Dr. Sarah Khan',   role: 'Expert',     status: 'Active',   last: '1 hr ago',   email: 'sarah@agri.pk' },
    { id: '#F003', name: 'Ahmed Raza',       role: 'Farmer',     status: 'Inactive', last: '3 days ago', email: 'ahmed@farm.pk' },
    { id: '#D001', name: 'Zain Enterprises', role: 'Distributor',status: 'Active',   last: '5 hrs ago',  email: 'zain@dist.pk' },
    { id: '#A001', name: 'Admin User',       role: 'Admin',      status: 'Active',   last: 'Just now',   email: 'admin@irrig.pk' },
  ],

  // Backups
  // API: GET /api/backups
  backups: [
    { id: 'BK001', name: 'System Backup – March 14, 2025', size: '2.4 MB', type: 'Full',    status: 'Completed', created: '14 Mar 2025 09:00' },
    { id: 'BK002', name: 'System Backup – March 7, 2025',  size: '2.1 MB', type: 'Full',    status: 'Completed', created: '07 Mar 2025 09:00' },
    { id: 'BK003', name: 'Config Backup – March 1, 2025',  size: '0.8 MB', type: 'Config',  status: 'Completed', created: '01 Mar 2025 12:30' },
    { id: 'BK004', name: 'Data Backup – Feb 28, 2025',     size: '1.9 MB', type: 'Data',    status: 'Completed', created: '28 Feb 2025 09:00' },
  ],

  // Moisture trend (7 days)
  moistureTrend: [65, 62, 58, 52, 55, 60, 64],

  // Monthly water usage (liters)
  monthlyWater: [1200, 980, 1450, 1800, 2100, 1750, 1600, 1350, 1900, 2050, 1700, 1450],
};

/* ============================================================
   3. APP INITIALIZATION
============================================================ */

/** Initialize app when DOM is ready */
document.addEventListener('DOMContentLoaded', () => {
  simulateLoading();
});

/** Show loading screen then go to login */
function simulateLoading() {
  setTimeout(() => {
    const ls = document.getElementById('loading-screen');
    ls.style.opacity = '0';
    setTimeout(() => {
      ls.style.display = 'none';
      showAuthPage('login');
    }, 500);
  }, 2000);
}

/* ============================================================
   4. AUTHENTICATION
============================================================ */

/**
 * Show login or register page
 * @param {'login'|'register'} page
 */
function showAuthPage(page) {
  document.getElementById('auth-container').style.display = 'block';
  document.getElementById('app-container').style.display = 'none';
  document.getElementById('page-login').style.display = page === 'login' ? 'flex' : 'none';
  document.getElementById('page-register').style.display = page === 'register' ? 'flex' : 'none';
}

/**
 * Handle login form submission
 * API: POST /api/auth/login
 * Request body: { cnic, password, role }
 * Response: { token, user }
 */
function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('login-btn');
  const cnic = document.getElementById('login-cnic').value;
  const pass = document.getElementById('login-password').value;
  const role = document.getElementById('login-role').value;

  if (!cnic || !pass) {
    document.getElementById('login-error').style.display = 'block';
    return;
  }

  // Show loading state
  btn.textContent = '🔄 Logging in...';
  btn.disabled = true;

  // Simulate API call — replace with: fetch('/api/auth/login', { method:'POST', body: JSON.stringify({cnic,pass,role}) })
  setTimeout(() => {
    AppState.isLoggedIn = true;
    AppState.currentUser = { ...DATA.user, role };
    initApp();
    btn.textContent = '🔒 Login to Account';
    btn.disabled = false;
    showToast('success', `Welcome back, ${DATA.user.name.split(' ')[0]}! 👋`);
  }, 800);
}

/**
 * Handle registration form submission
 * API: POST /api/auth/register
 * Request body: { name, cnic, email, phone, password, accountType }
 */
function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value;

  // Simulate API call
  setTimeout(() => {
    showToast('success', `Account created for ${name}! Please login.`);
    showAuthPage('login');
  }, 600);
}

/**
 * Logout user
 * API: POST /api/auth/logout
 */
function handleLogout() {
  AppState.isLoggedIn = false;
  AppState.currentUser = null;
  stopLiveUpdates();
  destroyAllCharts();
  document.getElementById('app-container').style.display = 'none';
  showAuthPage('login');
  showToast('info', 'You have been logged out successfully.');
}

/* ============================================================
   5. APP INITIALIZATION (Post-Login)
============================================================ */

/** Initialize main app after login */
function initApp() {
  document.getElementById('auth-container').style.display = 'none';
  document.getElementById('app-container').style.display = 'flex';

  // Set user info in sidebar and topbar
  const u = AppState.currentUser;
  const initials = u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  document.getElementById('user-avatar-sidebar').textContent = initials;
  document.getElementById('sidebar-user-name').textContent = u.name;
  document.getElementById('sidebar-user-role').textContent = u.role;
  document.getElementById('topbar-avatar').textContent = initials;
  document.getElementById('topbar-user-name').textContent = u.name;
  document.getElementById('topbar-user-role').textContent = u.role;

  // Navigate to dashboard
  navigateTo('dashboard', document.querySelector('[data-page="dashboard"]'));

  // Start live sensor simulation
  // In production: connect to WebSocket ws://server/ws/sensors
  startLiveUpdates();
}

/* ============================================================
   6. ROUTING & NAVIGATION
============================================================ */

/** Page title map */
const PAGE_TITLES = {
  'dashboard':       'Dashboard Overview',
  'manage-fields':   'Manage Fields',
  'crop-types':      'Crop Types',
  'irrigation-zones':'Irrigation Zones',
  'sensor-data':     'Sensor Data',
  'weather':         'Weather Data',
  'device-health':   'Device Health',
  'auto-irrigation': 'Automatic Irrigation',
  'manual-control':  'Manual Irrigation Control',
  'scheduling':      'Irrigation Scheduling',
  'iot-setup':       'IoT Controller Setup',
  'reports':         'Reports & Analytics',
  'activity-logs':   'Activity Logs',
  'notifications':   'Notifications',
  'admin-dashboard': 'Admin Dashboard',
  'system-config':   'System Configuration',
  'backup-restore':  'Backup and Restore',
};

/**
 * Navigate to a page
 * @param {string} pageId  - Page identifier
 * @param {Element|null} btn - Nav button element
 */
function navigateTo(pageId, btn) {
  AppState.currentPage = pageId;

  // Update active nav item
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (btn) btn.classList.add('active');
  else {
    const nb = document.querySelector(`[data-page="${pageId}"]`);
    if (nb) nb.classList.add('active');
  }

  // Update breadcrumb
  const title = PAGE_TITLES[pageId] || pageId;
  document.getElementById('bc-current').textContent = title;

  // Destroy old charts before rendering new page
  destroyAllCharts();

  // Render page
  const content = document.getElementById('page-content');
  content.innerHTML = '';
  content.classList.add('animate-fade');
  setTimeout(() => content.classList.remove('animate-fade'), 300);

  // Route to page renderer
  const renderers = {
    'dashboard':        renderDashboard,
    'manage-fields':    renderManageFields,
    'crop-types':       renderCropTypes,
    'irrigation-zones': renderIrrigationZones,
    'sensor-data':      renderSensorData,
    'weather':          renderWeather,
    'device-health':    renderDeviceHealth,
    'auto-irrigation':  renderAutoIrrigation,
    'manual-control':   renderManualControl,
    'scheduling':       renderScheduling,
    'iot-setup':        renderIoTSetup,
    'reports':          renderReports,
    'activity-logs':    renderActivityLogs,
    'notifications':    renderNotifications,
    'admin-dashboard':  renderAdminDashboard,
    'system-config':    renderSystemConfig,
    'backup-restore':   renderBackupRestore,
  };

  if (renderers[pageId]) {
    renderers[pageId]();
  } else {
    content.innerHTML = `<div class="flex-center" style="height:60vh;color:var(--gray-400);font-size:18px;">Page coming soon: ${pageId}</div>`;
  }

  // Close user dropdown
  document.getElementById('user-dropdown').classList.remove('show');
}

/* ============================================================
   7. PAGE RENDERERS
============================================================ */

/* ---- 7.1 DASHBOARD ---- */
function renderDashboard() {
  const s = DATA.dashboardStats;
  const u = AppState.currentUser;
  const content = document.getElementById('page-content');

  content.innerHTML = `
    <!-- Welcome Banner -->
    <div class="dashboard-welcome">
      <div class="dw-left">
        <h2>Good Morning, ${u.name.split(' ')[0]}! 🌅</h2>
        <p>Here's your farm overview for today. Everything looks good!</p>
        <div class="dw-badges">
          <div class="dw-badge"><span class="status-dot online"></span> ${s.activePumps} Pumps Active</div>
          <div class="dw-badge">🌾 ${s.totalFields} Fields Monitored</div>
          <div class="dw-badge">🔔 ${s.alerts} Active Alerts</div>
        </div>
      </div>
      <div class="dw-right">🌾</div>
    </div>

    <!-- Live Stats -->
    <div class="flex-between mb-16">
      <h3 class="font-bold" style="font-size:16px">Live Statistics</h3>
      <div class="live-pill"><span class="status-dot online"></span> Live Updates</div>
    </div>
    <div class="grid-4">
      <div class="card stat-card">
        <div class="stat-icon">💧</div>
        <div class="stat-value" id="dash-moisture">${s.soilMoisture}%</div>
        <div class="stat-label">Avg Soil Moisture</div>
        <div class="stat-trend trend-up">✓ Optimal Range</div>
      </div>
      <div class="card stat-card">
        <div class="stat-icon">🌡️</div>
        <div class="stat-value" id="dash-temp">${s.temperature.toFixed(1)}°C</div>
        <div class="stat-label">Avg Temperature</div>
        <div class="stat-trend trend-neutral">☀ Sunny Today</div>
      </div>
      <div class="card stat-card">
        <div class="stat-icon">💨</div>
        <div class="stat-value" id="dash-hum">${s.humidity}%</div>
        <div class="stat-label">Air Humidity</div>
        <div class="stat-trend trend-neutral">● Normal</div>
      </div>
      <div class="card stat-card">
        <div class="stat-icon">🪣</div>
        <div class="stat-value" id="dash-water">${s.waterUsed}L</div>
        <div class="stat-label">Water Used Today</div>
        <div class="stat-trend trend-up">↓ 40% Less Than Average</div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid-2-1">
      <div class="card chart-card">
        <div class="card-header">
          <h3>Soil Moisture Trend (7 Days)</h3>
          <button class="btn btn-sm btn-secondary" onclick="navigateTo('sensor-data',null)">View Details</button>
        </div>
        <div class="chart-wrap">
          <canvas id="chart-moisture"></canvas>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3>Water Distribution</h3></div>
        <div class="card-body" style="display:flex;flex-direction:column;align-items:center">
          <canvas id="chart-water-dist" style="max-height:180px"></canvas>
          <div style="width:100%;margin-top:12px">
            ${DATA.zones.map((z,i) => `
              <div class="flex-between" style="margin-bottom:6px">
                <div class="flex gap-8"><span style="width:10px;height:10px;border-radius:50%;background:${['#14532d','#22c55e','#f59e0b'][i]};display:inline-block;flex-shrink:0;margin-top:3px"></span><span class="text-sm text-muted">${z.name.split('–')[0].trim()}</span></div>
                <span class="text-sm font-bold">${[45,35,20][i]}%</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Row -->
    <div class="grid-2">
      <!-- Zone Status -->
      <div class="card">
        <div class="card-header">
          <h3>Irrigation Zones</h3>
          <button class="btn btn-sm btn-primary btn-icon" onclick="navigateTo('manual-control',null)">🚿 Control</button>
        </div>
        <div class="card-body" style="padding:14px">
          ${DATA.zones.map(z => `
            <div class="flex-between" style="padding:12px;background:var(--gray-50);border-radius:10px;margin-bottom:8px">
              <div>
                <p class="font-bold text-sm" style="color:var(--gray-900)">${z.name}</p>
                <p class="text-xs text-muted" style="margin-top:2px">${z.crop} · Moisture: ${z.moisture}%</p>
              </div>
              <span class="badge ${z.status === 'Active' ? 'badge-green' : z.status === 'Scheduled' ? 'badge-yellow' : 'badge-gray'}">${z.status}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="card">
        <div class="card-header">
          <h3>Recent Activity</h3>
          <button class="btn btn-sm btn-secondary" onclick="navigateTo('activity-logs',null)">View All</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Time</th><th>Activity</th><th>Status</th></tr></thead>
            <tbody>
              ${DATA.activityLogs.slice(0,5).map(l => `
                <tr>
                  <td class="text-xs text-muted">${l.time}</td>
                  <td class="text-sm">${l.activity}</td>
                  <td><span class="badge ${getStatusBadge(l.status)}">${l.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Active Alerts Banner -->
    <div class="card" style="margin-top:0">
      <div class="card-header">
        <h3>Active Alerts <span class="badge badge-red ml-8">${DATA.alerts.filter(a=>!a.read).length}</span></h3>
        <button class="btn btn-sm btn-secondary" onclick="navigateTo('notifications',null)">View All</button>
      </div>
      <div class="card-body">
        ${DATA.alerts.filter(a=>!a.read).map(a => `
          <div class="alert-item ${a.type}">
            <div class="alert-icon">${a.icon}</div>
            <div class="alert-body">
              <div class="alert-title">${a.title}</div>
              <div class="alert-msg">${a.msg}</div>
              <div class="alert-meta">📍 ${a.location} · 🕐 ${a.time}</div>
            </div>
            <div class="alert-actions">
              <button class="btn btn-sm btn-primary" onclick="resolveAlert(${a.id})">Resolve</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Draw charts after DOM update
  setTimeout(() => {
    renderMoistureChart();
    renderWaterDistChart();
  }, 50);
}

function renderMoistureChart() {
  const ctx = document.getElementById('chart-moisture');
  if (!ctx) return;
  destroyChart('moisture');
  AppState.charts.moisture = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      datasets: [{
        label: 'Soil Moisture (%)',
        data: DATA.moistureTrend,
        borderColor: '#0f766e',
        backgroundColor: 'rgba(15,118,110,.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#0f766e',
        pointRadius: 5,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: false, min: 40, max: 80, grid: { color: '#f3f4f6' } },
        x: { grid: { display: false } }
      }
    }
  });
}

function renderWaterDistChart() {
  const ctx = document.getElementById('chart-water-dist');
  if (!ctx) return;
  destroyChart('waterDist');
  AppState.charts.waterDist = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Zone 1','Zone 2','Zone 3'],
      datasets: [{ data: [45,35,20], backgroundColor: ['#14532d','#22c55e','#f59e0b'], borderWidth: 0 }]
    },
    options: {
      responsive: true, maintainAspectRatio: true,
      cutout: '60%',
      plugins: { legend: { display: false } }
    }
  });
}

/* ---- 7.2 MANAGE FIELDS ---- */
function renderManageFields() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h2>Manage Fields</h2>
        <p>Monitor and manage all your agricultural fields</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-outline btn-icon">📤 Export</button>
        <button class="btn btn-primary btn-icon" onclick="openAddFieldModal()">+ Add Field</button>
      </div>
    </div>

    <!-- Field Cards -->
    <div class="grid-3" id="field-cards">
      ${DATA.fields.map(f => `
        <div class="field-card ${AppState.selectedField?.id === f.id ? 'selected' : ''}" id="fc-${f.id}" onclick="selectField(${f.id})">
          <div class="field-thumb" style="background:${f.bg}">
            ${f.emoji}
            <span class="badge ${f.status==='Healthy'?'badge-green':'badge-yellow'}" style="position:absolute;top:10px;right:10px">${f.status}</span>
          </div>
          <div class="field-body">
            <p class="font-bold" style="font-size:14px;margin-bottom:8px">${f.name}</p>
            <div class="text-sm text-muted">
              ${[['Crop',f.crop],['Area',f.area],['Stage',`${f.stage} (${f.progress}%)`],['Planted',f.planted]].map(([k,v])=>`
                <div class="flex-between" style="margin-bottom:3px"><span>${k}:</span><span class="font-bold" style="color:var(--gray-700)">${v}</span></div>
              `).join('')}
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Field Detail Panel -->
    <div class="card" id="field-detail-panel">
      <div class="flex-between" style="padding:16px 20px;border-bottom:1px solid var(--gray-100)">
        <h3 id="field-plan-title">Field Plan — Select a field above</h3>
        <div class="flex gap-8">
          <button class="btn btn-outline">Edit</button>
          <button class="btn btn-primary">Save</button>
        </div>
      </div>
      <div class="tabs" style="padding:0 20px">
        <button class="tab-btn active" onclick="switchFieldTab('overview',this)">Overview</button>
        <button class="tab-btn" onclick="switchFieldTab('growth',this)">Growth Timeline</button>
        <button class="tab-btn" onclick="switchFieldTab('soil',this)">Soil Analysis</button>
        <button class="tab-btn" onclick="switchFieldTab('recommendations',this)">Recommendations</button>
      </div>
      <div class="card-body tab-content" id="field-tab-content">
        <div class="active" id="tab-overview">
          <p class="text-muted" style="font-size:13px;text-align:center;padding:20px 0">👆 Click a field card above to view details</p>
        </div>
        <div id="tab-growth"></div>
        <div id="tab-soil"></div>
        <div id="tab-recommendations"></div>
      </div>
    </div>
  `;

  // Auto-select first field
  if (DATA.fields.length > 0) selectField(DATA.fields[0].id);
}

function selectField(id) {
  AppState.selectedField = DATA.fields.find(f => f.id === id);
  const f = AppState.selectedField;

  // Update card selection
  document.querySelectorAll('.field-card').forEach(c => c.classList.remove('selected'));
  const fc = document.getElementById(`fc-${id}`);
  if (fc) fc.classList.add('selected');

  // Update title
  document.getElementById('field-plan-title').textContent = `Field Plan — ${f.name} (${f.crop})`;

  // Render tab content
  renderFieldTab('overview');
}

function renderFieldTab(tab) {
  const f = AppState.selectedField;
  if (!f) return;

  const overviewEl = document.getElementById('tab-overview');
  const growthEl   = document.getElementById('tab-growth');
  const soilEl     = document.getElementById('tab-soil');
  const recsEl     = document.getElementById('tab-recommendations');

  overviewEl.innerHTML = `
    <div class="info-box yellow mb-16">
      <span>💡</span>
      <p><strong>Optimal Growth:</strong> Field is performing well. Weather conditions are favorable for ${f.crop} growth.</p>
    </div>
    <div class="grid-4" style="margin-bottom:20px">
      ${[
        {l:'FIELD HEALTH', v:`${f.health}%`,     c:'var(--primary)', sub:'Excellent'},
        {l:'WATER EFF.',   v:`${f.waterEff}%`,   c:'var(--blue)',    sub:'Above target'},
        {l:'YIELD EST.',   v:f.yield,             c:'var(--amber)',   sub:'Per hectare'},
        {l:'DAYS LEFT',    v:`${f.daysLeft}`,     c:'var(--purple)',  sub:'To harvest'},
      ].map(s => `
        <div style="border:1px solid var(--gray-100);border-radius:10px;padding:14px">
          <p style="font-size:10px;color:var(--gray-400);font-weight:700;text-transform:uppercase">${s.l}</p>
          <p style="font-size:22px;font-weight:900;color:${s.c};margin:6px 0 4px">${s.v}</p>
          <p class="text-xs text-muted">${s.sub}</p>
        </div>
      `).join('')}
    </div>
    <div class="progress-wrap progress-md mb-8">
      <div class="progress-label"><span>Growth Progress — ${f.stage} Stage</span><span>${f.progress}%</span></div>
      <div class="progress-track"><div class="progress-fill" style="width:${f.progress}%;background:var(--primary);height:10px"></div></div>
    </div>
    <div class="progress-wrap progress-md">
      <div class="progress-label"><span>Season Progress (38% · 55 of 145 days)</span><span>38%</span></div>
      <div class="progress-track"><div class="progress-fill" style="width:38%;background:var(--blue);height:10px"></div></div>
    </div>
  `;

  growthEl.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:12px;padding:8px 0">
      ${['Germination','Seedling','Vegetative','Tillering','Grain Fill','Maturity'].map((stage,i) => {
        const done = i < 3; const active = i === 3;
        const pct = done ? 100 : active ? f.progress : 0;
        const bg = done ? 'var(--primary)' : active ? 'var(--amber)' : 'var(--gray-200)';
        const lbl = done ? 'Done' : active ? 'Active' : 'Upcoming';
        const lblColor = done ? 'var(--primary)' : active ? 'var(--amber)' : 'var(--gray-400)';
        return `
          <div style="display:flex;align-items:center;gap:14px">
            <div style="width:32px;height:32px;border-radius:50%;background:${bg};color:${done||active?'#fff':'var(--gray-400)'};display:flex;align-items:center;justify-content:center;font-weight:800;flex-shrink:0">${i+1}</div>
            <div style="flex:1">
              <p style="font-size:13px;font-weight:700;color:${done||active?'var(--gray-900)':'var(--gray-400)'};margin-bottom:4px">${stage}</p>
              <div class="progress-track" style="height:5px"><div class="progress-fill" style="width:${pct}%;background:${bg};height:5px"></div></div>
            </div>
            <span style="font-size:11px;font-weight:700;color:${lblColor}">${lbl}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;

  soilEl.innerHTML = `
    <div class="grid-3">
      ${[['Nitrogen (N)','42 mg/kg','badge-green'],['Phosphorus (P)','18 mg/kg','badge-yellow'],['Potassium (K)','76 mg/kg','badge-green'],
         ['Organic Matter','3.2%','badge-green'],['pH Level','6.5','badge-blue'],['Salinity','0.8 dS/m','badge-green'],
         ['Water Retention','68%','badge-green'],['Drainage','Moderate','badge-blue']].map(([l,v,b]) => `
        <div style="background:var(--gray-50);border-radius:10px;padding:14px">
          <p class="text-xs text-muted" style="margin-bottom:6px">${l}</p>
          <p style="font-size:18px;font-weight:900;color:var(--gray-900);margin-bottom:8px">${v}</p>
          <span class="badge ${b}">Checked</span>
        </div>
      `).join('')}
    </div>
  `;

  recsEl.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:12px">
      ${[
        {icon:'💧',title:'Increase Irrigation Frequency',desc:`Based on ${f.health}% health & current temps, consider twice-daily irrigation.`,color:'var(--red)'},
        {icon:'🌿',title:'Apply Phosphorus Fertilizer',desc:'Soil analysis shows low phosphorus. Apply 20 kg/hectare of DAP within 7 days.',color:'var(--amber)'},
        {icon:'🌡️',title:'Monitor Temperature Stress',desc:'Temperatures above 30°C expected. Early morning irrigation reduces heat stress.',color:'var(--primary)'},
      ].map(r => `
        <div style="display:flex;gap:14px;padding:14px 16px;background:var(--gray-50);border-radius:10px;border-left:4px solid ${r.color}">
          <span style="font-size:24px">${r.icon}</span>
          <div>
            <p style="font-size:13px;font-weight:800;color:var(--gray-900);margin-bottom:4px">${r.title}</p>
            <p class="text-sm text-muted">${r.desc}</p>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function switchFieldTab(tabName, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.querySelectorAll('#field-tab-content > div').forEach(t => t.classList.remove('active'));
  document.getElementById(`tab-${tabName}`).classList.add('active');
  renderFieldTab(tabName);
}

function openAddFieldModal() {
  openModal('Add New Field', `
    <div class="app-form">
      <div class="form-group"><label>Field Name</label><input type="text" id="nf-name" placeholder="e.g. West Field" /></div>
      <div class="form-group"><label>Location / Block</label><input type="text" id="nf-loc" placeholder="e.g. Block A, Sector 5" /></div>
      <div class="form-group"><label>Area (hectares)</label><input type="number" id="nf-area" placeholder="e.g. 4.5" step="0.1" /></div>
      <div class="form-group"><label>Crop Type</label>
        <select id="nf-crop">${DATA.crops.map(c=>`<option>${c.name}</option>`).join('')}</select>
      </div>
      <div class="form-group"><label>Soil Type</label>
        <select id="nf-soil"><option>Loamy</option><option>Sandy</option><option>Clay</option><option>Silty</option></select>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="addField()">Save Field</button>
    </div>
  `);
}

function addField() {
  const name = document.getElementById('nf-name').value || 'New Field';
  const crop = document.getElementById('nf-crop').value;
  showToast('success', `Field "${name}" (${crop}) added successfully!`);
  closeModal();
}

/* ---- 7.3 CROP TYPES ---- */
function renderCropTypes() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h2>Crop Types</h2>
        <p>Select and manage crop types for your fields</p>
      </div>
      <button class="btn btn-primary btn-icon" onclick="openAddCropModal()">+ Add Crop</button>
    </div>
    <div class="info-box blue mb-16">
      <span>💡</span>
      <p>Select a crop to view irrigation requirements, growth stages, and recommended schedules. Backend can connect to crop database for detailed agronomy data.</p>
    </div>
    <div class="grid-3">
      ${DATA.crops.map(c => `
        <div class="crop-card" id="crop-${c.id}" onclick="selectCrop(${c.id})">
          <div class="crop-icon">${c.emoji}</div>
          <div class="crop-name">${c.name}</div>
          <div class="crop-season">${c.season}</div>
          <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--gray-100)">
            <div class="flex-between text-xs text-muted mb-8">
              <span>💧 Water Need</span><span class="font-bold" style="color:var(--blue)">${c.water}</span>
            </div>
            <div class="flex-between text-xs text-muted">
              <span>⏱ Duration</span><span class="font-bold" style="color:var(--primary)">${c.duration}</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function selectCrop(id) {
  document.querySelectorAll('.crop-card').forEach(c => c.classList.remove('selected'));
  document.getElementById(`crop-${id}`).classList.add('selected');
  const crop = DATA.crops.find(c => c.id === id);
  showToast('info', `${crop.emoji} ${crop.name} selected for your field!`);
}

function openAddCropModal() {
  openModal('Add New Crop Type', `
    <div class="app-form">
      <div class="form-group"><label>Crop Name</label><input type="text" placeholder="e.g. Sunflower" /></div>
      <div class="form-group"><label>Growing Season</label><input type="text" placeholder="e.g. Kharif (Apr-Sep)" /></div>
      <div class="form-group"><label>Water Requirement</label><input type="text" placeholder="e.g. 600-800mm" /></div>
      <div class="form-group"><label>Duration</label><input type="text" placeholder="e.g. 90-120 days" /></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="closeModal();showToast('success','Crop type added!')">Save</button>
    </div>
  `);
}

/* ---- 7.4 IRRIGATION ZONES ---- */
function renderIrrigationZones() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left"><h2>Irrigation Zones</h2><p>Monitor moisture levels and irrigation status for each zone</p></div>
      <button class="btn btn-primary btn-icon" onclick="openModal('Add Zone',addZoneForm())">+ Add Zone</button>
    </div>
    <div class="grid-3 mb-24" id="zone-cards">
      ${DATA.zones.map(z => `
        <div class="zone-card" onclick="showZoneDetail(${z.id})">
          <div class="flex-between mb-8">
            <p class="font-bold text-sm">${z.name}</p>
            <span class="badge ${z.status==='Active'?'badge-green':z.status==='Scheduled'?'badge-yellow':'badge-gray'}">${z.status}</span>
          </div>
          <div class="text-sm text-muted mb-16">
            <div class="flex-between mb-4"><span>Crop:</span><span class="font-bold" style="color:var(--gray-700)">${z.crop}</span></div>
            <div class="flex-between"><span>Next Run:</span><span class="font-bold" style="color:var(--gray-700)">${z.next}</span></div>
          </div>
          <div class="progress-wrap progress-sm mb-8">
            <div class="progress-label"><span>Soil Moisture</span><span>${z.moisture}%</span></div>
            <div class="progress-track"><div class="progress-fill" style="width:${z.moisture}%;background:${z.moisture>50?'var(--primary)':z.moisture>35?'var(--amber)':'var(--red)'};height:7px"></div></div>
          </div>
          <p style="font-size:28px;font-weight:900;color:var(--gray-900);margin-top:8px">${z.moisture}%</p>
          <div style="margin-top:12px">
            <div class="progress-wrap progress-sm">
              <div class="progress-label"><span>Efficiency</span><span>${z.efficiency}%</span></div>
              <div class="progress-track"><div class="progress-fill" style="width:${z.efficiency}%;background:var(--blue);height:7px"></div></div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- 7-Day Irrigation Plan -->
    <div class="card">
      <div class="card-header"><h3>7-Day Irrigation Plan</h3></div>
      <div class="info-box yellow" style="margin:16px 20px 0">
        <span>⚠️</span>
        <p><strong>Weather Alert:</strong> Rain expected Thursday and Friday. Irrigation auto-adjusted for those days to save water.</p>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Day</th><th>Weather</th><th>Zone</th><th>Start Time</th><th>Duration</th><th>Water Est.</th><th>Status</th></tr></thead>
          <tbody>
            ${[
              ['Wed Dec 24','☀️ Sunny 21°C','Zone 1','6:00 AM','45 min','285 L','Scheduled'],
              ['Thu Dec 25','🌧️ Rainy 18°C','All','—','0 min','0 L','Skipped – Rain'],
              ['Fri Dec 26','⛈️ Heavy Rain','All','—','0 min','0 L','Skipped – Rain'],
              ['Sat Dec 27','🌤️ Partly Cloudy','Zone 1,2','6:00 AM','30 min','190 L','Scheduled'],
              ['Sun Dec 28','☀️ Sunny 21°C','All Zones','6:00 AM','40 min','260 L','Scheduled'],
            ].map(([d,w,z,t,dur,wt,st]) => `
              <tr>
                <td class="td-bold">${d}</td>
                <td>${w}</td>
                <td>${z}</td>
                <td>${t}</td>
                <td>${dur}</td>
                <td style="color:var(--blue);font-weight:700">${wt}</td>
                <td><span class="badge ${st.includes('Skip')?'badge-gray':'badge-yellow'}">${st}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function showZoneDetail(id) {
  const z = DATA.zones.find(z => z.id === id);
  openModal(`Zone Detail — ${z.name}`, `
    <div>
      <div class="flex-between mb-16">
        <span class="badge ${z.status==='Active'?'badge-green':z.status==='Scheduled'?'badge-yellow':'badge-gray'}">${z.status}</span>
        <span class="text-sm text-muted">Efficiency: ${z.efficiency}%</span>
      </div>
      <div class="app-form">
        <div class="form-group"><label>Zone Name</label><input value="${z.name}" /></div>
        <div class="form-group"><label>Crop Type</label><input value="${z.crop}" /></div>
        <div class="form-group"><label>Current Moisture</label><input value="${z.moisture}%" readonly /></div>
        <div class="form-group"><label>Next Scheduled</label><input value="${z.next}" /></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="closeModal();showToast('success','Zone updated!')">Save Changes</button>
      </div>
    </div>
  `);
}

function addZoneForm() {
  return `
    <div class="app-form">
      <div class="form-group"><label>Zone Name</label><input type="text" placeholder="e.g. Zone 4 – West Field" /></div>
      <div class="form-group"><label>Linked Field</label><select>${DATA.fields.map(f=>`<option>${f.name}</option>`).join('')}</select></div>
      <div class="form-group"><label>Crop</label><select>${DATA.crops.map(c=>`<option>${c.name}</option>`).join('')}</select></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="closeModal();showToast('success','Zone added!')">Save</button>
    </div>
  `;
}

/* ---- 7.5 SENSOR DATA ---- */
function renderSensorData() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left"><h2>Sensor Data</h2><p>Real-time IoT sensor monitoring</p></div>
      <div class="live-pill"><span class="status-dot online"></span> Live Updates Active</div>
    </div>

    <!-- Live Sensor Cards -->
    <div class="sensor-grid" id="sensor-cards-grid">
      ${DATA.sensors.map(s => `
        <div class="card sensor-card">
          <div class="flex-between mb-8">
            <div class="flex gap-8"><span style="font-size:20px">${s.icon}</span><span class="text-sm font-bold" style="color:var(--gray-700)">${s.label}</span></div>
            <span class="badge ${s.status==='Active'?'badge-green':'badge-yellow'}">${s.status}</span>
          </div>
          <div class="sensor-value" id="sv-${s.id}">${s.id==='ph'?s.value.toFixed(1):s.value}${s.unit}</div>
          <div class="sensor-location">📍 ${s.location}</div>
          <div class="progress-wrap progress-sm mt-8">
            <div class="progress-track"><div class="progress-fill" style="width:${((s.value-s.min)/(s.max-s.min)*100).toFixed(0)}%;background:${s.status==='Active'?'var(--primary)':'var(--amber)'};height:6px"></div></div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Sensor History Chart -->
    <div class="card chart-card mb-24">
      <div class="card-header"><h3>Soil Moisture History (Today)</h3></div>
      <div class="chart-wrap"><canvas id="chart-sensor-history"></canvas></div>
    </div>

    <!-- Sensor Readings Table -->
    <div class="card">
      <div class="card-header"><h3>Recent Sensor Readings</h3></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Timestamp</th><th>Sensor</th><th>Location</th><th>Reading</th><th>Status</th></tr></thead>
          <tbody>
            ${DATA.sensors.map(s => `
              <tr>
                <td class="text-xs td-mono">${new Date().toLocaleTimeString()}</td>
                <td class="td-bold">${s.label}</td>
                <td class="text-sm text-muted">${s.location}</td>
                <td style="font-weight:700;color:var(--gray-900)">${s.id==='ph'?s.value.toFixed(1):s.value}${s.unit}</td>
                <td><span class="badge ${s.status==='Active'?'badge-green':'badge-yellow'}">${s.status==='Active'?'Normal':s.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  setTimeout(() => {
    const ctx = document.getElementById('chart-sensor-history');
    if (!ctx) return;
    const hours = Array.from({length:12},(_, i) => `${8+i}:00`);
    const moisture = Array.from({length:12}, () => Math.round(35 + Math.random() * 35));
    AppState.charts.sensorHistory = new Chart(ctx, {
      type: 'line',
      data: {
        labels: hours,
        datasets: [{
          label: 'Soil Moisture %',
          data: moisture,
          borderColor: '#0f766e', backgroundColor: 'rgba(15,118,110,.1)',
          fill: true, tension: 0.4, pointRadius: 4,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: { y: { min: 20, max: 80 }, x: { grid: { display: false } } }
      }
    });
  }, 50);
}

/* ---- 7.6 WEATHER ---- */
function renderWeather() {
  const content = document.getElementById('page-content');
  const w = DATA.weather;
  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left"><h2>Weather Data</h2><p>Live weather and 7-day forecast for irrigation planning</p></div>
      <div class="flex gap-8">
        <button class="btn btn-secondary btn-icon">📍 Kasur, Punjab</button>
        <button class="btn btn-primary btn-icon" onclick="showToast('info','Weather data refreshed!')">🔄 Refresh</button>
      </div>
    </div>

    <!-- Current Weather -->
    <div class="card mb-24" style="padding:32px">
      <div class="flex gap-24" style="flex-wrap:wrap;align-items:center">
        <span style="font-size:80px">${w.current.icon}</span>
        <div>
          <p style="font-size:56px;font-weight:900;color:var(--gray-900);line-height:1">${w.current.temp}°C</p>
          <p style="font-size:20px;color:var(--gray-500);margin-top:4px">${w.current.condition}</p>
          <div class="flex gap-24 mt-16" style="flex-wrap:wrap">
            ${[
              ['💧','Precipitation',`${w.current.precip}%`],
              ['💨','Wind Speed',`${w.current.wind} km/h`],
              ['💦','Humidity',`${w.current.humidity}%`],
              ['🌡️','Feels Like',`${w.current.feelsLike}°C`],
            ].map(([i,l,v])=>`
              <div>
                <p class="text-xs text-muted">${i} ${l}</p>
                <p class="font-bold" style="font-size:15px">${v}</p>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="flex-1" style="max-width:300px">
          <div class="info-box green" style="margin:0">
            <span>🌱</span>
            <p><strong>Irrigation Advisory:</strong> Conditions are favorable. Proceed with scheduled irrigation. Light winds help in efficient water distribution.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 7-Day Forecast -->
    <div class="card mb-24" style="padding:24px">
      <h3 class="font-bold mb-16" style="font-size:14px">7-Day Weather Forecast</h3>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px">
        ${w.forecast.map((d,i) => `
          <div class="weather-day ${i===0?'today':''}">
            <p style="font-size:11px;font-weight:700;margin-bottom:6px;color:${i===0?'#dcfce7':'var(--gray-400)'}">${d.day}</p>
            <span style="font-size:26px">${d.icon}</span>
            <p style="font-size:10px;margin:4px 0;color:${i===0?'#dcfce7':'var(--gray-400)'}">${d.condition}</p>
            <p class="wd-temp" style="font-size:14px;font-weight:900;color:${i===0?'#fff':'var(--gray-900)'};margin:0">${d.hi}°</p>
            <p style="font-size:11px;color:${i===0?'#86efac':'var(--gray-400)'}">${d.lo}°</p>
            <p style="font-size:10px;font-weight:700;color:${d.precip>50?'var(--blue)':'var(--gray-400)'};margin-top:4px">${d.precip}% 💧</p>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Irrigation Impact -->
    <div class="card">
      <div class="card-header"><h3>Weather Impact on Irrigation</h3></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Day</th><th>Condition</th><th>Impact</th><th>Irrigation Adjustment</th><th>Recommended</th></tr></thead>
          <tbody>
            ${w.forecast.map(d => `
              <tr>
                <td class="td-bold">${d.day}</td>
                <td>${d.icon} ${d.condition}</td>
                <td><span class="badge ${d.precip>70?'badge-blue':d.precip>30?'badge-yellow':'badge-green'}">${d.precip>70?'High Rain':d.precip>30?'Light Rain':'Normal'}</span></td>
                <td>${d.precip>70?'Skip irrigation':'Normal schedule'}</td>
                <td style="font-weight:700;color:${d.precip>70?'var(--red)':'var(--primary)'}">${d.precip>70?'Cancel':'Proceed'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* ---- 7.7 DEVICE HEALTH ---- */
function renderDeviceHealth() {
  const content = document.getElementById('page-content');
  const total = DATA.devices.length;
  const online = DATA.devices.filter(d => d.status === 'Online').length;
  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left"><h2>Device Health</h2><p>Monitor all IoT devices and sensors</p></div>
      <div class="flex gap-8">
        <button class="btn btn-secondary btn-icon" onclick="showToast('info','Running diagnostics...')">🔍 Run Diagnostics</button>
        <button class="btn btn-primary btn-icon" onclick="openModal('Add Device', addDeviceForm())">+ Add Device</button>
      </div>
    </div>

    <!-- Summary -->
    <div class="grid-4 mb-24">
      ${[
        {icon:'🔧',val:`${online}/${total}`,lbl:'Devices Online',trend:'All critical devices OK',c:'var(--primary)'},
        {icon:'🔋',val:'72%',lbl:'Avg Battery Level',trend:'1 device needs replacement',c:'var(--amber)'},
        {icon:'📶',val:'87%',lbl:'Avg Signal Strength',trend:'Strong connectivity',c:'var(--blue)'},
        {icon:'⚠️',val:'1',lbl:'Active Warnings',trend:'pH Sensor C1 low battery',c:'var(--red)'},
      ].map(s=>`
        <div class="card stat-card">
          <div class="stat-icon">${s.icon}</div>
          <div class="stat-value" style="color:${s.c}">${s.val}</div>
          <div class="stat-label">${s.lbl}</div>
          <div class="stat-trend trend-neutral">${s.trend}</div>
        </div>
      `).join('')}
    </div>

    <!-- Device Cards -->
    <div class="grid-3">
      ${DATA.devices.map(d => `
        <div class="card" style="padding:18px">
          <div class="flex-between mb-12">
            <div>
              <p class="font-bold text-sm" style="color:var(--gray-900)">${d.name}</p>
              <p class="text-xs text-muted" style="margin-top:2px">${d.type} · ${d.location}</p>
            </div>
            <span class="badge ${d.status==='Online'?'badge-green':'badge-yellow'}">${d.status}</span>
          </div>
          <div class="progress-wrap progress-sm mb-8">
            <div class="progress-label"><span>Battery</span><span>${d.battery}%</span></div>
            <div class="progress-track"><div class="progress-fill" style="width:${d.battery}%;background:${d.battery>50?'var(--primary)':d.battery>25?'var(--amber)':'var(--red)'};height:6px"></div></div>
          </div>
          <div class="progress-wrap progress-sm mb-8">
            <div class="progress-label"><span>Signal</span><span>${d.signal}%</span></div>
            <div class="progress-track"><div class="progress-fill" style="width:${d.signal}%;background:var(--blue);height:6px"></div></div>
          </div>
          <div class="flex-between text-xs text-muted">
            <span>Firmware: ${d.firmware}</span>
            <span>Last seen: ${d.lastSeen}</span>
          </div>
          ${d.battery < 20 ? '<p class="text-xs" style="color:var(--red);font-weight:700;margin-top:8px">⚠️ Low battery — replace soon!</p>' : ''}
          <div class="flex gap-8 mt-12">
            <button class="btn btn-sm btn-outline flex-1" onclick="showToast('info','Pinging ${d.id}...')">🔍 Ping</button>
            <button class="btn btn-sm btn-secondary flex-1" onclick="showToast('success','${d.name} updated!')">⬆️ Update</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function addDeviceForm() {
  return `
    <div class="app-form">
      <div class="form-group"><label>Device Name</label><input type="text" placeholder="e.g. Flow Meter FM2" /></div>
      <div class="form-group"><label>Device Type</label>
        <select><option>Sensor</option><option>Controller</option><option>Meter</option><option>Station</option></select>
      </div>
      <div class="form-group"><label>Location</label><input type="text" placeholder="e.g. Field A – Zone 2" /></div>
      <div class="form-group"><label>Device ID</label><input type="text" placeholder="e.g. DEV007" /></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="closeModal();showToast('success','Device added!')">Register</button>
    </div>
  `;
}

/* ---- 7.8 AUTO IRRIGATION ---- */
function renderAutoIrrigation() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left"><h2>Automatic Irrigation</h2><p>AI-powered irrigation based on sensor data and weather</p></div>
      <span class="badge badge-green" style="font-size:13px;padding:6px 16px">🤖 Auto Mode: Active</span>
    </div>

    <div class="info-box green mb-24">
      <span>✅</span>
      <p><strong>Automatic Mode Active:</strong> System is monitoring sensor thresholds and will trigger irrigation automatically. Rain integration is enabled — irrigation will be skipped on forecasted rainy days.</p>
    </div>

    <!-- Automation Rules -->
    <div class="card mb-24">
      <div class="card-header"><h3>Automation Rules & Thresholds</h3>
        <button class="btn btn-sm btn-primary" onclick="showToast('success','Rules saved!')">Save Rules</button>
      </div>
      <div class="card-body app-form">
        <div class="form-section-title">Moisture Thresholds</div>
        <div class="grid-2">
          ${[
            {l:'Start Irrigation Below (%)', v:'40', h:'System starts irrigation when soil moisture falls below this value.'},
            {l:'Stop Irrigation Above (%)', v:'70', h:'System stops irrigation when soil moisture reaches this value.'},
            {l:'Critical Low Alert (%)', v:'25', h:'Send alert when moisture drops below this critical level.'},
            {l:'Maximum Duration (min)', v:'45', h:'Maximum single irrigation session duration.'},
          ].map(f=>`
            <div class="form-group">
              <label>${f.l}</label>
              <input type="number" value="${f.v}" />
              <p class="form-help">${f.h}</p>
            </div>
          `).join('')}
        </div>
        <div class="form-section-title mt-24">Environmental Cutoffs</div>
        <div class="grid-2">
          ${[
            {l:'Temperature Cutoff (°C)', v:'35', h:'Skip irrigation if temperature exceeds this value.'},
            {l:'Wind Speed Cutoff (km/h)', v:'20', h:'Pause drip irrigation if wind is too strong.'},
          ].map(f=>`
            <div class="form-group">
              <label>${f.l}</label>
              <input type="number" value="${f.v}" />
              <p class="form-help">${f.h}</p>
            </div>
          `).join('')}
          <div class="form-group">
            <label>Rain Integration</label>
            <div class="flex gap-12 mt-8">
              <button class="toggle-switch on" id="toggle-rain" onclick="toggleSwitch(this)">
                <span class="toggle-knob"></span>
              </button>
              <span class="text-sm text-muted">Skip irrigation when rain is forecast</span>
            </div>
          </div>
          <div class="form-group">
            <label>Night Irrigation (10 PM – 6 AM)</label>
            <div class="flex gap-12 mt-8">
              <button class="toggle-switch on" id="toggle-night" onclick="toggleSwitch(this)">
                <span class="toggle-knob"></span>
              </button>
              <span class="text-sm text-muted">Allow irrigation at night for water efficiency</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Zone Automation Status -->
    <div class="card">
      <div class="card-header"><h3>Zone Automation Status</h3></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Zone</th><th>Current Moisture</th><th>Threshold</th><th>Auto Status</th><th>Last Run</th><th>Enable</th></tr></thead>
          <tbody>
            ${DATA.zones.map(z => `
              <tr>
                <td class="td-bold">${z.name}</td>
                <td>
                  <div class="flex gap-8">
                    <div style="width:60px;height:6px;background:var(--gray-200);border-radius:99px;margin-top:5px">
                      <div style="width:${z.moisture}%;height:6px;background:${z.moisture>50?'var(--primary)':'var(--amber)'};border-radius:99px"></div>
                    </div>
                    <span class="font-bold">${z.moisture}%</span>
                  </div>
                </td>
                <td>Start &lt; 40% / Stop &gt; 70%</td>
                <td><span class="badge ${z.status==='Active'?'badge-green':'badge-yellow'}">${z.status==='Active'?'Running':'Monitoring'}</span></td>
                <td class="text-xs text-muted">2 hrs ago</td>
                <td>
                  <button class="toggle-switch on" onclick="toggleSwitch(this)">
                    <span class="toggle-knob"></span>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* ---- 7.9 MANUAL CONTROL ---- */
function renderManualControl() {
  const content = document.getElementById('page-content');
  let masterOn = true;
  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left"><h2>Manual Irrigation Control</h2><p>Directly start, stop, and schedule irrigation pumps</p></div>
    </div>

    <!-- Master Control -->
    <div class="card mb-20" style="padding:18px 22px">
      <div class="flex-between">
        <div>
          <p class="font-bold" style="font-size:15px">Master System Control</p>
          <p class="text-sm text-muted" style="margin-top:3px">Enable or disable ALL irrigation zones at once</p>
        </div>
        <div class="flex gap-12">
          <span id="master-lbl" class="font-bold" style="color:var(--primary)">System: Active</span>
          <button class="toggle-switch on" id="master-toggle" onclick="toggleMaster()">
            <span class="toggle-knob"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- Zone Control Cards -->
    <div class="grid-2">
      <div class="control-card running">
        <div class="flex-between mb-12">
          <div class="flex gap-8"><span>🚿</span><span class="font-bold">Field A – Zone 1</span></div>
          <span class="badge badge-blue" id="z1-badge">Running</span>
        </div>
        <div class="grid-2 text-sm mb-14">
          <div><p class="text-xs text-muted">DURATION</p><p class="font-bold">15 min</p></div>
          <div><p class="text-xs text-muted">FLOW RATE</p><p class="font-bold">12 L/m</p></div>
          <div><p class="text-xs text-muted">MOISTURE</p><p class="font-bold">45%</p></div>
          <div><p class="text-xs text-muted">REMAINING</p><p class="font-bold" style="color:var(--blue)">8 min</p></div>
        </div>
        <div class="flex gap-8">
          <button class="btn btn-danger btn-sm flex-1" id="z1-btn" onclick="toggleZone(1)">⏹ Stop</button>
          <button class="btn btn-outline btn-sm flex-1" onclick="openModal('Schedule Zone 1',scheduleZoneForm(1))">📅 Schedule</button>
        </div>
      </div>

      <div class="control-card stopped">
        <div class="flex-between mb-12">
          <div class="flex gap-8"><span>🚿</span><span class="font-bold">Field A – Zone 2</span></div>
          <span class="badge badge-red" id="z2-badge">Stopped</span>
        </div>
        <div class="grid-2 text-sm mb-14">
          <div><p class="text-xs text-muted">LAST RUN</p><p class="font-bold">2 hrs ago</p></div>
          <div><p class="text-xs text-muted">MOISTURE</p><p class="font-bold">62%</p></div>
          <div><p class="text-xs text-muted">NEXT SCHED</p><p class="font-bold">6:00 PM</p></div>
        </div>
        <div class="flex gap-8">
          <button class="btn btn-primary btn-sm flex-1" id="z2-btn" onclick="toggleZone(2)">▶ Start</button>
          <button class="btn btn-outline btn-sm flex-1" onclick="openModal('Schedule Zone 2',scheduleZoneForm(2))">📅 Schedule</button>
        </div>
      </div>

      <div class="control-card scheduled">
        <div class="flex-between mb-12">
          <div class="flex gap-8"><span>🚿</span><span class="font-bold">Field B – Zone 1</span></div>
          <span class="badge badge-yellow" id="z3-badge">Scheduled</span>
        </div>
        <div class="grid-2 text-sm mb-14">
          <div><p class="text-xs text-muted">START TIME</p><p class="font-bold">5:30 PM</p></div>
          <div><p class="text-xs text-muted">DURATION</p><p class="font-bold">20 min</p></div>
          <div><p class="text-xs text-muted">MOISTURE</p><p class="font-bold">38%</p></div>
          <div><p class="text-xs text-muted">STARTS IN</p><p class="font-bold" style="color:var(--amber)">2h 15m</p></div>
        </div>
        <div class="flex gap-8">
          <button class="btn btn-primary btn-sm flex-1" onclick="showToast('success','Zone 3 started manually!')">▶ Start Now</button>
          <button class="btn btn-outline btn-sm flex-1" onclick="showToast('info','Schedule cancelled')">✕ Cancel</button>
        </div>
      </div>

      <div class="control-card stopped">
        <div class="flex-between mb-12">
          <div class="flex gap-8"><span>🚿</span><span class="font-bold">Field B – Zone 2</span></div>
          <span class="badge badge-red" id="z4-badge">Stopped</span>
        </div>
        <div class="grid-2 text-sm mb-14">
          <div><p class="text-xs text-muted">LAST RUN</p><p class="font-bold">1 day ago</p></div>
          <div><p class="text-xs text-muted">MOISTURE</p><p class="font-bold">52%</p></div>
        </div>
        <div class="flex gap-8">
          <button class="btn btn-primary btn-sm flex-1" onclick="toggleZone(4)">▶ Start</button>
          <button class="btn btn-outline btn-sm flex-1" onclick="openModal('Schedule Zone 4',scheduleZoneForm(4))">📅 Schedule</button>
        </div>
      </div>
    </div>
  `;
}

function toggleZone(n) {
  const btn = document.getElementById(`z${n}-btn`);
  const badge = document.getElementById(`z${n}-badge`);
  const card = btn?.closest('.control-card');
  if (!btn) return;
  if (btn.textContent.includes('Stop')) {
    btn.className = 'btn btn-primary btn-sm flex-1';
    btn.innerHTML = '▶ Start';
    if (badge) { badge.className = 'badge badge-red'; badge.textContent = 'Stopped'; }
    if (card) { card.classList.remove('running'); card.classList.add('stopped'); }
    showToast('info', `Zone ${n} stopped.`);
  } else {
    btn.className = 'btn btn-danger btn-sm flex-1';
    btn.innerHTML = '⏹ Stop';
    if (badge) { badge.className = 'badge badge-blue'; badge.textContent = 'Running'; }
    if (card) { card.classList.remove('stopped'); card.classList.add('running'); }
    showToast('success', `Zone ${n} irrigation started!`);
  }
}

function toggleMaster() {
  const lbl = document.getElementById('master-lbl');
  const toggle = document.getElementById('master-toggle');
  if (!lbl) return;
  if (toggle.classList.contains('on')) {
    toggle.classList.replace('on','off');
    lbl.style.color = 'var(--gray-400)';
    lbl.textContent = 'System: Offline';
    showToast('warning', 'Master system disabled. All pumps stopped.');
  } else {
    toggle.classList.replace('off','on');
    lbl.style.color = 'var(--primary)';
    lbl.textContent = 'System: Active';
    showToast('success', 'Master system enabled.');
  }
}

function scheduleZoneForm(n) {
  return `
    <div class="app-form">
      <div class="form-group"><label>Zone</label><input value="Zone ${n}" readonly /></div>
      <div class="form-group"><label>Start Time</label><input type="time" value="06:00" /></div>
      <div class="form-group"><label>Duration (minutes)</label><input type="number" value="20" min="1" max="120" /></div>
      <div class="form-group"><label>Repeat</label>
        <select><option>Once</option><option>Daily</option><option>Every 2 days</option><option>Weekly</option></select>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="closeModal();showToast('success','Schedule saved for Zone ${n}!')">Save Schedule</button>
    </div>
  `;
}

/* ---- 7.10 SCHEDULING ---- */
function renderScheduling() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left"><h2>Irrigation Scheduling</h2><p>Plan and manage irrigation schedules</p></div>
      <button class="btn btn-primary btn-icon" onclick="openModal('New Schedule', scheduleZoneForm(1))">+ Add Schedule</button>
    </div>

    <!-- Schedule Calendar View (simplified list) -->
    <div class="card mb-24">
      <div class="card-header"><h3>Upcoming Schedules</h3></div>
      <div class="card-body">
        ${DATA.schedules.map(s => `
          <div class="schedule-item">
            <div class="si-info">
              <p>${s.zone}</p>
              <span>🕐 ${s.time} · ⏱ ${s.duration} · ${s.type==='Auto'?'🤖':'👤'} ${s.type}</span>
            </div>
            <div class="si-actions">
              <button class="btn btn-sm btn-outline" onclick="showToast('info','Editing schedule...')">✏️ Edit</button>
              <button class="btn btn-sm btn-danger" onclick="this.closest('.schedule-item').remove();showToast('warning','Schedule removed')">🗑️</button>
            </div>
          </div>
        `).join('')}
        <button style="width:100%;padding:14px;border:2px dashed var(--gray-300);border-radius:10px;color:var(--gray-400);background:none;cursor:pointer;font-size:13px;font-weight:700;margin-top:8px" onclick="openModal('New Schedule',scheduleZoneForm(1))">+ Add New Schedule</button>
      </div>
    </div>

    <!-- Weekly Calendar Grid -->
    <div class="card">
      <div class="card-header"><h3>Weekly Schedule View</h3></div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Zone</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th><th>Sun</th></tr>
          </thead>
          <tbody>
            ${DATA.zones.map(z => `
              <tr>
                <td class="td-bold">${z.name}</td>
                ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => `
                  <td>
                    ${['Mon','Wed','Fri'].includes(d) ? `<span class="badge badge-green" style="font-size:9px">6:00 AM</span>` :
                      d==='Thu' ? `<span class="badge badge-blue" style="font-size:9px">Rain Skip</span>` :
                      `<span style="color:var(--gray-300)">—</span>`}
                  </td>
                `).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* ---- 7.11 IOT SETUP ---- */
function renderIoTSetup() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left"><h2>IoT Controller Setup</h2><p>Configure and connect IoT controllers and sensors</p></div>
      <button class="btn btn-primary btn-icon" onclick="openModal('Add Controller',addDeviceForm())">+ Add Controller</button>
    </div>

    <div class="info-box blue mb-24">
      <span>🔌</span>
      <p><strong>Backend Integration:</strong> Connect IoT devices via MQTT broker at <code>mqtt://your-broker:1883</code>. Each zone maps to topic <code>irrigation/{zoneId}/control</code>. Sensor data flows via <code>sensors/{deviceId}/data</code>.</p>
    </div>

    <!-- Connection Settings -->
    <div class="card mb-24">
      <div class="card-header"><h3>MQTT Broker Configuration</h3>
        <button class="btn btn-sm btn-primary" onclick="showToast('success','MQTT settings saved!')">Save</button>
      </div>
      <div class="card-body app-form">
        <div class="grid-2">
          <div class="form-group"><label>Broker Host</label><input value="mqtt.smartirrig.pk" /><p class="form-help">MQTT broker IP or hostname</p></div>
          <div class="form-group"><label>Port</label><input type="number" value="1883" /><p class="form-help">Default: 1883 (plain), 8883 (TLS)</p></div>
          <div class="form-group"><label>Client ID</label><input value="irrigation-client-001" /></div>
          <div class="form-group"><label>Keep-Alive (sec)</label><input type="number" value="60" /></div>
          <div class="form-group"><label>Username</label><input value="iot_admin" /></div>
          <div class="form-group"><label>Password</label><input type="password" value="securepass123" /></div>
        </div>
        <div class="form-group">
          <div class="flex gap-12">
            <button class="toggle-switch on" onclick="toggleSwitch(this)"><span class="toggle-knob"></span></button>
            <span class="text-sm text-muted">Enable TLS/SSL encryption</span>
          </div>
        </div>
        <button class="btn btn-outline btn-icon" onclick="showToast('success','Connected to MQTT broker!')">🔌 Test Connection</button>
      </div>
    </div>

    <!-- Connected Devices -->
    <div class="card">
      <div class="card-header"><h3>Connected IoT Devices</h3></div>
      <div class="card-body">
        <div class="grid-2">
          ${DATA.devices.map(d => `
            <div class="iot-device-card">
              <div class="flex-between mb-10">
                <div>
                  <p class="font-bold text-sm">${d.name}</p>
                  <p class="text-xs text-muted">${d.id} · ${d.type}</p>
                </div>
                <div class="iot-device-status">
                  <div class="iot-status-dot ${d.status==='Online'?'connected':'disconnected'}"></div>
                  <span class="text-xs font-bold" style="color:${d.status==='Online'?'var(--primary)':'var(--red)'}">${d.status}</span>
                </div>
              </div>
              <p class="text-xs text-muted mb-8">Topic: sensors/${d.id.toLowerCase()}/data</p>
              <div class="flex gap-8">
                <button class="btn btn-sm btn-outline flex-1" onclick="showToast('info','${d.name} pinged')">Ping</button>
                <button class="btn btn-sm ${d.status==='Online'?'btn-danger':'btn-primary'} flex-1"
                  onclick="showToast('${d.status==='Online'?'warning':'success'}','${d.name} ${d.status==='Online'?'disconnected':'connected'}')">
                  ${d.status==='Online'?'Disconnect':'Connect'}
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/* ---- 7.12 REPORTS ---- */
function renderReports() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left"><h2>Reports and Analytics</h2><p>Detailed irrigation performance and resource reports</p></div>
      <div class="page-actions">
        <select class="btn btn-secondary" style="border:none;font-family:inherit;font-weight:700">
          <option>Last 30 Days</option><option>Last 7 Days</option><option>Last 3 Months</option><option>Custom Range</option>
        </select>
        <button class="btn btn-outline btn-icon" onclick="showToast('info','Exporting PDF...')">📥 Export PDF</button>
        <button class="btn btn-primary btn-icon" onclick="showToast('info','Exporting CSV...')">📊 Export CSV</button>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="grid-4 mb-24">
      ${[
        {icon:'💧',val:'7,240 L',lbl:'Total Water Used',note:'↓ 12% less than last month',c:'var(--blue)'},
        {icon:'💰',val:'PKR 4,320',lbl:'Cost Savings',note:'vs manual irrigation',c:'var(--amber)'},
        {icon:'📈',val:'89%',lbl:'System Efficiency',note:'Above 85% target',c:'var(--primary)'},
        {icon:'⏱️',val:'142 hrs',lbl:'Total Irrigation Time',note:'This month',c:'var(--purple)'},
      ].map(s=>`
        <div class="card stat-card">
          <div class="stat-icon">${s.icon}</div>
          <div class="stat-value" style="color:${s.c}">${s.val}</div>
          <div class="stat-label">${s.lbl}</div>
          <div class="stat-trend trend-up">${s.note}</div>
        </div>
      `).join('')}
    </div>

    <!-- Charts -->
    <div class="grid-2 mb-24">
      <div class="card chart-card">
        <div class="card-header"><h3>Monthly Water Usage (L)</h3></div>
        <div class="chart-wrap"><canvas id="chart-monthly-water"></canvas></div>
      </div>
      <div class="card chart-card">
        <div class="card-header"><h3>Irrigation Efficiency (%)</h3></div>
        <div class="chart-wrap"><canvas id="chart-efficiency"></canvas></div>
      </div>
    </div>

    <!-- Zone Performance Table -->
    <div class="card">
      <div class="card-header"><h3>Zone Performance Summary</h3></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Zone</th><th>Field</th><th>Water Used</th><th>Water Saved</th><th>Efficiency</th><th>Runs</th><th>Status</th></tr></thead>
          <tbody>
            ${DATA.zones.map((z,i)=>`
              <tr>
                <td class="td-bold">${z.name}</td>
                <td>${DATA.fields[i]?.crop || 'N/A'}</td>
                <td style="color:var(--blue);font-weight:700">${[1245,890,650][i]} L</td>
                <td style="color:var(--primary);font-weight:700">${[340,210,120][i]} L</td>
                <td>
                  <div class="flex gap-8">
                    <div style="width:80px;height:6px;background:var(--gray-200);border-radius:99px;margin-top:5px">
                      <div style="width:${z.efficiency}%;height:6px;background:var(--primary);border-radius:99px"></div>
                    </div>
                    <span class="font-bold">${z.efficiency}%</span>
                  </div>
                </td>
                <td>${[12,9,15][i]} runs</td>
                <td><span class="badge ${z.status==='Active'?'badge-green':z.status==='Scheduled'?'badge-yellow':'badge-gray'}">${z.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  setTimeout(() => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const ctx1 = document.getElementById('chart-monthly-water');
    if (ctx1) {
      AppState.charts.monthlyWater = new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [{
            label: 'Water Used (L)',
            data: DATA.monthlyWater,
            backgroundColor: months.map((_,i) => i === 4 ? '#22c55e' : '#0f766e'),
            borderRadius: 6,
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true }, x: { grid: { display: false } } }
        }
      });
    }

    const ctx2 = document.getElementById('chart-efficiency');
    if (ctx2) {
      AppState.charts.efficiency = new Chart(ctx2, {
        type: 'line',
        data: {
          labels: months.slice(0,6),
          datasets: [{
            label: 'Efficiency (%)',
            data: [78,82,85,88,91,89],
            borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,.1)',
            fill: true, tension: 0.4, pointRadius: 5,
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { min: 70, max: 100 } }
        }
      });
    }
  }, 50);
}

/* ---- 7.13 ACTIVITY LOGS ---- */
function renderActivityLogs() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left"><h2>Activity Logs</h2><p>Complete system activity history and audit trail</p></div>
      <div class="page-actions">
        <button class="btn btn-secondary btn-icon" onclick="showToast('info','Logs exported!')">📥 Export</button>
        <button class="btn btn-outline btn-icon" onclick="showToast('warning','Logs cleared!')">🗑️ Clear Logs</button>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="card mb-16" style="padding:14px 18px">
      <div class="flex gap-12" style="flex-wrap:wrap;align-items:center">
        <span class="text-sm font-bold text-muted">Filter:</span>
        ${['All','Completed','Warning','Updated'].map((f,i)=>`
          <button class="btn btn-sm ${i===0?'btn-primary':'btn-secondary'}" onclick="filterLogs('${f}',this)">${f}</button>
        `).join('')}
        <input type="search" placeholder="Search logs..." style="margin-left:auto;padding:7px 14px;border:1.5px solid var(--gray-200);border-radius:8px;font-size:13px;width:200px;outline:none" />
      </div>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table id="logs-table">
          <thead><tr><th>Time</th><th>Activity</th><th>Zone</th><th>Performed By</th><th>Status</th></tr></thead>
          <tbody>
            ${DATA.activityLogs.map(l=>`
              <tr>
                <td class="td-mono text-xs">${l.time}</td>
                <td class="td-bold">${l.activity}</td>
                <td class="text-sm text-muted">${l.zone}</td>
                <td class="text-sm">${l.user}</td>
                <td><span class="badge ${getStatusBadge(l.status)}">${l.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function filterLogs(status, btn) {
  document.querySelectorAll('.btn-primary.btn-sm, .btn-secondary.btn-sm').forEach(b => {
    b.classList.replace('btn-primary','btn-secondary');
  });
  btn.classList.replace('btn-secondary','btn-primary');
}

/* ---- 7.14 NOTIFICATIONS ---- */
function renderNotifications() {
  const content = document.getElementById('page-content');
  const unread = DATA.alerts.filter(a => !a.read).length;
  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left"><h2>Notifications</h2><p>${unread} unread notifications</p></div>
      <div class="page-actions">
        <button class="btn btn-secondary btn-icon" onclick="markAllRead()">✓ Mark All Read</button>
        <button class="btn btn-outline btn-icon" onclick="clearAllNotifications()">🗑️ Clear All</button>
      </div>
    </div>

    <!-- Filter -->
    <div class="flex gap-10 mb-20" style="flex-wrap:wrap">
      ${['All','Critical','Warning','Info','Success'].map((f,i) => `
        <button class="btn btn-sm ${i===0?'btn-primary':'btn-secondary'}" onclick="filterNotifications('${f}',this)">
          ${f} (${f==='All'?DATA.alerts.length:DATA.alerts.filter(a=>a.type===f.toLowerCase()).length})
        </button>
      `).join('')}
    </div>

    <!-- Notification List -->
    <div class="card" id="notif-list">
      ${DATA.alerts.map(a => `
        <div class="notif-item ${!a.read?'unread':''}" id="notif-${a.id}">
          <div class="notif-avatar" style="background:${a.type==='critical'?'var(--red-light)':a.type==='warning'?'var(--amber-light)':a.type==='success'?'var(--primary-light)':'var(--blue-light)'}">
            ${a.icon}
          </div>
          <div class="notif-content">
            <div class="notif-title">${a.title}</div>
            <div class="notif-msg">${a.msg}</div>
            <div class="notif-time">📍 ${a.location} · 🕐 ${a.time}</div>
          </div>
          ${!a.read ? '<div class="unread-dot"></div>' : ''}
          <div class="flex gap-6" style="flex-shrink:0">
            ${a.type !== 'success' && a.type !== 'info' ? `<button class="btn btn-sm btn-primary" onclick="resolveAlert(${a.id})">Resolve</button>` : ''}
            <button class="btn btn-sm btn-secondary" onclick="dismissNotif(${a.id})">✕</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function markAllRead() {
  DATA.alerts.forEach(a => a.read = true);
  document.querySelectorAll('.notif-item').forEach(n => n.classList.remove('unread'));
  document.querySelectorAll('.unread-dot').forEach(d => d.remove());
  updateNotifBadge(0);
  showToast('success', 'All notifications marked as read.');
}

function clearAllNotifications() {
  DATA.alerts = [];
  document.getElementById('notif-list').innerHTML = `
    <div class="flex-center" style="padding:40px;flex-direction:column;gap:12px">
      <div style="font-size:48px">✅</div>
      <p class="font-bold" style="color:var(--gray-500)">All notifications cleared!</p>
    </div>
  `;
  updateNotifBadge(0);
}

function filterNotifications(type, btn) {
  document.querySelectorAll('[onclick*="filterNotifications"]').forEach(b => b.classList.replace('btn-primary','btn-secondary'));
  btn.classList.replace('btn-secondary','btn-primary');
  document.querySelectorAll('.notif-item').forEach(n => {
    if (type === 'All') { n.style.display = 'flex'; return; }
    const id = parseInt(n.id.replace('notif-',''));
    const alert = DATA.alerts.find(a => a.id === id);
    n.style.display = (alert && alert.type === type.toLowerCase()) ? 'flex' : 'none';
  });
}

function resolveAlert(id) {
  const alert = DATA.alerts.find(a => a.id === id);
  if (alert) { alert.read = true; }
  const el = document.getElementById(`notif-${id}`);
  if (el) {
    el.classList.remove('unread');
    const dot = el.querySelector('.unread-dot');
    if (dot) dot.remove();
    const resBtn = el.querySelector('.btn-primary');
    if (resBtn) resBtn.remove();
  }
  const unreads = DATA.alerts.filter(a => !a.read).length;
  updateNotifBadge(unreads);
  showToast('success', 'Alert resolved.');
}

function dismissNotif(id) {
  const el = document.getElementById(`notif-${id}`);
  if (el) { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }
}

function updateNotifBadge(count) {
  const b1 = document.getElementById('notif-badge');
  const b2 = document.getElementById('topbar-badge');
  if (b1) b1.textContent = count;
  if (b2) b2.textContent = count;
  if (count === 0) {
    if (b1) b1.style.display = 'none';
    if (b2) b2.style.display = 'none';
  }
}

/* ---- 7.15 ADMIN DASHBOARD ---- */
function renderAdminDashboard() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left"><h2>Admin Dashboard</h2><p>System administration and user management</p></div>
      <div class="page-actions">
        <button class="btn btn-outline btn-icon" onclick="showToast('info','Report exported!')">📥 Export Report</button>
        <button class="btn btn-primary btn-icon" onclick="openModal('Add User',addUserForm())">+ Add User</button>
      </div>
    </div>

    <!-- Admin Stats -->
    <div class="grid-4 mb-24">
      ${[
        {icon:'👥',val:'248',lbl:'Total Registered Users',c:'var(--blue)'},
        {icon:'🌾',val:'342',lbl:'Active Fields',c:'var(--primary)'},
        {icon:'💧',val:'1.2M L',lbl:'Total Water Monitored',c:'var(--blue)'},
        {icon:'📈',val:'89.5%',lbl:'Platform Efficiency',c:'var(--amber)'},
      ].map(s=>`
        <div class="card stat-card">
          <div class="stat-icon">${s.icon}</div>
          <div class="stat-value" style="color:${s.c}">${s.val}</div>
          <div class="stat-label">${s.lbl}</div>
        </div>
      `).join('')}
    </div>

    <!-- User Management -->
    <div class="card mb-24">
      <div class="card-header"><h3>User Management</h3>
        <div class="flex gap-8">
          <input type="search" placeholder="Search users..." style="padding:6px 12px;border:1.5px solid var(--gray-200);border-radius:8px;font-size:12px;outline:none" />
          <select style="padding:6px 12px;border:1.5px solid var(--gray-200);border-radius:8px;font-size:12px;outline:none">
            <option>All Roles</option><option>Farmer</option><option>Admin</option><option>Expert</option>
          </select>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>User ID</th><th>Name</th><th>Role</th><th>Email</th><th>Status</th><th>Last Active</th><th>Actions</th></tr></thead>
          <tbody id="admin-user-table">
            ${DATA.adminUsers.map(u=>`
              <tr id="arow-${u.id.replace('#','')}">
                <td class="td-mono">${u.id}</td>
                <td class="td-bold">${u.name}</td>
                <td><span class="badge badge-gray">${u.role}</span></td>
                <td class="text-sm text-muted">${u.email}</td>
                <td><span class="badge ${u.status==='Active'?'badge-green':'badge-gray'}" id="abadge-${u.id.replace('#','')}">${u.status}</span></td>
                <td class="text-xs text-muted">${u.last}</td>
                <td>
                  <div class="flex gap-6">
                    <button class="admin-action-btn btn-outline" onclick="showToast('info','Editing ${u.name}...')">✏️ Edit</button>
                    <button class="admin-action-btn ${u.status==='Active'?'btn-danger':'btn-primary'}"
                      id="abtn-${u.id.replace('#','')}"
                      onclick="toggleAdminUser('${u.id.replace('#','')}')">
                      ${u.status==='Active'?'🚫 Block':'✅ Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Registration Chart -->
    <div class="card chart-card">
      <div class="card-header"><h3>Monthly User Registrations</h3></div>
      <div class="chart-wrap"><canvas id="chart-registrations"></canvas></div>
    </div>
  `;

  setTimeout(() => {
    const ctx = document.getElementById('chart-registrations');
    if (ctx) {
      AppState.charts.registrations = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Jan','Feb','Mar','Apr','May','Jun'],
          datasets: [{
            label: 'Registrations',
            data: [12,19,8,25,22,30],
            backgroundColor: '#16a34a', borderRadius: 6,
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true }, x: { grid: { display: false } } }
        }
      });
    }
  }, 50);
}

function toggleAdminUser(idRaw) {
  const user = DATA.adminUsers.find(u => u.id.replace('#','') === idRaw);
  if (!user) return;
  user.status = user.status === 'Active' ? 'Inactive' : 'Active';
  const badge = document.getElementById(`abadge-${idRaw}`);
  const btn   = document.getElementById(`abtn-${idRaw}`);
  if (badge) { badge.className = `badge ${user.status==='Active'?'badge-green':'badge-gray'}`; badge.textContent = user.status; }
  if (btn)   { btn.className = `admin-action-btn ${user.status==='Active'?'btn-danger':'btn-primary'}`; btn.textContent = user.status==='Active'?'🚫 Block':'✅ Activate'; }
  showToast(user.status==='Active'?'success':'warning', `${user.name} has been ${user.status==='Active'?'activated':'blocked'}.`);
}

function addUserForm() {
  return `
    <div class="app-form">
      <div class="form-group"><label>Full Name</label><input type="text" placeholder="Full name" /></div>
      <div class="form-group"><label>Email</label><input type="email" placeholder="email@example.com" /></div>
      <div class="form-group"><label>CNIC</label><input type="text" placeholder="35102-1234567-8" /></div>
      <div class="form-group"><label>Role</label>
        <select><option>Farmer</option><option>Admin</option><option>Agricultural Expert</option><option>Distributor</option></select>
      </div>
      <div class="form-group"><label>Temporary Password</label><input type="password" placeholder="Min 8 characters" /></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="closeModal();showToast('success','User added successfully!')">Create User</button>
    </div>
  `;
}

/* ---- 7.16 SYSTEM CONFIG ---- */
function renderSystemConfig() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left"><h2>System Configuration</h2><p>Configure application settings and preferences</p></div>
      <button class="btn btn-primary btn-icon" onclick="showToast('success','Settings saved successfully!')">💾 Save All Settings</button>
    </div>

    <div class="grid-2">
      <!-- General Settings -->
      <div class="card">
        <div class="card-header"><h3>General Settings</h3></div>
        <div class="card-body app-form">
          <div class="form-group"><label>Farm Name</label><input value="Ahmad Farms" /></div>
          <div class="form-group"><label>Location</label><input value="Kasur, Punjab, Pakistan" /></div>
          <div class="form-group"><label>Language</label><select><option>English</option><option>Urdu</option></select></div>
          <div class="form-group"><label>Timezone</label><select><option>PKT (UTC+5)</option><option>UTC</option></select></div>
          <div class="form-group"><label>Temperature Unit</label><select><option>Celsius (°C)</option><option>Fahrenheit (°F)</option></select></div>
          <div class="form-group"><label>Volume Unit</label><select><option>Liters (L)</option><option>Gallons (gal)</option></select></div>
        </div>
      </div>

      <!-- Notification Settings -->
      <div class="card">
        <div class="card-header"><h3>Notification Preferences</h3></div>
        <div class="card-body">
          ${[
            ['Critical Alerts', 'Push + SMS + Email'],
            ['Low Moisture Warnings', 'Push + Email'],
            ['Irrigation Completed', 'Push'],
            ['Weather Updates', 'Email'],
            ['Weekly Reports', 'Email'],
            ['Device Offline Alerts', 'Push + SMS'],
          ].map(([label, method]) => `
            <div class="flex-between" style="padding:12px 0;border-bottom:1px solid var(--gray-100)">
              <div>
                <p class="text-sm font-bold">${label}</p>
                <p class="text-xs text-muted">${method}</p>
              </div>
              <button class="toggle-switch on" onclick="toggleSwitch(this)"><span class="toggle-knob"></span></button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- API Keys -->
      <div class="card">
        <div class="card-header"><h3>API Keys and Integrations</h3></div>
        <div class="card-body app-form">
          <div class="form-group">
            <label>Weather API Key (OpenWeatherMap)</label>
            <input type="password" value="sk-weather-api-key-1234567890" />
            <p class="form-help">Used for weather forecasts. Backend: GET /api/weather uses this key.</p>
          </div>
          <div class="form-group">
            <label>SMS Gateway API Key</label>
            <input type="password" value="sms-gateway-key-987654321" />
          </div>
          <div class="form-group">
            <label>Backend API Base URL</label>
            <input value="https://api.smartirrig.pk/v1" />
            <p class="form-help">Base URL for backend REST API integration</p>
          </div>
        </div>
      </div>

      <!-- Security -->
      <div class="card">
        <div class="card-header"><h3>Security Settings</h3></div>
        <div class="card-body app-form">
          <div class="form-group"><label>Session Timeout (minutes)</label><input type="number" value="60" /></div>
          <div class="form-group">
            <label>Two-Factor Authentication</label>
            <div class="flex gap-12 mt-8">
              <button class="toggle-switch off" onclick="toggleSwitch(this)"><span class="toggle-knob"></span></button>
              <span class="text-sm text-muted">Enable 2FA for all admin accounts</span>
            </div>
          </div>
          <div class="form-group"><label>Password Policy</label>
            <select><option>Strong (8+ chars, special)</option><option>Medium (6+ chars)</option></select>
          </div>
          <button class="btn btn-danger btn-sm mt-8" onclick="showToast('warning','All sessions terminated!')">🚪 Terminate All Sessions</button>
        </div>
      </div>
    </div>
  `;
}

/* ---- 7.17 BACKUP & RESTORE ---- */
function renderBackupRestore() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left"><h2>Backup and Restore</h2><p>Manage system backups and data restoration</p></div>
      <button class="btn btn-primary btn-icon" onclick="createBackup()">+ Create Backup</button>
    </div>

    <div class="grid-2 mb-24">
      <!-- Create Backup -->
      <div class="card">
        <div class="card-header"><h3>Create New Backup</h3></div>
        <div class="card-body app-form">
          <div class="form-group"><label>Backup Name</label><input id="bk-name" value="System Backup – ${new Date().toLocaleDateString()}" /></div>
          <div class="form-group"><label>Include</label>
            <div style="display:flex;flex-direction:column;gap:10px;margin-top:8px">
              ${[['bk-db','Database (Fields, Sensors, Logs)',true],['bk-cfg','System Configuration',true],['bk-sched','Irrigation Schedules',true],['bk-users','User Accounts',false]].map(([id,l,c])=>`
                <label class="checkbox-label"><input type="checkbox" ${c?'checked':''} /> ${l}</label>
              `).join('')}
            </div>
          </div>
          <button class="btn btn-primary btn-block mt-8" onclick="createBackup()">🔄 Start Backup</button>
        </div>
      </div>

      <!-- Auto Backup Settings -->
      <div class="card">
        <div class="card-header"><h3>Auto Backup Settings</h3></div>
        <div class="card-body app-form">
          <div class="form-group">
            <label>Auto Backup</label>
            <div class="flex gap-12 mt-8">
              <button class="toggle-switch on" onclick="toggleSwitch(this)"><span class="toggle-knob"></span></button>
              <span class="text-sm text-muted">Enable automatic backups</span>
            </div>
          </div>
          <div class="form-group"><label>Frequency</label>
            <select><option>Daily</option><option>Weekly</option><option>Monthly</option></select>
          </div>
          <div class="form-group"><label>Backup Time</label><input type="time" value="03:00" /></div>
          <div class="form-group"><label>Retention Period</label>
            <select><option>7 days</option><option>30 days</option><option>90 days</option><option>1 year</option></select>
          </div>
          <div class="form-group"><label>Storage Location</label>
            <select><option>Local Storage</option><option>Google Drive</option><option>AWS S3</option><option>Azure Blob</option></select>
          </div>
        </div>
      </div>
    </div>

    <!-- Backup History -->
    <div class="card">
      <div class="card-header"><h3>Backup History</h3></div>
      <div class="card-body" id="backup-list">
        ${DATA.backups.map(b => `
          <div class="backup-item" id="bk-${b.id}">
            <div class="bi-info">
              <div class="bi-icon">💾</div>
              <div class="bi-details">
                <p>${b.name}</p>
                <span>${b.size} · ${b.type} Backup · ${b.created}</span>
              </div>
            </div>
            <div class="flex gap-8">
              <span class="badge badge-green">${b.status}</span>
              <button class="btn btn-sm btn-outline" onclick="showToast('success','Downloading backup...')">⬇️ Download</button>
              <button class="btn btn-sm btn-secondary" onclick="showToast('info','Restoring from backup...')">🔄 Restore</button>
              <button class="btn btn-sm btn-danger" onclick="document.getElementById('bk-${b.id}').remove();showToast('warning','Backup deleted')">🗑️</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function createBackup() {
  showToast('info', '🔄 Creating backup...');
  setTimeout(() => {
    showToast('success', '✅ Backup created successfully!');
  }, 2000);
}

/* ============================================================
   8. LIVE SENSOR UPDATES
   In production: Replace setInterval with WebSocket connection
   ws://your-server/ws/sensors
============================================================ */

/** Start live sensor data simulation */
function startLiveUpdates() {
  AppState.liveUpdateInterval = setInterval(() => {
    updateSensorValues();
  }, 2500);
}

/** Stop live updates (e.g., on logout) */
function stopLiveUpdates() {
  if (AppState.liveUpdateInterval) {
    clearInterval(AppState.liveUpdateInterval);
    AppState.liveUpdateInterval = null;
  }
}

/** Update sensor values with small random fluctuations */
function updateSensorValues() {
  DATA.sensors.forEach(s => {
    const delta = (Math.random() - 0.5) * (s.id === 'ph' ? 0.2 : 5);
    s.value = parseFloat(Math.max(s.min, Math.min(s.max, s.value + delta)).toFixed(s.id === 'ph' ? 1 : 0));
  });

  // Update dashboard stats
  const sm = DATA.sensors.find(s => s.id === 'sm');
  const st = DATA.sensors.find(s => s.id === 'st');
  const ah = DATA.sensors.find(s => s.id === 'ah');
  if (sm) DATA.dashboardStats.soilMoisture = sm.value;
  if (st) DATA.dashboardStats.temperature = st.value;
  if (ah) DATA.dashboardStats.humidity = ah.value;
  DATA.dashboardStats.waterUsed += Math.round(Math.random() * 3);

  // Update DOM if on dashboard or sensors page
  const page = AppState.currentPage;

  if (page === 'dashboard') {
    updateEl('dash-moisture', `${DATA.dashboardStats.soilMoisture}%`);
    updateEl('dash-temp',     `${DATA.dashboardStats.temperature.toFixed(1)}°C`);
    updateEl('dash-hum',      `${DATA.dashboardStats.humidity}%`);
    updateEl('dash-water',    `${DATA.dashboardStats.waterUsed}L`);
  }

  if (page === 'sensor-data') {
    DATA.sensors.forEach(s => {
      const el = document.getElementById(`sv-${s.id}`);
      if (el) {
        el.textContent = (s.id === 'ph' ? s.value.toFixed(1) : s.value) + s.unit;
        el.classList.add('updating');
        setTimeout(() => el.classList.remove('updating'), 300);
      }
    });
  }
}

/** Helper: update element text content */
function updateEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ============================================================
   9. UI HELPERS
============================================================ */

/** Toggle password visibility */
function togglePassword(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.textContent = inp.type === 'password' ? '👁️' : '🙈';
}

/** Toggle switch button */
function toggleSwitch(btn) {
  if (btn.classList.contains('on')) {
    btn.classList.replace('on','off');
  } else {
    btn.classList.replace('off','on');
  }
}

/** Toggle sidebar open/closed */
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const wrapper = document.getElementById('main-wrapper');
  sidebar.classList.toggle('collapsed');
  wrapper.classList.toggle('expanded');
  AppState.sidebarOpen = !sidebar.classList.contains('collapsed');
}

/** Toggle user dropdown menu */
function toggleUserMenu() {
  document.getElementById('user-dropdown').classList.toggle('show');
}

/** Close dropdown when clicking outside */
document.addEventListener('click', (e) => {
  const userMenu = document.getElementById('topbar-user-menu');
  const dropdown = document.getElementById('user-dropdown');
  if (userMenu && dropdown && !userMenu.contains(e.target)) {
    dropdown.classList.remove('show');
  }
});

/* ============================================================
   10. MODAL SYSTEM
============================================================ */

/**
 * Open a modal
 * @param {string} title  - Modal header title
 * @param {string} bodyHTML - HTML content for modal body
 */
function openModal(title, bodyHTML) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHTML;
  document.getElementById('modal-overlay').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

/** Close modal */
function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
  document.body.style.overflow = '';
}

/** Close modal when clicking overlay background */
function closeModalOutside(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}

/* ============================================================
   11. TOAST NOTIFICATIONS
============================================================ */

/**
 * Show a toast notification
 * @param {'success'|'error'|'warning'|'info'} type
 * @param {string} message
 */
function showToast(type, message) {
  const container = document.getElementById('toast-container');
  const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
  toast.onclick = () => toast.remove();

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all .3s';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ============================================================
   12. CHART MANAGEMENT
============================================================ */

/** Destroy a specific chart instance */
function destroyChart(key) {
  if (AppState.charts[key]) {
    AppState.charts[key].destroy();
    delete AppState.charts[key];
  }
}

/** Destroy all chart instances (call before page navigation) */
function destroyAllCharts() {
  Object.keys(AppState.charts).forEach(key => {
    try { AppState.charts[key].destroy(); } catch(e) {}
  });
  AppState.charts = {};
}

/* ============================================================
   13. UTILITY FUNCTIONS
============================================================ */

/**
 * Get CSS badge class based on status string
 * @param {string} status
 * @returns {string} CSS class
 */
function getStatusBadge(status) {
  const map = {
    'Completed':'badge-green', 'Active':'badge-green', 'Online':'badge-green', 'Healthy':'badge-green',
    'Warning':'badge-yellow',  'Scheduled':'badge-yellow', 'Idle':'badge-yellow',
    'Updated':'badge-purple',
    'Running':'badge-blue',
    'Stopped':'badge-red',     'Critical':'badge-red',    'Inactive':'badge-red',
  };
  return map[status] || 'badge-gray';
}

/* ============================================================
   14. KEYBOARD SHORTCUTS
============================================================ */
document.addEventListener('keydown', (e) => {
  if (!AppState.isLoggedIn) return;
  if (e.key === 'Escape') closeModal();
  if (e.altKey) {
    const shortcuts = { 'd':'dashboard', 'f':'manage-fields', 's':'sensor-data', 'r':'reports', 'n':'notifications' };
    if (shortcuts[e.key]) navigateTo(shortcuts[e.key], null);
  }
});

/* ============================================================
   END OF app.js
   
   BACKEND INTEGRATION CHECKLIST:
   ✅ Auth:     POST /api/auth/login, POST /api/auth/register, POST /api/auth/logout
   ✅ Fields:   GET/POST/PUT/DELETE /api/fields
   ✅ Zones:    GET/POST/PUT /api/zones
   ✅ Sensors:  WebSocket ws://server/ws/sensors (replace setInterval in startLiveUpdates)
   ✅ Weather:  GET /api/weather/forecast
   ✅ Alerts:   GET /api/alerts, PATCH /api/alerts/:id/resolve
   ✅ Reports:  GET /api/reports/monthly, GET /api/reports/zones
   ✅ Admin:    GET/POST/PATCH /api/admin/users
   ✅ Devices:  GET /api/devices
   ✅ MQTT:     mqtt://broker/irrigation/{zoneId}/control
============================================================ */
