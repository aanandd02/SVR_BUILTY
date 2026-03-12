const ENV_BASE = (import.meta.env.VITE_API_BASE || '').trim().replace(/\/$/, '');

const computeBase = () => {
  if (typeof window === 'undefined') return ENV_BASE;
  const host = window.location.hostname;
  // On the Render-hosted frontend domain, avoid third‑party cookies by hitting the same origin
  if (host === 'svr-builty-frontend.onrender.com') return '';
  return ENV_BASE;
};

const API_BASE = computeBase();

export const apiFetch = (path, options = {}) => {
  const url = `${API_BASE}${path}`;
  return fetch(url, { credentials: 'include', ...options });
};

export { API_BASE };
