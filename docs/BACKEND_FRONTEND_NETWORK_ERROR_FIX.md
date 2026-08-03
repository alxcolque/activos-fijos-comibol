# BACKEND_FRONTEND_NETWORK_ERROR_FIX.md

**Documento:** BACKEND_FRONTEND_NETWORK_ERROR_FIX.md

**Versión:** 1.0.0

**Objetivo:** Solucionar definitivamente el error **"Network Error"** al iniciar sesión entre el frontend (React + Vite) y el backend (Fastify).

---

# Problema

Actualmente:

```
Frontend

http://localhost:5173
```

Backend

```
http://localhost:3000
```

Al intentar iniciar sesión Axios devuelve:

```
Network Error
```

Este error normalmente ocurre porque el navegador nunca recibe respuesta del backend.

No es un error del Login.

Es un error de comunicación.

---

# Objetivo

Antigravity deberá revisar completamente la comunicación entre Frontend y Backend hasta conseguir que el Login funcione correctamente.

No debe asumir que el problema es únicamente CORS.

Debe revisar toda la cadena de conexión.

---

# Checklist Obligatorio

## 1. Backend

Verificar que Fastify realmente esté escuchando.

Debe aparecer algo similar a:

```
Server listening at:

http://0.0.0.0:3000
```

No debe escuchar únicamente:

```
127.0.0.1
```

Si ocurre eso, configurar:

```ts
host: "0.0.0.0"
```

---

## 2. Endpoint Login

Verificar que exista.

```
POST

/api/v1/auth/login
```

Debe responder correctamente.

Probar desde:

Swagger

o

Postman

Body

```json
{
    "email":"admin@comibol.gob.bo",
    "password":"123456"
}
```

Si falla aquí,

NO revisar Frontend.

Corregir primero Backend.

---

## 3. Health

Verificar

```
GET

/api/v1/health
```

Debe responder

```json
{
    "success": true
}
```

Abrir en navegador.

```
http://localhost:3000/api/v1/health
```

---

## 4. CORS

Revisar configuración.

Debe permitir

```
http://localhost:5173
```

Ejemplo

```ts
origin: [
    "http://localhost:5173"
]
```

Permitir

```
GET

POST

PUT

DELETE

PATCH
```

Headers

```
Authorization

Content-Type
```

---

## 5. Axios

Buscar la instancia Axios.

Debe existir un único archivo.

Ejemplo

```
src/lib/axios.ts
```

Debe utilizar

```ts
baseURL:

http://localhost:3000/api/v1
```

No utilizar

```
https

127.0.0.1

puertos incorrectos

variables inexistentes
```

---

## 6. Variables Frontend

Verificar

```
.env
```

Debe contener

```env
VITE_API_URL=http://localhost:3000/api/v1
```

La instancia Axios deberá leer únicamente esa variable.

Ejemplo

```ts
import.meta.env.VITE_API_URL
```

Nunca escribir URLs repetidas dentro del proyecto.

---

## 7. Login

El Login debe consumir

```
POST

/auth/login
```

No

```
/login

/login/

api/login
```

Debe quedar

```
http://localhost:3000/api/v1/auth/login
```

---

## 8. Request

El Login debe enviar

```json
{
    "email":"admin@comibol.gob.bo",
    "password":"123456"
}
```

No enviar otros campos.

---

## 9. Response

Debe aceptar

```json
{
    "success": true,
    "message":"Inicio de sesión exitoso.",
    "data":{
        "accessToken":"",
        "refreshToken":"",
        "user":{}
    }
}
```

Si la estructura cambió,

adaptar el Frontend.

---

## 10. Network

Abrir

```
F12

Network
```

Verificar

La petición realmente sale.

Si aparece

```
Failed to fetch
```

↓

Problema Backend.

---

Si aparece

```
CORS
```

↓

Problema CORS.

---

Si aparece

```
404
```

↓

Ruta incorrecta.

---

Si aparece

```
401
```

↓

Problema Login.

---

Si aparece

```
500
```

↓

Error Backend.

---

## 11. Proxy

Verificar

```
vite.config.ts
```

Si existe Proxy,

debe funcionar correctamente.

Si no se utiliza,

eliminar completamente la configuración Proxy.

Utilizar únicamente Axios.

---

## 12. Console

No deben existir errores como

```
ERR_CONNECTION_REFUSED

ERR_NETWORK

CORS

Failed to fetch

Network Error
```

---

## 13. Auth Store

Revisar Zustand.

Después del Login debe guardar

```
accessToken

refreshToken

user
```

No guardar la contraseña.

---

## 14. Interceptor

Verificar que Axios tenga:

Request Interceptor

↓

Agregar

```
Authorization

Bearer TOKEN
```

solo cuando exista token.

No agregarlo en Login.

---

## 15. Errores

Eliminar

```
Network Error
```

y mostrar el mensaje real proveniente del backend.

Ejemplo

```ts
Credenciales incorrectas.

Usuario inactivo.

Servidor no disponible.
```

Nunca mostrar únicamente

```
Network Error
```

---

## 16. Login Flow

El flujo correcto deberá ser

```
Usuario

↓

Formulario

↓

Validación Zod

↓

Axios

↓

Backend

↓

JWT

↓

Guardar Tokens

↓

Guardar Usuario

↓

Redireccionar Dashboard
```

---

## 17. Debug

Agregar temporalmente logs.

Axios

```
Request URL

Request Body

Status

Response
```

Backend

```
Ruta recibida

Body

Usuario encontrado

Contraseña válida

JWT generado
```

Eliminar estos logs una vez solucionado.

---

## 18. Resultado Esperado

Al finalizar:

✅ Backend responde correctamente.

✅ Axios utiliza la URL correcta.

✅ CORS funciona.

✅ Login funciona.

✅ Se reciben Access Token y Refresh Token.

✅ Zustand guarda la sesión.

✅ Se redirecciona automáticamente al Dashboard.

✅ No aparece ningún "Network Error".

El objetivo es dejar completamente funcional la autenticación entre el frontend (5173) y el backend (3000), identificando y corrigiendo la causa raíz del problema, no aplicando soluciones temporales.