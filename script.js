/* ===================================================
   InternSaathi – script.js (Connected to API)
   Handles: fetching data, UI animations, modal, search
   =================================================== */

let currentInternshipId = null;
let currentInternshipTitle = '';

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof updateNavbar === 'function') updateNavbar();
  await loadFeaturedInternships();
});

// ---------- FETCH & RENDER INTERNSHIPS ----------
async function loadFeaturedInternships() {
  const container = document.getElementById('internships-container');
  if (!container) return; // Only on homepage
  
  try {
    const data = await InternshipAPI.getFeatured();
    const internships = data.internships || [];
    
    if (internships.length === 0) {
      container.innerHTML = `<div style="text-align:center;grid-column:1/-1;padding:40px;color:var(--text-light)">No internships found right now.</div>`;
      return;
    }

    container.innerHTML = internships.map(job => `
      <div class="internship-card fade-in">
        <div class="ic-header">
          <div class="ic-logo" style="background:${job.companyColor || '#0B1D3A'}">${job.company?.charAt(0) || 'I'}</div>
          <div>
            <h3 class="ic-role">${job.title}</h3>
            <p class="ic-company">${job.company}</p>
          </div>
        </div>
        <div class="ic-meta">
          <div class="ic-meta-item"><span class="ic-icon">📍</span> ${job.location}</div>
          <div class="ic-meta-item"><span class="ic-icon">💰</span> ₹${(job.stipend || 0).toLocaleString()}/month</div>
          <div class="ic-meta-item"><span class="ic-icon">⏳</span> ${job.duration}</div>
        </div>
        <div class="ic-tags">
          <span class="ic-tag">${job.type}</span>
          ${(job.skills || []).slice(0, 2).map(s => `<span class="ic-tag">${s}</span>`).join('')}
        </div>
        <div class="ic-footer">
          <span class="ic-applicants">${job.applicantCount || 0} applicants</span>
          <button class="btn-apply" onclick="applyNow('${job._id}', '${job.title}')">Apply Now →</button>
        </div>
      </div>
    `).join('');
    
    // Re-run intersection observer for new cards
    document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));
    
  } catch (err) {
    console.error('Error loading internships:', err);
    container.innerHTML = `<div style="text-align:center;grid-column:1/-1;padding:40px;color:red">Failed to load internships. Please ensure backend is running.</div>`;
  }
}

// ---------- MODAL (REAL API) ----------
function applyNow(id, title) {
  if (!isLoggedIn()) {
    showToast('Please sign in to apply!', '🔒');
    setTimeout(() => { window.location.href = 'signin.html'; }, 1500);
    return;
  }
  
  const user = getUser();
  if (user && user.role !== 'student') {
    showToast('Only students can apply for internships!', '⚠️');
    return;
  }

  currentInternshipId = id;
  currentInternshipTitle = title;
  
  const overlay = document.getElementById('modal-overlay');
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-sub').textContent = `Applying as ${user.firstName} ${user.lastName}`;
  
  // Pre-fill
  document.getElementById('modal-name').value = user.firstName + ' ' + (user.lastName || '');
  document.getElementById('modal-name').disabled = true;
  document.getElementById('modal-email').value = user.email;
  document.getElementById('modal-email').disabled = true;
  
  overlay.style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
  currentInternshipId = null;
}

async function submitApplication() {
  if (!currentInternshipId) return;
  
  try {
    // Note: If you want to add a cover letter field to the modal, read it here.
    await ApplicationAPI.apply({
      internshipId: currentInternshipId,
      coverLetter: "I am very interested in this role." // Default for now
    });
    
    closeModal();
    showToast(`Successfully applied for ${currentInternshipTitle}! 🎉`, '✅');
    
    // Refresh feed to update applicant count
    loadFeaturedInternships();
  } catch (err) {
    showToast(err.message, '⚠️');
  }
}

document.getElementById('modal-overlay')?.addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

// ---------- SEARCH FUNCTIONALITY ----------
document.getElementById('find-btn')?.addEventListener('click', async () => {
  const keyword = document.getElementById('search-keyword').value.trim();
  const city    = document.getElementById('search-city').value;
  const pay     = document.getElementById('search-pay').value;
  const state   = document.getElementById('search-state').value;
  const activeTypeBtn = document.querySelector('.type-btn.active');
  const activeType = activeTypeBtn?.dataset.type || 'all';

  showToast('Searching internships...', '🔍');

  const params = {};
  if (keyword)                params.keyword = keyword;
  if (city)                   params.city    = city;
  if (state)                  params.state   = state;
  if (activeType !== 'all')   params.type    = activeType;  // 'remote' | 'hybrid' | 'onsite'

  // Stipend range parsing
  if (pay === '₹5,000 – ₹10,000')   { params.minPay = 5000;  params.maxPay = 10000; }
  else if (pay === '₹10,000 – ₹20,000') { params.minPay = 10000; params.maxPay = 20000; }
  else if (pay === '₹20,000 – ₹30,000') { params.minPay = 20000; params.maxPay = 30000; }
  else if (pay === '₹30,000+')        { params.minPay = 30000; }

  try {
    const data = await InternshipAPI.getAll(params);
    const container = document.getElementById('internships-container');
    const internships = data.internships || [];

    if (internships.length === 0) {
      container.innerHTML = `<div style="text-align:center;grid-column:1/-1;padding:40px;color:var(--text-light)">No results found for your search.</div>`;
    } else {
      container.innerHTML = internships.map(job => `
        <div class="internship-card fade-in">
          <div class="ic-header">
            <div class="ic-logo" style="background:${job.companyColor || '#0B1D3A'}">${job.company?.charAt(0) || 'I'}</div>
            <div>
              <h3 class="ic-role">${job.title}</h3>
              <p class="ic-company">${job.company}</p>
            </div>
          </div>
          <div class="ic-meta">
            <div class="ic-meta-item"><span class="ic-icon">📍</span> ${job.location}</div>
            <div class="ic-meta-item"><span class="ic-icon">💰</span> ₹${(job.stipend || 0).toLocaleString()}/month</div>
            <div class="ic-meta-item"><span class="ic-icon">⏳</span> ${job.duration}</div>
          </div>
          <div class="ic-tags">
            <span class="ic-tag">${job.type}</span>
            ${(job.skills || []).slice(0, 2).map(s => `<span class="ic-tag">${s}</span>`).join('')}
          </div>
          <div class="ic-footer">
            <span class="ic-applicants">${job.applicantCount || 0} applicants</span>
            <button class="btn-apply" onclick="applyNow('${job._id}', '${job.title}')">Apply Now →</button>
          </div>
        </div>
      `).join('');
      document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));
    }

    document.getElementById('latest').scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    showToast('Search failed. Please ensure the backend is running.', '⚠️');
  }
});

function setType(btn) {
  document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}


// ---------- ANIMATIONS & OBSERVERS ----------
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

function animateCounter(el, target, duration = 1800) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      start = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(start).toLocaleString('en-IN') + '+';
  }, 16);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = parseInt(entry.target.dataset.target, 10);
      animateCounter(entry.target, target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number[data-target]').forEach(el => counterObserver.observe(el));

// ---------- NAVBAR SCROLL EFFECT ----------
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 80) navbar?.style.setProperty('box-shadow', '0 4px 20px rgba(0,0,0,0.10)');
  else navbar?.style.setProperty('box-shadow', '0 1px 3px rgba(0,0,0,0.08)');
}, { passive: true });

// ---------- MISC UI HANDLERS ----------
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger?.addEventListener('click', () => {
  if (navMenu.style.display === 'flex') {
    navMenu.style.display = '';
  } else {
    navMenu.style.cssText = `display:flex;flex-direction:column;position:absolute;top:64px;left:0;right:0;background:white;padding:16px 24px 24px;border-top:1px solid #E5E7EB;box-shadow:0 8px 24px rgba(0,0,0,0.1);z-index:999;gap:4px;`;
  }
});

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

(function animateHeroCount() {
  const el = document.getElementById('hero-count');
  if (!el) return;
  let base = 15281;
  setInterval(() => {
    base += Math.floor(Math.random() * 3);
    el.textContent = base.toLocaleString('en-IN');
  }, 3000);
})();

