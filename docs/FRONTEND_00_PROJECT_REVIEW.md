# Revisión General y Arquitectura del Proyecto Frontend
**Documento:** FRONTEND_00_PROJECT_REVIEW.md  
**Versión:** 1.0.0  
**Proyecto:** Client Frontend Activos Fijos COMIBOL  
**Stack Frontend:** React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + HeroUI + Zustand 5  
**Fecha:** Agosto 2026  

---

# 1. Visión General

El cliente web **activos-fijos-comibol** es una Aplicación de Página Única (SPA) de alto rendimiento desarrollada para la **Corporación Minera de Bolivia (COMIBOL)**. Su objetivo es proporcionar una interfaz moderna, limpia e intuitiva para la administración integral del patrimonio de activos fijos, proyectos mineros, ubicaciones jerárquicas, asignación de custodios, mantenimientos y reportes contables.

---

# 2. Stack Tecnológico Estándar

| Capa / Herramienta | Tecnología | Versión | Propósito |
| :--- | :--- | :--- | :--- |
| **Framework UI** | React | 19.0 | Librería principal de construcción de componentes declarativos |
| **Build Tool & Dev Server** | Vite | 8.1 | Empaquetador ultra rápido con Hot Module Replacement (HMR) |
| **Lenguaje** | TypeScript | 5.5+ | Tipado estático estricto de componentes, servicios y DTOs |
| **Estilos & Diseño** | Tailwind CSS + HeroUI | v4.0 | Sistema de diseño responsivo con la paleta oficial de COMIBOL |
| **Gestión de Estado** | Zustand | 5.0 | Estado global reactivo, desacoplado y ligero |
| **Cliente HTTP** | Axios / Fetch API | Estándar | Interceptor centralizado con Bearer Auth JWT y manejo de 401 |
| **Iconografía & Animaciones** | React Icons + Framer Motion | v12 | Micro-interacciones UI y elementos visuales |

---

# 3. Estructura Limpia de Carpetas (`src/`)

```text
src/
├── api/                   # Cliente HTTP centralizado (axios.instance.ts, interceptors)
├── assets/                # Logotipos de COMIBOL, imágenes estáticas y SVGs
├── components/            # Componentes reutilizables UI (Buttons, Modals, Badges, Tables, Cards)
├── data/                  # Constantes estáticas e inicializadores
├── interfaces/            # Definición estricta de interfaces TypeScript (DTOs de API Backend)
│   ├── auth.interface.ts
│   ├── asset.interface.ts
│   ├── project.interface.ts
│   ├── location.interface.ts
│   ├── assignment.interface.ts
│   ├── maintenance.interface.ts
│   ├── report.interface.ts
│   └── setting.interface.ts
├── layouts/               # Plantillas de diseño (MainLayout, AuthLayout, Header, Sidebar)
├── pages/                 # Vistas principales declarativas alineadas al router
├── routes/                # Configuración de React Router y Guardias de Seguridad (ProtectedRoute)
├── services/              # Capa de integración HTTP con los endpoints del Backend
│   ├── auth.service.ts
│   ├── asset.service.ts
│   ├── project.service.ts
│   ├── asset-project.service.ts
│   ├── location.service.ts
│   ├── import.service.ts
│   └── report.service.ts
├── store/                 # Zustand Stores (authStore, projectStore, locationStore, etc.)
└── utils/                 # Utilidades generales (formatters, dateUtils, currencyUtils)
```

---

# 4. Estrategia de Conexión e Integración con la API Backend

La aplicación frontend interactúa con la API RESTful desplegada en el Backend mediante la URL base global configurada en `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### Principios de Integración Limpia:
1. **Cliente HTTP Interceptado:** Un archivo `src/api/axios.instance.ts` inyecta automáticamente la cabecera `Authorization: Bearer <TOKEN>` extraída de `authStore`.
2. **Desacoplamiento de Componentes:** Los componentes visuales consumen directamente servicios o stores Zustand y no construyen peticiones `fetch`/`axios` ad-hoc.
3. **Manejo Centralizado de Errores:** Errores `401 Unauthorized` redirigen automáticamente a la pantalla de Login limpiando el token expirado.
4. **Respuestas Estandarizadas:** Formato esperado de respuesta backend:
```json
{
  "success": true,
  "message": "Mensaje descriptivo",
  "data": { ... },
  "pagination": { ... }
}
```

---

# 5. Criterios de Aceptación Arquitectónica

- [ ] Estructura limpia de código sin referencias hardcodeadas a mocks en la versión final.
- [ ] Tipado estricto al 100% en TypeScript (`noImplicitAny: true`).
- [ ] Interfaz responsiva probada en resoluciones Desktop y Móvil.
- [ ] Compatibilidad total con los endpoints REST del backend Node.js + Fastify.
