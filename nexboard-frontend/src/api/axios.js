import axios from 'axios';

/**
 * Axios instance.
 *
 * In development: requests go to relative URLs (e.g. /auth/login).
 * Vite dev server proxies them to http://localhost:8080 — no CORS issue.
 *
 * In production: set VITE_API_BASE_URL env var to point at the real API host.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  // Do NOT set a default Content-Type here.
  // Axios sets it automatically:
  //   - JSON body  → application/json
  //   - FormData   → multipart/form-data (with correct boundary)
});

// Attach JWT + set Content-Type per request type
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('auth');
  if (raw) {
    try {
      const { token } = JSON.parse(raw);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (_) {}
  }

  // Only set JSON content-type when the body is NOT FormData
  // For FormData, Axios will auto-set multipart/form-data with the correct boundary
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

// On 401 — clear session and go to login (no toast, user wasn't expecting it)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth');
      localStorage.removeItem('selectedEmployeeId');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
