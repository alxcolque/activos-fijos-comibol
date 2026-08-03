# Módulo Escáner y Generador de Código QR Frontend
**Documento:** FRONTEND_11_QR_SCANNER.md  
**Versión:** 1.0.0  
**Proyecto:** Client Frontend Activos Fijos COMIBOL  
**Módulo:** Escaneo por Cámara WebRTC y Generación de Etiquetas QR Patrimoniales  
**Fecha:** Agosto 2026  

---

# 1. Objetivo

Especificar la implementación del módulo de **Escáner y Generación de Códigos QR** en el cliente frontend. Permite a los auxiliares y auditores escanear las etiquetas físicamente pegadas en los activos fijos mediante la cámara web o dispositivo móvil para acceder de inmediato a la ficha técnica del activo, además de permitir la generación e impresión de etiquetas QR en lote.

---

# 2. Endpoints Backend Compatibles

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/v1/assets/qr/:qrCode` | Buscar un activo fijo por su código QR único |
| `GET` | `/api/v1/assets` | Buscar activos por código o término genérico |

---

# 3. Componentes e Interfaz de Usuario

### 3.1 Escáner por Cámara WebRTC (`src/components/qr/QRScannerModal.tsx`)
- Integración con la librería `html5-qrcode` para lectura dinámica de video desde la cámara frontal/trasera.
- Detección automática del código impreso en la etiqueta patrimonial (`AF-000100`).
- Al identificar un código válido:
  - Cierra la cámara.
  - Ejecuta `GET /api/v1/assets/qr/:qrCode`.
  - Redirige o abre la Ficha Técnica del Activo Fijo de forma instantánea.

### 3.2 Generador e Impresor de Etiquetas QR (`src/components/qr/QRBadgePrintModal.tsx`)
- Generación gráfica del código QR utilizando la librería `qrcode.react` o SVG canvas.
- Diseño de la etiqueta física oficial COMIBOL:
  - Logotipo institucional de COMIBOL.
  - Código QR de alta resolución.
  - Código patrimonial visible (ej: `AF-000100`).
  - Nombre corto del activo.
- Botón de **Imprimir Etiqueta** optimizado para impresoras térmicas de etiquetas o PDF.

---

# 4. Criterios de Aceptación

- [ ] Escáner WebRTC leyendo etiquetas de activos sin latencia.
- [ ] Búsqueda directa del activo escaneado contra la API Backend.
- [ ] Vista previa e impresión de etiquetas patrimoniales formateadas para COMIBOL.
