# Módulo de Autenticación y Control de Acceso Frontend
**Documento:** FRONTEND_01_AUTH.md  
**Versión:** 1.0.0  
**Proyecto:** Client Frontend Activos Fijos COMIBOL  
**Módulo:** Autenticación JWT y Guardias de Seguridad (RBAC)  
**Fecha:** Agosto 2026  

---

# 1. Objetivo

Especificar la implementación del módulo de **Autenticación y Control de Acceso** en el cliente frontend React. El sistema debe gestionar el inicio de sesión de usuarios contra la API REST del backend (`/api/v1/auth/login`), almacenar de forma segura el token JWT en el estado global y en `localStorage`, inyectar la cabecera `Authorization: Bearer <token>` en cada petición HTTP, y proteger las rutas mediante guardias reactivos (`ProtectedRoute`).

---

# 2. Endpoints Backend Compatibles

| Método | Endpoint | Descripción | Requiere Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Inicia sesión con correo y contraseña | No |
| `GET` | `/api/v1/auth/me` | Obtiene el perfil del usuario autenticado | Sí |

---

# 3. Interfaces de Datos (`src/interfaces/auth.interface.ts`)

```typescript
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  lastLogin?: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
  user: UserProfile;
}
```

---

# 4. Servicio de Autenticación (`src/services/auth.service.ts`)

```typescript
import api from '../api/axios.instance';
import { LoginCredentials, LoginResponseData, UserProfile } from '../interfaces/auth.interface';

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponseData> {
    const response = await api.post<{ success: boolean; data: LoginResponseData }>(
      '/auth/login',
      credentials,
    );
    return response.data.data;
  },

  async getCurrentUser(): Promise<UserProfile> {
    const response = await api.get<{ success: boolean; data: { user: UserProfile } }>(
      '/auth/me',
    );
    return response.data.data.user;
  },
};
```

---

# 5. Estado Global Zustand (`src/store/authStore.ts`)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, LoginCredentials } from '../interfaces/auth.interface';
import { authService } from '../services/auth.service';

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { token, user } = await authService.login(credentials);
          set({ token, user, isAuthenticated: true, isLoading: false });
        } catch (err: any) {
          const message = err.response?.data?.message || 'Error al iniciar sesión';
          set({ error: message, isLoading: false, isAuthenticated: false });
          throw new Error(message);
        }
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false, error: null });
        localStorage.removeItem('auth-storage');
      },

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const user = await authService.getCurrentUser();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          set({ token: null, user: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);
```

---

# 6. Interceptor HTTP (`src/api/axios.instance.ts`)

```typescript
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
```

---

# 7. Componentes e Interfaz de Usuario

### 7.1 Página de Inicio de Sesión (`src/pages/LoginPage.tsx`)
- Formulario limpio con campos para **Correo Institucional** (`admin@comibol.gob.bo`) y **Contraseña**.
- Logotipo oficial de COMIBOL y diseño en paleta oscura/institucional.
- Feedback visual instantáneo para errores de autenticación o credenciales inválidas.

### 7.2 Guardia de Seguridad (`src/routes/ProtectedRoute.tsx`)
- Componente envoltorio que verifica `isAuthenticated`. Redirige a `/login` si no se encuentra sesión activa.

---

# 8. Criterios de Aceptación

- [ ] Formulario de login 100% funcional conectado a `POST /api/v1/auth/login`.
- [ ] Persistencia de sesión con Zustand y `localStorage`.
- [ ] Inyección automática del header `Authorization: Bearer <TOKEN>` en todas las peticiones HTTP.
- [ ] Redirección automática a `/login` ante respuestas `401 Unauthorized`.
- [ ] Cero datos sensibles hardcodeados en el código.
