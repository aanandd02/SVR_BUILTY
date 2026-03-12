const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');

export const apiFetch = (path, options = {}) => {
  const url = `${API_BASE}${path}`;
  return fetch(url, { credentials: 'include', ...options });
};

export { API_BASE };
