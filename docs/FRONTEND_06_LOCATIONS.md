# Módulo de Ubicaciones Jerárquicas
**Documento:** FRONTEND_06_LOCATIONS.md  
**Versión:** 1.0.0  
**Proyecto:** Client Frontend Activos Fijos COMIBOL  
**Módulo:** Estructura de Sedes, Minas y Departamentos  
**Fecha:** Agosto 2026  

---

# 1. Objetivo

Especificar la implementación técnica del módulo de **Ubicaciones Jerárquicas** (`/locations`) para visualizar y gestionar la estructura organizativa de COMIBOL (Oficina Central La Paz, Empresa Minera Huanuni, Empresa Minera Colquiri, Planta Fundición Vinto, etc.) mediante un árbol interactivo o vista en tabla recursiva.

---

# 2. Endpoints Backend Compatibles

| Método | Endpoint | Descripción | Requiere Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/locations/tree` | Obtiene el árbol jerárquico recursivo de ubicaciones | Sí |
| `GET` | `/api/v1/locations` | Obtiene la lista plana de ubicaciones para comboboxes | Sí |
| `POST` | `/api/v1/locations` | Registra una nueva ubicación o sub-ubicación | Sí |
| `GET` | `/api/v1/locations/:id` | Obtiene los detalles de una ubicación específica | Sí |
| `PUT` | `/api/v1/locations/:id` | Actualiza la información de una ubicación | Sí |
| `DELETE` | `/api/v1/locations/:id` | Elimina una ubicación si no contiene sub-nodos o activos | Sí |

---

# 3. Interfaces de Datos (`src/interfaces/location.interface.ts`)

```typescript
export interface LocationNode {
  id: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
  children?: LocationNode[];
  _count?: {
    assets: number;
  };
}

export interface CreateLocationDTO {
  name: string;
  description?: string;
  parentId?: string | null;
}

export interface UpdateLocationDTO extends Partial<CreateLocationDTO> {}
```

---

# 4. Estado Global Zustand (`src/store/locationStore.ts`)

```typescript
import { create } from 'zustand';
import api from '../api/axios.instance';
import { LocationNode, CreateLocationDTO, UpdateLocationDTO } from '../interfaces/location.interface';

interface LocationState {
  locationsTree: LocationNode[];
  locationsFlat: LocationNode[];
  isLoading: boolean;
  error: string | null;
  fetchLocationsTree: () => Promise<void>;
  fetchLocationsFlat: () => Promise<void>;
  createLocation: (data: CreateLocationDTO) => Promise<void>;
  updateLocation: (id: string, data: UpdateLocationDTO) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  locationsTree: [],
  locationsFlat: [],
  isLoading: false,
  error: null,
  fetchLocationsTree: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ success: boolean; data: LocationNode[] }>('/locations/tree');
      set({ locationsTree: response.data.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error al cargar árbol de ubicaciones', isLoading: false });
    }
  },
  fetchLocationsFlat: async () => {
    try {
      const response = await api.get<{ success: boolean; data: LocationNode[] }>('/locations');
      set({ locationsFlat: response.data.data });
    } catch (err: any) {
      console.error('Error fetching flat locations', err);
    }
  },
  createLocation: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/locations', data);
      await Promise.all([get().fetchLocationsTree(), get().fetchLocationsFlat()]);
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al crear ubicación');
    }
  },
  updateLocation: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await api.put(`/locations/${id}`, data);
      await Promise.all([get().fetchLocationsTree(), get().fetchLocationsFlat()]);
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al actualizar ubicación');
    }
  },
  deleteLocation: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/locations/${id}`);
      await Promise.all([get().fetchLocationsTree(), get().fetchLocationsFlat()]);
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al eliminar ubicación');
    }
  },
}));
```

---

# 5. Componentes e Interfaz de Usuario (`src/pages/Locations.tsx`)

### Componentes Visuales:
1. **Árbol de Ubicaciones (`LocationsTreeView.tsx`):**
   - Componente colapsable recursivo que representa la jerarquía (Sede Principal $\rightarrow$ Mina/Planta $\rightarrow$ Departamento $\rightarrow$ Oficina).
   - Muestra contador de activos por nodo y botones flotantes para "+ Agregar Sub-ubicación", "Editar" y "Eliminar".
2. **Modal Formulario de Ubicación (`LocationFormModal.tsx`):**
   - Campos para `name`, `description` y `parentId` (Dropdown filtrable cargado desde `locationsFlat`).

---

# 6. Criterios de Aceptación

- [ ] Carga del árbol jerárquico mediante `GET /api/v1/locations/tree`.
- [ ] Soporte para asignación de nodos padre (relación recursiva).
- [ ] Navegación limpia y colapsable en el componente de árbol.
- [ ] Prevención de ciclos en la jerarquía y validación de eliminación para nodos con hijos.
