// Dynamic injection of logged‑in user info into UI elements
function getPayload() {
  const raw = localStorage.getItem('authToken');
  if (!raw) return null;
  const parts = raw.split('.');
  if (parts.length !== 3) return null;
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(b64);
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

function populateUserInfo() {
  const payload = getPayload();
  if (!payload) return;
  const name = payload.name || payload.fullName || payload.email?.split('@')[0] || '';
  const role = payload.role || 'Guest';
  const department = payload.department || '';
  const roleMap = {
    guest: {icon:'ti ti-user', label:'Guest'},
    graduate: {icon:'ti ti-graduation-cap', label:'Graduate'},
    admin: {icon:'ti ti-shield-lock', label:'Administrator'}
  };

  // Name display
  const nameEl = document.getElementById('current-user-name');
  if (nameEl) nameEl.textContent = name;

  // Headline (role • department) with icon
  const headlineEl = document.getElementById('current-user-role-text');
  const iconEl = document.getElementById('current-user-role-icon');
  if (headlineEl) {
    const parts = [roleMap[role.toLowerCase()]?.label || role];
    if (department) parts.push(department);
    headlineEl.textContent = parts.join(' • ');
  }
  if (iconEl && roleMap[role.toLowerCase()]) {
    iconEl.className = roleMap[role.toLowerCase()].icon;
  }

  // Avatar initials
  const avatarEl = document.getElementById('current-user-avatar');
  if (avatarEl) {
    const initials = name.split(' ').map(p=>p[0].toUpperCase()).join('').slice(0,2);
    avatarEl.textContent = initials;
  }

  // Role‑specific feature icons
  const featuresContainer = document.getElementById('role-features');
  if (featuresContainer) {
    const featureMap = {
      guest: [
        {icon:'ti ti-login', label:'Login'},
        {icon:'ti ti-user-plus', label:'Register'}
      ],
      graduate: [
        {icon:'ti ti-briefcase', label:'Job Postings'},
        {icon:'ti ti-message', label:'Messages'},
        {icon:'ti ti-user', label:'Profile'}
      ],
      admin: [
        {icon:'ti ti-settings', label:'Admin Panel'},
        {icon:'ti ti-users', label:'User Management'},
        {icon:'ti ti-analytics', label:'Analytics'}
      ]
    };
    const feats = featureMap[role.toLowerCase()] || [];
    featuresContainer.innerHTML = feats.map(f=>`<div class="feature-item"><i class="${f.icon}"></i> ${f.label}</div>`).join('');
  }
}

  const payload = getPayload();
  if (!payload) return;
  const name = payload.name || payload.fullName || payload.email?.split('@')[0] || '';
  const role = payload.role || 'Guest';
  const department = payload.department || '';

  // Name display
  const nameEl = document.getElementById('current-user-name');
  if (nameEl) nameEl.textContent = name;

  // Headline (role • department)
  const headlineEl = document.querySelector('.profile-headline');
  if (headlineEl) {
    const parts = [role];
    if (department) parts.push(department);
    headlineEl.textContent = parts.join(' • ');
  }

  // Avatar initials (e.g., "BA")
  const avatarEl = document.getElementById('current-user-avatar');
  if (avatarEl) {
    const initials = name
      .split(' ')
      .map(p => p[0].toUpperCase())
      .join('')
      .slice(0, 2);
    avatarEl.textContent = initials;
  }
}

document.addEventListener('DOMContentLoaded', populateUserInfo);
