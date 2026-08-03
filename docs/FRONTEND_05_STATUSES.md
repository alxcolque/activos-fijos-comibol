# Módulo de Estados Operativos de Activos Fijos
**Documento:** FRONTEND_05_STATUSES.md  
**Versión:** 1.0.0  
**Proyecto:** Client Frontend Activos Fijos COMIBOL  
**Módulo:** Gestión de Estados Operativos y Ciclo de Vida  
**Fecha:** Agosto 2026  

---

# 1. Objetivo

Especificar la implementación técnica del módulo de **Estados Operativos** (`/statuses`) para administrar los estados del ciclo de vida de los activos patrimoniales de COMIBOL (Operativo, En Mantenimiento, En Stock, De Baja, En Reparación). Permite crear, modificar y listar estados operativos con identificadores visuales y colores temáticos.

---

# 2. Endpoints Backend Compatibles

| Método | Endpoint | Descripción | Requiere Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/statuses` | Obtiene el listado completo de estados operativos | Sí |
| `POST` | `/api/v1/statuses` | Registra un nuevo estado operativo | Sí |
| `GET` | `/api/v1/statuses/:id` | Obtiene la información detallada de un estado | Sí |
| `PUT` | `/api/v1/statuses/:id` | Actualiza un estado operativo existente | Sí |
| `DELETE` | `/api/v1/statuses/:id` | Elimina un estado operativo no utilizado | Sí |

---

# 3. Interfaces de Datos (`src/interfaces/status.interface.ts`)

```typescript
export interface AssetStatus {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    assets: number;
  };
}

export interface CreateStatusDTO {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateStatusDTO extends Partial<CreateStatusDTO> {}
```

---

# 4. Estado Global Zustand (`src/store/statusStore.ts`)

```typescript
import { create } from 'zustand';
import api from '../api/axios.instance';
import { AssetStatus, CreateStatusDTO, UpdateStatusDTO } from '../interfaces/status.interface';

interface StatusState {
  statuses: AssetStatus[];
  isLoading: boolean;
  error: string | null;
  fetchStatuses: () => Promise<void>;
  createStatus: (data: CreateStatusDTO) => Promise<void>;
  updateStatus: (id: string, data: UpdateStatusDTO) => Promise<void>;
  deleteStatus: (id: string) => Promise<void>;
}

export const useStatusStore = create<StatusState>((set, get) => ({
  statuses: [],
  isLoading: false,
  error: null,
  fetchStatuses: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ success: boolean; data: AssetStatus[] }>('/statuses');
      set({ statuses: response.data.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error al obtener estados', isLoading: false });
    }
  },
  createStatus: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/statuses', data);
      await get().fetchStatuses();
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al crear estado');
    }
  },
  updateStatus: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await api.put(`/statuses/${id}`, data);
      await get().fetchStatuses();
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al actualizar estado');
    }
  },
  deleteStatus: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/statuses/${id}`);
      await get().fetchStatuses();
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al eliminar estado');
    }
  },
}));
```

---

# 5. Componentes e Interfaz de Usuario (`src/pages/Statuses.tsx`)

### Componentes Visuales:
1. **Tabla de Estados (`DataTable`):**
   - Muestra Insignia con Código de Color (Badge `StatusBadge`), Nombre, Descripción, Total de Activos y Acciones.
2. **Modal Formulario de Estado (`StatusFormModal.tsx`):**
   - Inputs para `name`, `description` y Selector de Color (Color Picker o Paleta Predefinida de HeroUI / Tailwind).
3. **Insignia Reutilizable (`StatusBadge.tsx`):**
   - Muestra el texto del estado con background y borde dinámico según el valor hexadecimal o clase del estado (`emerald`, `amber`, `rose`, `slate`, `blue`).

---

# 6. Criterios de Aceptación

- [ ] Consumo directo de `GET /api/v1/statuses` al cargar la vista.
- [ ] Renderizado dinámico de Badges de estado en todas las tablas del sistema.
- [ ] Validación de nombres duplicados de estados.
- [ ] Bloqueo de eliminación para estados asignados a activos activos.
