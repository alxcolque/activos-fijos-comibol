# Módulo de Documentación Adjunta Digital
**Documento:** FRONTEND_10_DOCUMENTS.md  
**Versión:** 1.0.0  
**Proyecto:** Client Frontend Activos Fijos COMIBOL  
**Módulo:** Archivo Digital y Adjuntos Legales/Técnicos por Activo  
**Fecha:** Agosto 2026  

---

# 1. Objetivo

Especificar la implementación técnica del módulo de **Documentos Adjuntos** para asociar archivos PDF, imágenes o comprobantes escaneados (facturas de compra, pólizas de importación, manuales técnicos, actas de recepción) a cada activo fijo.

---

# 2. Endpoints Backend Compatibles

| Método | Endpoint | Descripción | Requiere Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/documents/asset/:assetId` | Lista los documentos adjuntos de un activo | Sí |
| `POST` | `/api/v1/documents` | Asocia un documento adjunto subido a un activo | Sí |
| `DELETE` | `/api/v1/documents/:id` | Elimina un documento adjunto | Sí |
| `POST` | `/api/v1/uploads` | Carga el archivo físico al servidor (multipart/form-data) | Sí |

---

# 3. Interfaces de Datos (`src/interfaces/document.interface.ts`)

```typescript
export interface AssetDocument {
  id: string;
  assetId: string;
  title: string;
  filePath: string;
  fileType?: string | null;
  fileSize?: number | null;
  createdAt: string;
}

export interface CreateDocumentDTO {
  assetId: string;
  title: string;
  filePath: string;
  fileType?: string;
  fileSize?: number;
}
```

---

# 4. Estado Global Zustand (`src/store/documentStore.ts`)

```typescript
import { create } from 'zustand';
import api from '../api/axios.instance';
import { AssetDocument, CreateDocumentDTO } from '../interfaces/document.interface';

interface DocumentState {
  documents: AssetDocument[];
  isLoading: boolean;
  error: string | null;
  fetchDocumentsByAsset: (assetId: string) => Promise<void>;
  uploadAndAttachDocument: (assetId: string, title: string, file: File) => Promise<void>;
  deleteDocument: (id: string, assetId: string) => Promise<void>;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  isLoading: false,
  error: null,
  fetchDocumentsByAsset: async (assetId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ success: boolean; data: AssetDocument[] }>(`/documents/asset/${assetId}`);
      set({ documents: response.data.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error al obtener documentos', isLoading: false });
    }
  },
  uploadAndAttachDocument: async (assetId, title, file) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Subir archivo físico
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await api.post<{ success: boolean; data: { path: string; size: number; mimeType: string } }>('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // 2. Asociar al activo
      const payload: CreateDocumentDTO = {
        assetId,
        title,
        filePath: uploadRes.data.data.path,
        fileType: uploadRes.data.data.mimeType,
        fileSize: uploadRes.data.data.size,
      };
      await api.post('/documents', payload);
      await get().fetchDocumentsByAsset(assetId);
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al adjuntar documento');
    }
  },
  deleteDocument: async (id, assetId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/documents/${id}`);
      await get().fetchDocumentsByAsset(assetId);
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Error al eliminar documento');
    }
  },
}));
```

---

# 5. Componentes e Interfaz de Usuario (`src/components/documents/AssetDocumentsTab.tsx`)

### Componentes Visuales:
- **Visor de Archivo Digital:** Galería/Lista de documentos adjuntos con vista previa de íconos por extensión (PDF, PNG, JPG, DOCX), tamaño de archivo en KB/MB y fecha de carga.
- **Botón Descargar / Abrir:** Enlace directo al archivo estático en `/uploads/*`.
- **Formulario de Carga (`UploadZone`):** Input de archivo con arrastrar y soltar (Drag & Drop) y campo de título personalizado.

---

# 6. Criterios de Aceptación

- [ ] Carga exitosa de archivos utilizando `multipart/form-data`.
- [ ] Visualización directa o descarga de archivos adjuntos.
- [ ] Eliminación de referencias con confirmación de usuario.
