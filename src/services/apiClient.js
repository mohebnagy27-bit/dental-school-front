import axios from 'axios';
import { API_BASE_URL } from '../config/api.js';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

function notifyRequestError(message) {
  window.dispatchEvent(new CustomEvent('app:request-error', { detail: { message } }));
}

function clearExpiredAuthentication() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  sessionStorage.removeItem('df_student_id');
  window.dispatchEvent(new Event('auth:logout'));
}

function isInvalidTokenError(error) {
  const status = error.response?.status;
  const message = String(error.response?.data?.message || '').toLowerCase();
  const hasAuthenticationHeader = Boolean(error.config?.headers?.Authorization);

  return hasAuthenticationHeader && (
    status === 401
    || (status === 403 && /token|jwt|expired|invalid/.test(message))
  );
}

function getRequestErrorMessage(error) {
  if (!error.response) {
    return navigator.onLine === false
      ? 'No internet connection. Please check your network and try again.'
      : 'Unable to connect to the server. Please try again later.';
  }

  if ([502, 503, 504].includes(error.response.status)) {
    return 'Unable to connect to the server. Please try again later.';
  }

  return null;
}

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isInvalidTokenError(error)) {
      clearExpiredAuthentication();
    } else {
      const message = getRequestErrorMessage(error);
      if (message) {
        error.userMessage = message;
        notifyRequestError(message);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
