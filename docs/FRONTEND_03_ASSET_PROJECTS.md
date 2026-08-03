# Módulo de Asignación Activo-Proyecto Frontend
**Documento:** FRONTEND_03_ASSET_PROJECTS.md  
**Versión:** 1.0.0  
**Proyecto:** Client Frontend Activos Fijos COMIBOL  
**Módulo:** Asignación y Liberación de Activos en Proyectos Mineros  
**Fecha:** Agosto 2026  

---

# 1. Objetivo

Especificar la implementación del módulo de **Asignación y Liberación de Activos Fijos a Proyectos Mineros/Institucionales**. El cliente frontend debe permitir asignar un activo fijo disponible a un proyecto activo, visualizar la asignación actual en la ficha técnica del activo y registrar el historial completo de proyectos por los que ha pasado el equipo.

---

# 2. Endpoints Backend Compatibles

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/v1/asset-projects/assign` | Asignar un activo a un proyecto (requiere que el proyecto esté `ACTIVE`) |
| `POST` | `/api/v1/asset-projects/release` | Liberar/desvincular un activo del proyecto actual |
| `GET` | `/api/v1/asset-projects/asset/:assetId` | Consultar el historial completo de proyectos asignados a un activo |

---

# 3. Interfaces de Datos (`src/interfaces/asset-project.interface.ts`)

```typescript
export interface AssetProjectAssignment {
  id: string;
  assetId: string;
  projectId: string;
  assignedAt: string;
  releasedAt?: string | null;
  observations?: string | null;
  project?: {
    id: string;
    code: string;
    name: string;
    status: string;
  };
  asset?: {
    id: string;
    code: string;
    name: string;
  };
}

export interface AssignAssetToProjectDTO {
  assetId: string;
  projectId: string;
  observations?: string;
}

export interface ReleaseAssetFromProjectDTO {
  assetId: string;
  observations?: string;
}
```

---

# 4. Servicio API (`src/services/asset-project.service.ts`)

```typescript
import api from '../api/axios.instance';
import {
  AssetProjectAssignment,
  AssignAssetToProjectDTO,
  ReleaseAssetFromProjectDTO,
} from '../interfaces/asset-project.interface';

export const assetProjectService = {
  async assign(data: AssignAssetToProjectDTO) {
    const response = await api.post<{ success: boolean; message: string; data: AssetProjectAssignment }>(
      '/asset-projects/assign',
      data,
    );
    return response.data;
  },

  async release(data: ReleaseAssetFromProjectDTO) {
    const response = await api.post<{ success: boolean; message: string; data: AssetProjectAssignment }>(
      '/asset-projects/release',
      data,
    );
    return response.data;
  },

  async getAssetProjectHistory(assetId: string) {
    const response = await api.get<{ success: boolean; data: AssetProjectAssignment[] }>(
      `/asset-projects/asset/${assetId}`,
    );
    return response.data.data;
  },
};
```

---

# 5. Componentes e Interfaz de Usuario

### 5.1 Modal de Asignación a Proyecto (`src/components/assets/AssignProjectModal.tsx`)
- Desplegable selector de proyecto que filtra automáticamente solo proyectos con estado **ACTIVO** (`ACTIVE`).
- Campo opcional de observaciones de asignación (ej: "Asignado para fase de exploración inicial").
- Botón de confirmación con estado de carga `LoadingSpinner`.

### 5.2 Modal / Botón de Liberación de Proyecto (`src/components/assets/ReleaseProjectModal.tsx`)
- Muestra el proyecto actual en el que se encuentra el activo.
- Permite ingresar la razón u observaciones de devolución/liberación.
- Ejecuta `POST /api/v1/asset-projects/release` y actualiza la ficha del activo.

### 5.3 Pestaña de Historial de Proyectos en Detalle de Activo (`src/components/assets/AssetProjectHistoryTable.tsx`)
- Tabla cronológica en la ficha del activo mostrando:
  - Nombre y Código de Proyecto.
  - Fecha de Asignación.
  - Fecha de Liberación (o badge "ACTUALMENTE ASIGNADO").
  - Observaciones.

---

# 6. Criterios de Aceptación

- [ ] Asignación rápida a proyectos activa conectada a `POST /api/v1/asset-projects/assign`.
- [ ] Validación UI de exclusividad (un activo no puede estar asignado a dos proyectos simultáneamente).
- [ ] Liberación limpia de activos conectada a `POST /api/v1/asset-projects/release`.
- [ ] Visualización clara del historial en la ficha técnica del activo.
