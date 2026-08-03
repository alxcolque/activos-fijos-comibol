# Módulo de Limpieza de Código, Pulido Visual y QA Final
**Documento:** FRONTEND_18_POLISH.md  
**Versión:** 1.0.0  
**Proyecto:** Client Frontend Activos Fijos COMIBOL  
**Módulo:** Reordenamiento Limpio, Optimización UX/UI y Verificación Final  
**Fecha:** Agosto 2026  

---

# 1. Objetivo

Especificar las tareas de **limpieza de código, refactorización desacoplada, optimización visual y aseguramiento de calidad (QA)** en la aplicación frontend de la Corporación Minera de Bolivia (COMIBOL). El objetivo es eliminar cualquier rastro de datos mock hardcodeados, garantizar cero advertencias en TypeScript/OxLint y verificar la compilación limpia para despliegue.

---

# 2. Checklist de Limpieza y Refactorización

### 2.1 Eliminación de Mocks y Limpieza de Código
- [ ] Eliminar referencias a `db.json` o servicios mock locales en la capa de datos.
- [ ] Garantizar que todos los Zustand Stores consuman exclusivamente la instancia de `api` de Axios.
- [ ] Eliminar imports y variables no utilizadas en todos los archivos `.ts` y `.tsx`.

### 2.2 Estandarización de Componentes HeroUI + Tailwind CSS v4
- [ ] Aplicar paleta cromática institucional de COMIBOL (Azul minero `#1e3a8a`, Dorado/Ámbar `#f59e0b`, Gris pizarra `#0f172a`).
- [ ] Usar componentes de `@heroui/react` para Modales, Dropdowns, Badges, Tabs y Tables.
- [ ] Incorporar micro-animaciones en transiciones de página y apertura de modales usando `framer-motion`.

### 2.3 Manejo Global de Errores y Notificaciones
- [ ] Incorporar componente de notificaciones Toast/Alertas en la esquina superior derecha para confirmar acciones exitosas (creación, edición, eliminación, asignación).
- [ ] Manejo de pantallas de error 404 (Not Found) y 500 con botón de retorno al Dashboard.
- [ ] Pantalla de Carga Global (`LoadingSpinner`) con logotipo animado de COMIBOL.

---

# 3. Verificación de Compilación y Calidad

Ejecutar los siguientes comandos en la raíz del proyecto `activos-fijos-comibol`:

```bash
# 1. Verificación de Linter
npm run lint

# 2. Verificación de Tipado TypeScript y Compilación Vite
npm run build
```

---

# 4. Criterios de Aceptación Final

- [ ] `npm run build` ejecutado exitosamente con **0 errores** de TypeScript y sintaxis.
- [ ] 100% de compatibilidad con la API REST del backend Node.js + Fastify.
- [ ] Interfaz responsiva probada en resoluciones Mobile (375px), Tablet (768px) y Desktop (1440px).
- [ ] Código fuente completamente limpio, estructurado y documentado.
