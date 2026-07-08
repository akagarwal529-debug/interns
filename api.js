/* =====================================================
   api.js – InternSaathi Frontend API Helper
   All API calls go through this file.
   Base URL: http://localhost:5000/api
   ===================================================== */

const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000/api'
  : 'https://admin.internsaathi.com/api';

// ── Auth helpers ──────────────────────────────────────
const getToken  = ()        => localStorage.getItem('is_token');
const getUser   = ()        => { try { return JSON.parse(localStorage.getItem('is_user')); } catch { return null; } };
const setAuth   = (token, user) => { localStorage.setItem('is_token', token); localStorage.setItem('is_user', JSON.stringify(user)); };
const clearAuth = ()        => { localStorage.removeItem('is_token'); localStorage.removeItem('is_user'); };
const isLoggedIn= ()        => !!getToken();

// ── Core fetch wrapper ────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = { ...(token && { Authorization: `Bearer ${token}` }), ...(options.headers || {}) };
  
  // Only set application/json if body is not FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await response.json();
  if (!response.ok) {
    if (data.errors && data.errors.length > 0) {
      throw new Error(data.errors.map(e => e.msg).join('\n'));
    }
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
}

// ── Auth API ──────────────────────────────────────────
const AuthAPI = {
  register: (body) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login:    (body) => apiFetch('/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  me:       ()     => apiFetch('/auth/me'),
  logout:   ()     => apiFetch('/auth/logout',   { method: 'POST' }),
};

// ── Internships API ───────────────────────────────────
const InternshipAPI = {
  getAll:    (params = {}) => apiFetch('/internships?' + new URLSearchParams(params)),
  getFeatured: ()          => apiFetch('/internships/featured'),
  getById:   (id)          => apiFetch(`/internships/${id}`),
  myPostings:()            => apiFetch('/internships/mine'),
  create:    (body)        => apiFetch('/internships', { method: 'POST', body: JSON.stringify(body) }),
  update:    (id, body)    => apiFetch(`/internships/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete:    (id)          => apiFetch(`/internships/${id}`, { method: 'DELETE' }),
};

// ── Applications API ──────────────────────────────────
const ApplicationAPI = {
  apply:       (body)          => apiFetch('/applications', { method: 'POST', body: JSON.stringify(body) }),
  myApps:      ()              => apiFetch('/applications/mine'),
  forListing:  (internshipId)  => apiFetch(`/applications/internship/${internshipId}`),
  updateStatus:(id, body)      => apiFetch(`/applications/${id}/status`, { method: 'PUT', body: JSON.stringify(body) }),
  withdraw:    (id)            => apiFetch(`/applications/${id}`, { method: 'DELETE' }),
};

// ── Users API ─────────────────────────────────────────
const UserAPI = {
  profile:    ()          => apiFetch('/users/profile'),
  update:     (body)      => apiFetch('/users/profile', { method: 'PUT', body: JSON.stringify(body) }),
  save:       (id)        => apiFetch(`/users/save/${id}`, { method: 'POST' }),
  saved:      ()          => apiFetch('/users/saved'),
  stats:      ()          => apiFetch('/users/stats'),
};

// ── Upload API ────────────────────────────────────────
const UploadAPI = {
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch('/upload', { method: 'POST', body: formData });
  }
};

// ── Navbar updater (call on every page) ──────────────
function updateNavbar() {
  const user = getUser();
  const signinEl   = document.getElementById('signin-btn');
  const registerEl = document.getElementById('register-btn');
  const userMenuEl = document.getElementById('user-menu');

  if (user && isLoggedIn()) {
    if (signinEl)   signinEl.style.display   = 'none';
    if (registerEl) registerEl.style.display = 'none';
    if (userMenuEl) {
      userMenuEl.style.display = 'flex';
      const nameEl = document.getElementById('nav-user-name');
      if (nameEl) nameEl.textContent = user.firstName + ' ' + (user.lastName?.[0] || '') + '.';
    }
  }
}

// ── Toast helper (global) ─────────────────────────────
function showToast(msg, icon = '✅') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  document.getElementById('toast-msg').textContent = msg;
  document.getElementById('toast-icon').textContent = icon;
  toast.style.transform = 'translateY(0)';
  toast.style.opacity   = '1';
  setTimeout(() => { toast.style.transform = 'translateY(80px)'; toast.style.opacity = '0'; }, 3500);
}
