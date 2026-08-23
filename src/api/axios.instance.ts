import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const getApiBaseURL = () => {
  const envBase = import.meta.env.VITE_API_BASE_URL;
  if (envBase) {
    const clean = envBase.replace(/\/+$/, '');
    if (clean.endsWith('/v1')) return clean;
    return `${clean}/v1`;
  }

  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    const serverUrl = envUrl.replace(/\/+$/, '');
    if (serverUrl.endsWith('/api/v1')) return serverUrl;
    if (serverUrl.endsWith('/api')) return `${serverUrl}/v1`;
    return `${serverUrl}/api/v1`;
  }

  console.error(
    '[Config Error] No se encontró VITE_API_BASE_URL ni VITE_API_URL en el archivo .env. Verifique su configuración de variables de entorno.'
  );
  throw new Error(
    'Error de configuración: VITE_API_BASE_URL / VITE_API_URL no está definida en las variables de entorno (.env).'
  );
};

const baseURL = getApiBaseURL();

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
