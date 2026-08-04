# Módulo de Categorías de Activos Fijos
**Documento:** FRONTEND_04_CATEGORIES.md  
**Versión:** 1.1.0  
**Proyecto:** Client Frontend Activos Fijos COMIBOL  
**Módulo:** Gestión de Categorías y Catálogo Patrimonial  
**Fecha:** Agosto 2026  

---

# 1. Objetivo

Especificar la implementación técnica del módulo de **Categorías de Activos** (`/categories`) para administrar el catálogo de familias de activos de COMIBOL (Maquinaria Pesada, Equipos de Computación, Vehículos, Muebles y Enseres, etc.). Permite consultar, crear, editar y eliminar categorías mediante modales reactivos utilizando los campos `name`, `usefulLife` y `description`.

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
  usefulLife?: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    assets: number;
  };
}

export interface CreateCategoryDTO {
  name: string;
  description?: string;
  usefulLife?: number;
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
```

---

# 5. Componentes e Interfaz de Usuario (`src/pages/Categories.tsx`)

### Vistas y Modales:
1. **Tabla de Categorías (`DataTable`):**
   - Columnas: N°, Nombre de Categoría, Vida Útil (Años), Descripción, Acciones.
2. **Modal Formulario Categoría (`CategoryFormModal.tsx`):**
   - Inputs para `name`, `usefulLife` (Años de vida útil predeterminada) y `description`.
   - Validaciones de campos obligatorios antes de enviar.
3. **Modal de Confirmación de Eliminación (`ConfirmDialog`):**
   - Muestra advertencia si la categoría contiene activos registrados impidiendo la eliminación física.
