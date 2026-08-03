# Módulo de Árbol Jerárquico de Ubicaciones Frontend
**Documento:** FRONTEND_04_LOCATIONS_TREE.md  
**Versión:** 1.0.0  
**Proyecto:** Client Frontend Activos Fijos COMIBOL  
**Módulo:** Estructura Jerárquica de Ubicaciones e Instalaciones  
**Fecha:** Agosto 2026  

---

# 1. Objetivo

Especificar la implementación del módulo de **Gestión Jerárquica de Ubicaciones** (`LocationsTree`). El cliente frontend debe permitir visualizar la estructura física y organizativa de la Corporación Minera de Bolivia (COMIBOL) en forma de árbol interactivo (Empresas/Filiales $\rightarrow$ Áreas/Departamentos $\rightarrow$ Oficinas/Pisos/Almacenes), además de permitir crear, editar y eliminar nodos de ubicación de manera ágil.

---

# 2. Endpoints Backend Compatibles

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/v1/locations/tree` | Obtener árbol jerárquico completo estructurado con hijos recursivos |
| `GET` | `/api/v1/locations` | Listar ubicaciones planas con paginación y búsqueda |
| `POST` | `/api/v1/locations` | Crear nueva ubicación (soporta `parentId` para jerarquía) |
| `PATCH` | `/api/v1/locations/:id` | Editar nombre, descripción o padre de una ubicación |
| `DELETE` | `/api/v1/locations/:id` | Eliminación lógica de ubicación (protegida si posee hijos o activos) |

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
}

export interface CreateLocationDTO {
  name: string;
  description?: string | null;
  parentId?: string | null;
}

export interface UpdateLocationDTO extends Partial<CreateLocationDTO> {}
```

---

# 4. Servicio API (`src/services/location.service.ts`)

```typescript
import api from '../api/axios.instance';
import { LocationNode, CreateLocationDTO, UpdateLocationDTO } from '../interfaces/location.interface';

export const locationService = {
  async getTree() {
    const response = await api.get<{ success: boolean; data: LocationNode[] }>('/locations/tree');
    return response.data.data;
  },

  async getAll(params?: { page?: number; limit?: number; search?: string }) {
    const response = await api.get<{ success: boolean; data: LocationNode[]; pagination: any }>('/locations', { params });
    return response.data;
  },

  async create(data: CreateLocationDTO) {
    const response = await api.post<{ success: boolean; data: LocationNode }>('/locations', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateLocationDTO) {
    const response = await api.patch<{ success: boolean; data: LocationNode }>(`/locations/${id}`, data);
    return response.data.data;
  },

  async delete(id: string) {
    const response = await api.delete<{ success: boolean; message: string }>(`/locations/${id}`);
    return response.data;
  },
};
```

---

# 5. Componentes e Interfaz de Usuario

### 5.1 Vista Principal de Ubicaciones (`src/pages/LocationsPage.tsx`)
- Alternador de vista entre **Vista de Árbol Jerárquico** y **Vista de Tabla Plana**.
- Panel lateral de detalles de la ubicación seleccionada.

### 5.2 Componente de Árbol Jerárquico (`src/components/locations/LocationTreeView.tsx`)
- Componente recursivo que despliega nodos expandibles/colapsables:
  - **Nivel 0:** Empresa / Filial (ej: COMIBOL Central, Huanuni, Colquiri, Vinto).
  - **Nivel 1:** Área / Dirección / Departamento (ej: Dirección Técnica Minera).
  - **Nivel 2:** Oficina / Sección / Almacén / Depósito.
- Iconografía clara por nivel y estado de expansión.
- Botones de acción contextual en cada nodo (Agregar Sub-ubicación, Editar, Eliminar).

### 5.3 Formulario de Ubicación (`src/components/locations/LocationFormModal.tsx`)
- Selector desplegable de **Ubicación Padre** (opcional, permite seleccionar la ubicación raíz o un nodo existente).
- Campo `name` obligatorio.
- Campo `description` multitexto.

---

# 6. Criterios de Aceptación

- [ ] Renderizado fluido del árbol de ubicaciones a partir de `GET /api/v1/locations/tree`.
- [ ] Creación de sub-ubicaciones padre-hijo funcionando con `POST /api/v1/locations`.
- [ ] Control de borrado: Muestra alerta si la API deniega la eliminación por presencia de activos o sub-ubicaciones dependientes.
