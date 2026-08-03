# Módulo de Importación Masiva en Excel
**Documento:** FRONTEND_14_IMPORT_EXCEL.md  
**Versión:** 1.0.0  
**Proyecto:** Client Frontend Activos Fijos COMIBOL  
**Módulo:** Carga Masiva de Activos Fijos desde Plantilla Excel (.xlsx)  
**Fecha:** Agosto 2026  

---

# 1. Objetivo

Especificar la implementación técnica del módulo de **Importación Masiva desde Excel** (`/import`) para cargar lotes de activos fijos desde plantillas estandarizadas en Excel (.xlsx), validando campos obligatorios y mostrando un informe detallado de resultados.

---

# 2. Endpoints Backend Compatibles

| Método | Endpoint | Descripción | Requiere Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/import/template` | Descarga la plantilla oficial en Excel (.xlsx) | Sí |
| `POST` | `/api/v1/import/assets` | Carga el archivo `.xlsx` e importa registros a la base de datos | Sí |

---

# 3. Interfaces de Datos (`src/interfaces/import.interface.ts`)

```typescript
export interface ImportErrorDetail {
  row: number;
  code: string;
  field?: string;
  error: string;
}

export interface ImportResultData {
  importedCount: number;
  failedCount: number;
  errors: ImportErrorDetail[];
}
```

---

# 4. Estado Global Zustand (`src/store/importStore.ts`)

```typescript
import { create } from 'zustand';
import api from '../api/axios.instance';
import { ImportResultData } from '../interfaces/import.interface';

interface ImportState {
  isUploading: boolean;
  result: ImportResultData | null;
  error: string | null;
  downloadTemplate: () => Promise<void>;
  importAssetsExcel: (file: File) => Promise<ImportResultData>;
  clearResult: () => void;
}

export const useImportStore = create<ImportState>((set) => ({
  isUploading: false,
  result: null,
  error: null,
  downloadTemplate: async () => {
    try {
      const response = await api.get('/import/template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Plantilla_Importacion_Activos_COMIBOL.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      throw new Error('Error al descargar la plantilla de importación');
    }
  },
  importAssetsExcel: async (file: File) => {
    set({ isUploading: true, error: null, result: null });
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post<{ success: boolean; data: ImportResultData }>('/import/assets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      set({ result: response.data.data, isUploading: false });
      return response.data.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al procesar el archivo Excel';
      set({ error: msg, isUploading: false });
      throw new Error(msg);
    }
  },
  clearResult: () => set({ result: null, error: null }),
}));
```

---

# 5. Componentes e Interfaz de Usuario (`src/pages/ImportExcel.tsx`)

### Componentes Visuales:
1. **Zona de Carga (`ExcelDropzone.tsx`):** Drag & Drop con selector de archivos `.xlsx` / `.xls` de hasta 10MB.
2. **Botón Descargar Plantilla:** Descarga directa de la plantilla oficial con cabeceras requeridas (código, nombre, categoría, estado, ubicación, valor, fecha de compra).
3. **Resumen de Resultados (`ImportSummaryCard.tsx`):**
   - Conteo de registros importados exitosamente.
   - Conteo de filas rechazadas o erróneas.
   - Tabla de errores con número de fila, código de activo y causa del fallo.

---

# 6. Criterios de Aceptación

- [ ] Descarga funcional del archivo `.xlsx` de plantilla.
- [ ] Procesamiento asíncrono con barra o spinner de progreso de importación.
- [ ] Presentación clara del desglose de errores por fila.
