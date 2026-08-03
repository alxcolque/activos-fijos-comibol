# Módulo de Gestión Documental de Activos Frontend
**Documento:** FRONTEND_08_DOCUMENTS.md  
**Versión:** 1.0.0  
**Proyecto:** Client Frontend Activos Fijos COMIBOL  
**Módulo:** Adjuntos y Archivo Digital Patrimonial  
**Fecha:** Agosto 2026  

---

# 1. Objetivo

Especificar la implementación del módulo de **Gestión Documental de Activos** en el cliente frontend. Permite adjuntar y visualizar expedientes digitales asociados a cada activo fijo (facturas de compra, pólizas de importación, actas de entrega/recepción de custodio, certificados de garantía y manuales de operación), integrando el servicio de subida de archivos binarios (`/api/v1/uploads`).

---

# 2. Endpoints Backend Compatibles

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/v1/uploads` | Subir archivo digital binario (`multipart/form-data`) al servidor |
| `POST` | `/api/v1/documents` | Registrar los metadatos del documento adjunto vinculado al activo |
| `GET` | `/api/v1/documents/asset/:assetId` | Consultar la lista de documentos adjuntos a un activo especifico |
| `DELETE` | `/api/v1/documents/:id` | Eliminar registro del documento adjunto |

---

# 3. Interfaces de Datos (`src/interfaces/document.interface.ts`)

```typescript
export type DocumentType = 'PHOTO' | 'MANUAL' | 'INVOICE' | 'WARRANTY' | 'REPORT' | 'OTHER';

export interface AssetDocument {
  id: string;
  assetId: string;
  type: DocumentType;
  fileName: string;
  originalName: string;
  mimeType: string;
  extension: string;
  size: number;
  path: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentDTO {
  assetId: string;
  type: DocumentType;
  fileName: string;
  originalName: string;
  mimeType: string;
  extension: string;
  size: number;
  path: string;
  description?: string;
}
```

---

# 4. Servicio API (`src/services/document.service.ts`)

```typescript
import api from '../api/axios.instance';
import { AssetDocument, CreateDocumentDTO } from '../interfaces/document.interface';

export const documentService = {
  async uploadBinaryFile(file: File, folder = 'documents') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await api.post<{ success: boolean; data: any }>('/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async attachDocument(data: CreateDocumentDTO) {
    const response = await api.post<{ success: boolean; data: AssetDocument }>('/documents', data);
    return response.data.data;
  },

  async getByAssetId(assetId: string, type?: string) {
    const response = await api.get<{ success: boolean; data: AssetDocument[] }>(
      `/documents/asset/${assetId}`,
      { params: { type } },
    );
    return response.data.data;
  },

  async delete(id: string) {
    const response = await api.delete<{ success: boolean; message: string }>(`/documents/${id}`);
    return response.data;
  },
};
```

---

# 5. Componentes e Interfaz de Usuario

### 5.1 Modal de Carga de Documento (`src/components/documents/DocumentUploadModal.tsx`)
- Selector del **Tipo de Documento** (`Factura`, `Garantía`, `Manual`, `Fotografía`, `Informe`, `Otro`).
- Selector de Archivo (soporta `.pdf`, `.png`, `.jpg`, `.docx`).
- Flujo de dos pasos: primero sube el binario a `/api/v1/uploads` y luego registra los metadatos en `/api/v1/documents`.

### 5.2 Galería / Galaxia Digital de Documentos del Activo (`src/components/assets/AssetDocumentsList.tsx`)
- Listado de expedientes adjuntos con previsualizador de imágenes e íconos representativos según extensión (`PDF`, `DOCX`, `ZIP`).
- Enlace directo de descarga o apertura en nueva pestaña a `/uploads/...`.

---

# 6. Criterios de Aceptación

- [ ] Carga fluida de expedientes digitales ligada a `POST /api/v1/uploads` y `POST /api/v1/documents`.
- [ ] Listado de expedientes adjuntos filtrable por tipo de documento.
- [ ] Previsualización y descarga funcional de archivos subidos.
