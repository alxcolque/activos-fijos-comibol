# Módulo de Importación Masiva desde Excel Frontend
**Documento:** FRONTEND_05_IMPORT_EXCEL.md  
**Versión:** 1.0.0  
**Proyecto:** Client Frontend Activos Fijos COMIBOL  
**Módulo:** Carga Masiva de Activos Fijos desde Hojas de Cálculo  
**Fecha:** Agosto 2026  

---

# 1. Objetivo

Especificar la implementación del módulo de **Importación Masiva de Activos Fijos desde Excel**. El cliente frontend debe proporcionar una interfaz intuitiva con soporte de descarga de plantilla oficial, zona de arrastrar y soltar (Drag & Drop) para archivos `.xlsx` / `.xls`, vista previa de procesamiento y un informe detallado de resultados indicando los registros creados con éxito y la lista de errores por fila en caso de fallos.

---

# 2. Endpoints Backend Compatibles

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/v1/import/template` | Obtener la estructura y especificación de columnas de la plantilla oficial |
| `POST` | `/api/v1/import/excel` | Enviar archivo Excel (`multipart/form-data`) o lote JSON para importación masiva |

---

# 3. Interfaces de Datos (`src/interfaces/import.interface.ts`)

```typescript
export interface TemplateColumn {
  name: string;
  label: string;
  required: boolean;
  example: string | number;
}

export interface TemplateResponse {
  columns: TemplateColumn[];
}

export interface ImportErrorItem {
  row: number;
  code?: string;
  message: string;
}

export interface ImportResult {
  totalRows: number;
  importedCount: number;
  failedCount: number;
  errors: ImportErrorItem[];
}
```

---

# 4. Servicio API (`src/services/import.service.ts`)

```typescript
import api from '../api/axios.instance';
import { TemplateResponse, ImportResult } from '../interfaces/import.interface';

export const importService = {
  async getTemplate(): Promise<TemplateResponse> {
    const response = await api.get<{ success: boolean; data: TemplateResponse }>('/import/template');
    return response.data.data;
  },

  async uploadExcelFile(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<{ success: boolean; data: ImportResult }>(
      '/import/excel',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data.data;
  },
};
```

---

# 5. Componentes e Interfaz de Usuario

### 5.1 Modal / Página de Importación Masiva (`src/pages/ImportExcelPage.tsx` o `ImportExcelModal.tsx`)
- **Paso 1: Descargar Plantilla:** Botón prominente "Descargar Plantilla Oficial COMIBOL" que genera o descarga el archivo `.xlsx` de ejemplo basado en `GET /api/v1/import/template`.
- **Paso 2: Cargar Archivo (Dropzone):** Área interactiva con soporte para soltar archivos `.xlsx` y `.xls`, validando el formato y mostrando el nombre del archivo seleccionado.
- **Paso 3: Botón Procesar Importación:** Envía la petición `POST /api/v1/import/excel` con indicador de progreso y spinner de carga.

### 5.2 Resumen e Informe de Resultados (`src/components/import/ImportResultSummary.tsx`)
Muestra el desglose devuelto por la API:
- **Tarjetas de Estadísticas:**
  - `totalRows`: Total de filas procesadas.
  - `importedCount`: Registros importados exitosamente (Verde).
  - `failedCount`: Registros fallidos (Rojo/Ámbar).
- **Tabla de Observaciones y Errores:**
  - Muestra el número de fila (`row`), el código (`code`) y el mensaje exacto de error enviado por el servidor (ej: *"El código AF-000100 ya existe en el sistema"* o *"El número de serie está duplicado en el lote"*).

---

# 6. Criterios de Aceptación

- [ ] Zona Dropzone funcional para selección de archivos Excel.
- [ ] Envío correcto de `multipart/form-data` al endpoint `POST /api/v1/import/excel`.
- [ ] Descarga o generación de plantilla a partir de `GET /api/v1/import/template`.
- [ ] Visualización clara del resumen de resultados e informe de errores por fila.
