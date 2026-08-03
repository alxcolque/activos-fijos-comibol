# Módulo de Gestión Integral de Activos Fijos
**Documento:** FRONTEND_08_ASSETS.md  
**Versión:** 1.0.0  
**Proyecto:** Client Frontend Activos Fijos COMIBOL  
**Módulo:** Inventario General, Ficha Técnica y CRUD de Activos  
**Fecha:** Agosto 2026  

---

# 1. Objetivo

Especificar la implementación técnica del módulo nuclear de **Activos Fijos** (`/assets`, `/assets/new`, `/assets/:id`, `/assets/:id/edit`). Es la vista principal para el registro, edición, eliminación, generación de QR y consulta detallada del inventario de activos patrimoniales de COMIBOL.

---

# 2. Endpoints Backend Compatibles

| Método | Endpoint | Descripción | Requiere Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/assets` | Obtiene lista paginada de activos con filtros múltiples | Sí |
| `POST` | `/api/v1/assets` | Registra un nuevo activo fijo | Sí |
| `GET` | `/api/v1/assets/:id` | Obtiene la ficha técnica completa de un activo | Sí |
| `PUT` | `/api/v1/assets/:id` | Actualiza la información de un activo | Sí |
| `DELETE` | `/api/v1/assets/:id` | Elimina un activo fijo del inventario | Sí |

---

# 3. Interfaces de Datos (`src/interfaces/asset.interface.ts`)

```typescript
export interface AssetModel {
  id: string;
  code: string;
  qrCode?: string | null;
  name: string;
  description?: string | null;
  categoryId: string;
  statusId: string;
  locationId: string;
  brand?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  unit?: string | null;
  quantity: number;
  purchaseDate?: string | null;
  purchaseYear?: number | null;
  purchaseValue?: number | null;
  usefulLife?: number | null;
  residualValue?: number | null;
  currentValue?: number | null;
  observations?: string | null;
  photo?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string };
  status?: { id: string; name: string; color?: string };
  location?: { id: string; name: string };
}

export interface CreateAssetDTO {
  code: string;
  name: string;
  categoryId: string;
  statusId: string;
  locationId: string;
  description?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  unit?: string;
  quantity?: number;
  purchaseDate?: string;
  purchaseValue?: number;
  usefulLife?: number;
  observations?: string;
  photo?: string;
}

export interface UpdateAssetDTO extends Partial<CreateAssetDTO> {}

export interface AssetQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  statusId?: string;
  locationId?: string;
}
```

---

# 4. Estado Global Zustand (`src/store/assetStore.ts`)

```typescript
import { create } from 'zustand';
import api from '../api/axios.instance';
import { AssetModel, CreateAssetDTO, UpdateAssetDTO, AssetQueryParams } from '../interfaces/asset.interface';
import { PaginationMeta } from '../interfaces/api-response.interface';

interface AssetStoreState {
  assets: AssetModel[];
  selectedAsset: AssetModel | null;
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  fetchAssets: (params?: AssetQueryParams) => Promise<void>;
  fetchAssetById: (id: string) => Promise<void>;
  createAsset: (data: CreateAssetDTO) => Promise<AssetModel>;
  updateAsset: (id: string, data: UpdateAssetDTO) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
}

export const useAssetStore = create<AssetStoreState>((set, get) => ({
  assets: [],
  selectedAsset: null,
  pagination: null,
  isLoading: false,
  error: null,
  fetchAssets: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ success: boolean; data: AssetModel[]; pagination: PaginationMeta }>('/assets', { params });
      set({ assets: response.data.data, pagination: response.data.pagination, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error al obtener activos', isLoading: false });
    }
  },
  fetchAssetById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ success: boolean; data: AssetModel }>(`/assets/${id}`);
      set({ selectedAsset: response.data.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error al obtener activo', isLoading: false });
    }
  },
  createAsset: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<{ success: boolean; data: AssetModel }>('/assets', data);
      await get().fetchAssets();
      return response.data.data;
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al crear activo');
    }
  },
  updateAsset: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await api.put(`/assets/${id}`, data);
      await get().fetchAssets();
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al actualizar activo');
    }
  },
  deleteAsset: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/assets/${id}`);
      await get().fetchAssets();
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al eliminar activo');
    }
  },
}));
```

---

# 5. Componentes e Interfaz de Usuario

### 5.1 Listado de Activos (`src/pages/AssetsList.tsx`)
- Alternancia de vista entre **Tabla** (`DataTable`) y **Tarjetas Grid** (`AssetCard`).
- Filtros combinados: Búsqueda libre, Categoría, Estado y Ubicación.
- Generación de Badge QR por fila mediante `QRBadge`.

### 5.2 Ficha Técnica (`src/pages/AssetDetail.tsx`)
- Detalle completo del activo con imagen (`AssetImage`), especificaciones técnicas, insignias de estado y accesos directos a custodias, proyectos y mantenimientos.

### 5.3 Formulario Crear/Editar (`src/pages/AssetForm.tsx`)
- Formulario reactivo dual (`/assets/new` y `/assets/:id/edit`) con carga asíncrona de selectores de categoría, estado y ubicación.

---

# 6. Criterios de Aceptación

- [ ] Paginación y filtrado reactivo con la API backend.
- [ ] Renderizado sin errores de imágenes con fallback visual en caso de 404.
- [ ] Confirmación modal requerida previa a la eliminación física de cualquier activo.
