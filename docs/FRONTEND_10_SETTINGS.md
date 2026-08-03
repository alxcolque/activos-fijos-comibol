# Módulo de Configuración y Preferencias Frontend
**Documento:** FRONTEND_10_SETTINGS.md  
**Versión:** 1.0.0  
**Proyecto:** Client Frontend Activos Fijos COMIBOL  
**Módulo:** Parámetros Institucionales y Configuración del Sistema  
**Fecha:** Agosto 2026  

---

# 1. Objetivo

Especificar la implementación del módulo de **Configuración Global** en el cliente frontend. Permite a los administradores del sistema gestionar la información institucional de la Corporación Minera de Bolivia (Razón Social, NIT, Dirección de Casa Matriz, Teléfonos, Correo Electrónico, Moneda de contabilización y Prefijo Patrimonial `AF-`).

---

# 2. Endpoints Backend Compatibles

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/v1/settings` | Obtener todas las configuraciones globales e institucionales |
| `PUT` | `/api/v1/settings` | Actualizar las configuraciones institucionales en lote |
| `GET` | `/api/v1/settings/:key` | Consultar un parámetro específico por su clave |
| `PUT` | `/api/v1/settings/:key` | Actualizar un parámetro específico por su clave |

---

# 3. Interfaces de Datos (`src/interfaces/setting.interface.ts`)

```typescript
export interface CompanySettings {
  companyName: string;
  nit: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  assetPrefix: string;
}

export interface UpdateSettingsDTO extends Partial<CompanySettings> {}
```

---

# 4. Servicio API (`src/services/setting.service.ts`)

```typescript
import api from '../api/axios.instance';
import { CompanySettings, UpdateSettingsDTO } from '../interfaces/setting.interface';

export const settingService = {
  async getSettings(): Promise<CompanySettings> {
    const response = await api.get<{ success: boolean; data: CompanySettings }>('/settings');
    return response.data.data;
  },

  async updateSettings(data: UpdateSettingsDTO): Promise<CompanySettings> {
    const response = await api.put<{ success: boolean; message: string; data: CompanySettings }>(
      '/settings',
      data,
    );
    return response.data.data;
  },

  async getByKey(key: string) {
    const response = await api.get<{ success: boolean; data: any }>(`/settings/${key}`);
    return response.data.data;
  },
};
```

---

# 5. Componentes e Interfaz de Usuario

### 5.1 Vista de Configuración (`src/pages/SettingsPage.tsx`)
- Formulario limpio estructurado en dos secciones principales:
  - **Datos Institucionales COMIBOL:** Razón Social, NIT, Dirección Casa Matriz, Teléfono, Email Oficial.
  - **Parámetros del Sistema:** Moneda de reporte (BOB - Bs.), Prefijo Patrimonial (ej: `AF`).
- Botón de guardado con estado de actualización `ToastNotif` de confirmación.

---

# 6. Criterios de Aceptación

- [ ] Carga inicial de datos institucionales conectada a `GET /api/v1/settings`.
- [ ] Actualización en lote funcional conectada a `PUT /api/v1/settings`.
- [ ] Sincronización en tiempo real de los datos institucionales mostrados en los encabezados y reportes del frontend.
