# Sistema de Gestión de Activos Fijos — COMIBOL
**Resumen de Avance del Proyecto**

> **Versión del sistema:** `1.0.0-PROD-BASICO`  
> **Fecha del documento:** 2 de agosto de 2026  
> **Tipo de proyecto:** Prototipo de interfaz (Frontend Mock)

---

## 1. Descripción General

Sistema web para la gestión y control de activos fijos de la **Corporación Minera de Bolivia (COMIBOL)**. Permite registrar, catalogar, filtrar y visualizar los activos patrimoniales de la corporación distribuidos en sus distintas empresas y minas filiales.

La aplicación está desarrollada como un **SPA (Single Page Application)** con datos simulados mediante un archivo JSON local, sin conexión a base de datos real todavía. Está orientada a ser desplegada en GitHub Pages.

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Framework UI | React | 19.x |
| Lenguaje | TypeScript | ~6.0 |
| Build Tool | Vite | 8.x |
| Estilos | Tailwind CSS v4 | 4.3.x |
| Componentes UI | HeroUI (`@heroui/react`) | 3.2.x |
| Enrutamiento | React Router DOM | 7.x |
| Estado global | Zustand | 5.x |
| Iconos | React Icons (HeroIcons) | 5.x |
| Animaciones | Framer Motion | 12.x |
| HTTP Client | Axios | 1.x |
| Linter | OxLint | 1.x |
| Despliegue | GitHub Pages (`gh-pages`) | — |

---

## 3. Estructura del Proyecto

```
activos-fijos-comibol/
├── src/
│   ├── components/       # Componentes reutilizables (17 archivos)
│   ├── pages/            # Páginas de la aplicación (7 archivos)
│   ├── layouts/          # Layout principal (MainLayout)
│   ├── routes/           # Definición de rutas (AppRoutes)
│   ├── store/            # Estado global con Zustand (5 stores)
│   ├── services/         # Capa de servicio / API mock (api.ts)
│   ├── interfaces/       # Tipos e interfaces TypeScript (index.ts)
│   ├── data/             # Base de datos mock (db.json)
│   └── utils/            # Utilidades (assets.ts)
├── docs/
│   └── resumen-avance-proyecto.md
├── public/
├── vite.config.ts
└── package.json
```

---

## 4. Módulos Implementados

### 4.1 Dashboard (`/`)
- **Estado:** ✅ Completado
- Tarjetas de estadísticas dinámicas: total de activos, valoración total, operativos, en mantenimiento.
- Gráfico de barras de distribución de valor por categoría (calculado desde datos reales).
- Sección de actividad reciente con log de movimientos.
- Tabla de últimos activos registrados con navegación directa al detalle.
- Botón de acceso directo a "Nuevo Activo".

### 4.2 Control de Activos (`/assets`)
- **Estado:** ✅ Completado
- Listado completo de activos con **dos modos de vista**: tabla y tarjetas (grid).
- Filtros combinados: búsqueda libre (código, nombre, marca, modelo, serie), categoría, estado, responsable (custodio).
- Limpieza de filtros con contador de resultados en tiempo real.
- Código QR generado por cada activo en la columna de la tabla.
- Acciones por fila: **Ver detalle**, **Editar**, **Eliminar** con confirmación modal.
- Paginación integrada (`DataTable` con 10 filas por página).

### 4.3 Detalle de Activo (`/assets/:id`)
- **Estado:** ✅ Completado
- Ficha técnica completa del activo: código, nombre, marca, modelo, serie, estado, valor, fecha de compra, categoría, ubicación, responsable, observaciones.
- Imagen del activo (con fallback).
- Acciones: editar y eliminar desde la ficha de detalle.
- Breadcrumb de navegación.

### 4.4 Formulario de Activo — Crear y Editar (`/assets/new`, `/assets/:id/edit`)
- **Estado:** ✅ Completado
- Formulario completo con todos los campos del modelo `Asset`.
- Modo dual: creación de nuevo activo o edición de uno existente (detecta `id` en la URL).
- Dropdowns dinámicos para Categoría, Ubicación y Custodio (cargados desde el store).
- Validaciones de campos requeridos.
- Al guardar: genera un `id` único (`act-{timestamp}`) y registra actividad en el dashboard.

### 4.5 Reportes (`/reports`)
- **Estado:** ✅ Completado (vista estática)
- Listado de reportes disponibles con tipo (PDF / Excel), tamaño y fecha.
- Botones de descarga (actualmente sin funcionalidad real, solo UI).
- Sección de generación de reportes con controles de configuración (pendiente integración real).

### 4.6 Configuración / Ajustes (`/settings`)
- **Estado:** ✅ Completado
- Formulario de datos institucionales: razón social, NIT, dirección, teléfono.
- Preferencias del sistema: moneda (USD / BOB), idioma (Español, Quechua, Aymara), tema visual (bloqueado institucionalmente en "Claro").
- Fecha del último inventario general.
- Panel "Acerca del Sistema" con versión, licencia y tipo de servidor.
- Persistencia en memoria (Zustand), sin backend todavía.

---

## 5. Componentes Reutilizables Creados

| Componente | Descripción |
|---|---|
| `AppLogo` | Logo de la aplicación COMIBOL |
| `AssetCard` | Tarjeta visual de activo (vista grid) |
| `AssetImage` | Imagen del activo con fallback |
| `BottomNavigation` | Navegación inferior para móvil |
| `Breadcrumb` | Migas de pan para navegación contextual |
| `ConfirmDialog` | Modal de confirmación de acciones destructivas |
| `DataTable` | Tabla paginada y configurable |
| `EmptyState` | Estado vacío ilustrado |
| `Header` | Encabezado de la aplicación |
| `LoadingSpinner` | Indicador de carga |
| `PageTitle` | Título de página con subtítulo y slot de acción |
| `QRBadge` | Código QR generado para cada activo |
| `SearchBar` | Barra de búsqueda |
| `SectionCard` | Tarjeta de sección con cabecera y cuerpo |
| `Sidebar` | Barra lateral de navegación (escritorio) |
| `StatCard` | Tarjeta de estadística con ícono |
| `StatusBadge` | Insignia de estado del activo con colores |

---

## 6. Estado Global (Zustand Stores)

| Store | Responsabilidad |
|---|---|
| `assetStore` | Activos, categorías, ubicaciones, custodios. CRUD en memoria. |
| `authStore` | Datos del usuario autenticado (mock). |
| `dashboardStore` | Actividad reciente del sistema. |
| `settingsStore` | Configuración institucional del sistema. |
| `uiStore` | Estado de la UI (drawer móvil, etc.). |

---

## 7. Modelo de Datos (Interfaces TypeScript)

```typescript
Asset          — Activo fijo (código, nombre, categoría, ubicación, custodio, estado, valor, etc.)
Category       — Categoría del activo (Maquinaria Pesada, Equipos de Computación, Vehículos, Muebles)
Location       — Ubicación / sede (Huanuni, La Paz, Colquiri, Vinto)
Custodian      — Responsable / custodio del activo
User           — Usuario del sistema
ActivityLog    — Registro de actividad reciente
ReportItem     — Ítem de reporte generado
SystemSettings — Configuración institucional
DashboardStats — Estadísticas del dashboard
```

---

## 8. Datos de Prueba (Mock Data — `db.json`)

| Entidad | Cantidad de registros |
|---|---|
| Activos | 10 activos |
| Categorías | 4 categorías |
| Ubicaciones | 4 sedes |
| Custodios | 4 responsables |
| Reportes | 4 reportes |
| Actividades del log | 4 entradas |

**Activos de ejemplo cargados:**

| Código | Nombre | Estado | Valor (USD) |
|---|---|---|---|
| COM-MP-001 | Volquete Caterpillar 797F | Operativo | $850,000 |
| COM-EC-002 | Servidor Dell PowerEdge R750 | Operativo | $12,500 |
| COM-VE-003 | Camioneta Toyota Hilux 4x4 | En mantenimiento | $38,000 |
| COM-ME-004 | Escritorio Ejecutivo de Madera | Operativo | $850 |
| COM-MP-005 | Perforadora Hidráulica Sandvik DX800 | En mantenimiento | $420,000 |
| COM-EC-006 | Laptop HP ProBook 450 G9 | Operativo | $1,150 |
| COM-MP-07 | Molino de Bolas Metso Outotec | Operativo | $1,500,000 |
| COM-ME-008 | Silla Ergonómica Tumpar | En stock | $290 |
| COM-EC-009 | Central Telefónica Grandstream | De baja | $3,500 |
| COM-MP-010 | Compresora de Aire Atlas Copco XAS 185 | Operativo | $85,000 |

---

## 9. Layout y Navegación

- **Layout principal (`MainLayout`):** Sidebar fijo en escritorio + Header + BottomNavigation en móvil + Drawer deslizable para móvil.
- **Diseño responsive:** Adaptado para escritorio, tablet y móvil.
- **Rutas definidas:**

| Ruta | Página |
|---|---|
| `/` | Dashboard |
| `/assets` | Lista de activos |
| `/assets/new` | Crear activo |
| `/assets/:id` | Detalle de activo |
| `/assets/:id/edit` | Editar activo |
| `/reports` | Reportes |
| `/settings` | Configuración |
| `/*` | 404 Not Found |

---

## 10. Pendiente / Próximos Pasos

| Tarea | Prioridad |
|---|---|
| Backend (`backend-activos-fijos/`) — directorio vacío | 🔴 Alta |
| Conectar con API REST real | 🔴 Alta |
| Autenticación real con JWT (login / logout) | 🔴 Alta |
| Persistencia de datos en base de datos | 🔴 Alta |
| Módulo de usuarios y roles | 🟡 Media |
| Generación real de reportes (PDF/Excel) | 🟡 Media |
| Búsqueda por código QR (lector de cámara) | 🟡 Media |
| Módulo de depreciación de activos | 🟡 Media |
| Implementación del tema oscuro | 🟢 Baja |
| Notificaciones push del sistema | 🟢 Baja |

---

## 11. Despliegue

- **URL configurada:** `https://alxcolque.github.io/activos-fijos-comibol`
- **Comando de despliegue:** `npm run deploy` (construye y publica en rama `gh-pages`)
- **Estado actual:** Frontend listo para deploy en GitHub Pages.

---

## 12. Observaciones Finales

El proyecto se encuentra en una fase de **prototipo funcional completo del frontend**. Todas las vistas y flujos principales de usuario están implementados y son completamente navegables. La capa de datos es simulada mediante `db.json` con Axios como cliente HTTP (con fallback a importación estática).

El **backend** (`backend-activos-fijos/`) aún no ha sido iniciado — el directorio está vacío. El siguiente paso natural es la construcción del backend (probablemente con NestJS + PostgreSQL / Prisma) y la integración de autenticación real.
