import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const baseURL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const isLoginRequest = config.url?.includes('/auth/login');
  const token = useAuthStore.getState().token;

  if (token && config.headers && !isLoginRequest) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest) {
        useAuthStore.getState().logout();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    // Transformar "Network Error" en un mensaje claro y descriptivo del servidor
    if (
      error.message === 'Network Error' ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ERR_CONNECTION_REFUSED'
    ) {
      error.customMessage = 'Servidor no disponible. Verifique que el backend (puerto 3000) esté en ejecución.';
    }

    return Promise.reject(error);
  },
);

export default api;
