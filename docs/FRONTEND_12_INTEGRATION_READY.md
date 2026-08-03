# Guía de Preparación para Integración con API Frontend
**Documento:** FRONTEND_12_INTEGRATION_READY.md  
**Versión:** 1.0.0  
**Proyecto:** Client Frontend Activos Fijos COMIBOL  
**Módulo:** Transición de Datos Mock JSON a Servicios API REST Backend  
**Fecha:** Agosto 2026  

---

# 1. Objetivo

Establecer los lineamientos técnicos para la sustitución de los adaptadores de datos temporales (Mock JSON) en el cliente frontend `activos-fijos-comibol`, conectando todos los componentes visuales a la API RESTful del backend en producción Node.js + Fastify + Prisma + MySQL.

---

# 2. Lista de Verificación de Integración de Servicios

| Módulo Frontend | Servicio Frontend | Endpoint Backend Principal | Estado Integración |
| :--- | :--- | :--- | :--- |
| **Autenticación** | `auth.service.ts` | `POST /api/v1/auth/login` | Pruebas de integración |
| **Dashboard** | `dashboard.service.ts` | `GET /api/v1/dashboard` | Pruebas de integración |
| **Categorías** | `category.service.ts` | `GET /api/v1/categories` | Pruebas de integración |
| **Estados** | `status.service.ts` | `GET /api/v1/statuses` | Pruebas de integración |
| **Ubicaciones** | `location.service.ts` | `GET /api/v1/locations/tree` | Pruebas de integración |
| **Proyectos** | `project.service.ts` | `GET /api/v1/projects` | Pruebas de integración |
| **Activos Fijos** | `asset.service.ts` | `GET /api/v1/assets` | Pruebas de integración |
| **Asignación Proyectos** | `asset-project.service.ts` | `POST /api/v1/asset-projects/assign` | Pruebas de integración |
| **Asignación Custodios** | `assignment.service.ts` | `POST /api/v1/assignments/assign` | Pruebas de integración |
| **Documentos** | `document.service.ts` | `POST /api/v1/documents` | Pruebas de integración |
| **Mantenimientos** | `maintenance.service.ts` | `GET /api/v1/maintenances` | Pruebas de integración |
| **Inventarios** | `inventory.service.ts` | `GET /api/v1/inventories` | Pruebas de integración |
| **Importación Excel** | `import.service.ts` | `POST /api/v1/import/excel` | Pruebas de integración |
| **Reportes** | `report.service.ts` | `GET /api/v1/reports/*` | Pruebas de integración |
| **Configuración** | `setting.service.ts` | `GET /api/v1/settings` | Pruebas de integración |

---

# 3. Flujo de Activación

1. Configurar la variable de entorno `.env` en el cliente frontend:
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```
2. Reemplazar los retornos síncronos de `src/data/mockData.ts` en las stores de Zustand por llamadas asíncronas a `services/*.service.ts`.
3. Verificar la inyección del token JWT en `axios.instance.ts`.
4. Ejecutar pruebas end-to-end de flujo de usuario (Login $\rightarrow$ Crear Activo $\rightarrow$ Asignar Custodio $\rightarrow$ Cargar Mantenimiento $\rightarrow$ Generar Reporte).
