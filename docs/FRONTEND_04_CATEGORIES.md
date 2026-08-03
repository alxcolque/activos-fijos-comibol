# Módulo de Categorías de Activos Fijos
**Documento:** FRONTEND_04_CATEGORIES.md  
**Versión:** 1.0.1  
**Proyecto:** Client Frontend Activos Fijos COMIBOL  
**Módulo:** Gestión de Categorías y Catálogo Patrimonial  
**Fecha:** Agosto 2026  

---

# 1. Objetivo

Especificar la implementación técnica del módulo de **Categorías de Activos** (`/categories`) para administrar el catálogo de familias de activos de COMIBOL (Maquinaria Pesada, Equipos de Computación, Vehículos, Muebles y Enseres, etc.). Permite consultar, crear, editar y eliminar categorías mediante modales reactivos utilizando exclusivamente los campos `name` y `description`.

---

# 2. Endpoints Backend Compatibles

| Método | Endpoint | Descripción | Requiere Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/categories` | Obtiene el listado completo de categorías de activos | Sí |
| `POST` | `/api/v1/categories` | Registra una nueva categoría | Sí |
| `GET` | `/api/v1/categories/:id` | Obtiene la información detallada de una categoría | Sí |
| `PUT` | `/api/v1/categories/:id` | Actualiza la información de una categoría | Sí |
| `DELETE` | `/api/v1/categories/:id` | Elimina una categoría (si no tiene activos vinculados) | Sí |

---

# 3. Interfaces de Datos (`src/interfaces/category.interface.ts`)

```typescript
export interface AssetCategory {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    assets: number;
  };
}

export interface CreateCategoryDTO {
  name: string;
  description?: string;
}

export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {}
```

---

# 4. Estado Global Zustand (`src/store/categoryStore.ts`)

```typescript
import { create } from 'zustand';
import api from '../api/axios.instance';
import { AssetCategory, CreateCategoryDTO, UpdateCategoryDTO } from '../interfaces/category.interface';

interface CategoryState {
  categories: AssetCategory[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  createCategory: (data: CreateCategoryDTO) => Promise<void>;
  updateCategory: (id: string, data: UpdateCategoryDTO) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,
  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ success: boolean; data: AssetCategory[] }>('/categories');
      set({ categories: response.data.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error al obtener categorías', isLoading: false });
    }
  },
  createCategory: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/categories', data);
      await get().fetchCategories();
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al crear categoría');
    }
  },
  updateCategory: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await api.put(`/categories/${id}`, data);
      await get().fetchCategories();
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al actualizar categoría');
    }
  },
  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/categories/${id}`);
      await get().fetchCategories();
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al eliminar categoría');
    }
  },
}));
```

---

# 5. Componentes e Interfaz de Usuario (`src/pages/Categories.tsx`)

### Vistas y Modales:
1. **Tabla de Categorías (`DataTable`):**
   - Columnas: Nombre de Categoría, Descripción, Total Activos Asociados, Acciones.
2. **Modal Formulario Categoría (`CategoryFormModal.tsx`):**
   - Inputs exclusivamente para `name` y `description`.
   - Validaciones de campos obligatorios antes de enviar.
3. **Modal de Confirmación de Eliminación (`ConfirmDialog`):**
   - Muestra advertencia si la categoría contiene activos registrados impidiendo la eliminación física.

---

# 6. Criterios de Aceptación

- [ ] Formulario CRUD únicamente con los campos `name` y `description`.
- [ ] Listado de categorías renderizado desde `GET /api/v1/categories`.
- [ ] Creación y edición reactiva mediante modal sin recargar la página.
- [ ] Feedback con alertas visuales de éxito o error en peticiones HTTP.
