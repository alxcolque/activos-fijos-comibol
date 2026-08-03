# Módulo de Exportación de Información Patrimonial
**Documento:** FRONTEND_15_EXPORTS.md  
**Versión:** 1.0.0  
**Proyecto:** Client Frontend Activos Fijos COMIBOL  
**Módulo:** Exportación de Reportes en Format PDF y Excel (.xlsx)  
**Fecha:** Agosto 2026  

---

# 1. Objetivo

Especificar la implementación técnica del módulo de **Exportación de Datos** para descargar reportes consolidados del inventario de activos, tablas de depreciación contable y listas de custodia en formatos de archivo PDF e impresos o planillas Excel (.xlsx).

---

# 2. Endpoints Backend Compatibles

| Método | Endpoint | Descripción | Requiere Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/reports/assets` | Obtiene reporte consolidado de activos para exportación | Sí |
| `GET` | `/api/v1/reports/depreciation` | Obtiene cálculo de depreciación acumulada para exportación | Sí |
| `GET` | `/api/v1/reports/assignments` | Obtiene reporte de custodios para exportación | Sí |
| `GET` | `/api/v1/reports/maintenances` | Obtiene reporte de historial de mantenimientos para exportación | Sí |

---

# 3. Utilidades Frontend de Exportación (`src/utils/exportUtils.ts`)

```typescript
import { ReportQueryParams } from '../interfaces/report.interface';
import api from '../api/axios.instance';

export const exportUtils = {
  async downloadReportExcel(endpoint: string, params?: ReportQueryParams, filename = 'Reporte_COMIBOL.xlsx') {
    const response = await api.get(endpoint, {
      params: { ...params, format: 'excel' },
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  async downloadReportPDF(endpoint: string, params?: ReportQueryParams, filename = 'Reporte_COMIBOL.pdf') {
    const response = await api.get(endpoint, {
      params: { ...params, format: 'pdf' },
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
```

---

# 4. Componentes e Interfaz de Usuario (`src/components/reports/ExportActionButtons.tsx`)

### Botones de Acción:
1. **Botón Exportar a Excel (`HiOutlineTableCells`):** Genera la descarga en formato `.xlsx` aplicando los filtros de fecha, categoría, estado o proyecto actualmente seleccionados.
2. **Botón Exportar a PDF (`HiOutlineDocumentText`):** Descarga el reporte con membrete oficial institucional de COMIBOL.
3. **Botón Imprimir (`HiOutlinePrinter`):** Abre la ventana nativa de impresión del navegador formateada con estilos `@media print`.

---

# 5. Criterios de Aceptación

- [ ] Descarga binaria sin corrupción de archivos `.xlsx` y `.pdf`.
- [ ] Aplicación estricta de filtros seleccionados al exportar.
- [ ] Estilos de impresión `@media print` limpios que ocultan menús y barras laterales.
