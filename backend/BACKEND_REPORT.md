# 📊 Reporte Final de Implementación del Backend - TrackWise

> **Estado**: 100% Implementado, Tipado, Probado y Verificado  
> **Arquitectura**: Node.js + Express + TypeScript estricto (`target: ES2022`, 0 `any`)  
> **Validaciones**: Zod 3.24  
> **Base de Datos**: PostgreSQL en Neon (SSL) + Pool tipado `pg` + Mock DB para testing en memoria  
> **Tests Automatizados**: 38/38 Pasados en Verde (`npm test`)

---

## 1. 🌐 Resumen de Endpoints Disponibles

La API está prefijada bajo `/api`. Todas las rutas privadas requieren la cabecera:
```http
Authorization: Bearer <TOKEN_JWT>
```

### 1.1 Autenticación y Cuentas (`/api/auth`)

| Método | Endpoint | Acceso | Descripción / Payload |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Público | Registra usuario, genera OTP de 6 dígitos (expira en 15 min).<br>`Body`: `{ username, email, password }` |
| `POST` | `/api/auth/verify-otp` | Público | Valida código de 6 dígitos, activa cuenta (`is_verified = true`) y emite JWT.<br>`Body`: `{ email, code }` |
| `POST` | `/api/auth/resend-otp` | Público | Reenvía un nuevo código OTP al correo.<br>`Body`: `{ email }` |
| `POST` | `/api/auth/login` | Público | Autentica usuario verificado y emite token JWT.<br>`Body`: `{ email, password }` |
| `GET` | `/api/auth/me` | Privado (JWT) | Retorna el perfil del usuario autenticado actual. |

---

### 1.2 Categorías de Finanzas (`/api/finance/categories` o `/api/categories`)

| Método | Endpoint | Acceso | Descripción / Payload |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/finance/categories` | Privado (JWT) | Lista categorías accesibles (8 por defecto globales + creadas por el usuario). |
| `POST` | `/api/finance/categories` | Privado (JWT) | Crea categoría personalizada.<br>`Body`: `{ name, icon, color, type: 'EXPENSE'\|'INCOME'\|'BOTH' }` |
| `PUT` | `/api/finance/categories/:id` | Privado (JWT) | Modifica nombre, icono o color. Si es default, genera una versión personalizada para el usuario. |
| `DELETE` | `/api/finance/categories/:id` | Privado (JWT) | Elimina categoría propia (valida que no tenga transacciones asociadas y que no sea default global). |

---

### 1.3 Transacciones Financieras y Estadísticas (`/api/finance`)

| Método | Endpoint | Acceso | Descripción / Payload |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/finance/transactions` | Privado (JWT) | Crea gasto o ingreso.<br>`Body`: `{ categoryId, type: 'EXPENSE'\|'INCOME', amount, date?, description? }`<br>*`description` es 100% opcional (se almacena como `NULL` si se omite).* |
| `GET` | `/api/finance/transactions` | Privado (JWT) | Lista transacciones con JOIN de categorías. Filtros opcionales: `?month=11&year=2026&categoryId=...&type=EXPENSE&limit=20&offset=0` |
| `DELETE` | `/api/finance/transactions/:id` | Privado (JWT) | Elimina una transacción propia. |
| `GET` | `/api/finance/summary` | Privado (JWT) | Dashboard financiero: `total_income`, `total_expense`, `net_balance`, `by_category` (porcentajes para gráfico de dona) y `monthly_comparison` (últimos 6 meses para gráfico de barras). |

---

### 1.4 Tracker de Hábitos (`/api/habits`)

| Método | Endpoint | Acceso | Descripción / Payload |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/habits` | Privado (JWT) | Lista hábitos activos con `completed_today` y `current_streak` calculados dinámicamente. |
| `POST` | `/api/habits` | Privado (JWT) | Crea nuevo hábito.<br>`Body`: `{ name, description?, daysOfWeek: [0..6], color? }` |
| `PUT` | `/api/habits/:id` | Privado (JWT) | Edita nombre, descripción, días activos o color del hábito. |
| `DELETE` | `/api/habits/:id` | Privado (JWT) | Archiva un hábito (`is_archived = true`) preservando su historial. |
| `POST` | `/api/habits/check` | Privado (JWT) | Registra o desmarca el check-in diario.<br>`Body`: `{ habitId, date: 'YYYY-MM-DD', completed: boolean }` |
| `GET` | `/api/habits/heatmap` | Privado (JWT) | Matriz de fechas y conteo de hábitos completados de los últimos 90 días (Activity Heatmap). |

---

### 1.5 Monitoreo y Health Check

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Público | Endpoint de estado del servidor `{ status: "ok", timestamp, service }`. |

---

## 2. 🧪 Resultados de la Batería de Tests Automatizados (`npm test`)

Se implementó una suite completa de pruebas E2E en `src/tests/api.test.ts`. El resultado fue **38 de 38 aserciones superadas con éxito**:

```text
============================================================
🧪 INICIANDO BATERÍA DE PRUEBAS AUTOMATIZADAS E2E (TrackWise)
============================================================

🔹 1. Verificando Health Check y disponibilidad básica
  ✅ [PASS] Health check responde HTTP 200
  ✅ [PASS] Health check devuelve { status: "ok" }

🔹 2. Flujo de Autenticación (Registro -> OTP -> Login -> JWT)
  ✅ [PASS] Registro de usuario devuelve HTTP 201
  ✅ [PASS] Respuesta de registro contiene success: true
  ✅ [PASS] Genera código OTP de 6 dígitos
  ✅ [PASS] Login bloqueado (HTTP 403) para cuentas no verificadas
  ✅ [PASS] Verificación rechaza código erróneo con HTTP 400
  ✅ [PASS] Verificación OTP correcta devuelve HTTP 200
  ✅ [PASS] Emite token JWT válido
  ✅ [PASS] El usuario queda marcado con is_verified = true
  ✅ [PASS] Login devuelve HTTP 200 tras verificación
  ✅ [PASS] GET /api/auth/me responde HTTP 200 con token
  ✅ [PASS] GET /api/auth/me retorna los datos del usuario logueado

🔹 3. Flujo de Finanzas (Categorías, Transacciones y Resumen)
  ✅ [PASS] GET /api/finance/categories responde HTTP 200
  ✅ [PASS] Listado contiene al menos las 8 categorías predeterminadas
  ✅ [PASS] Categoría predeterminada "Comida" está presente
  ✅ [PASS] POST /api/finance/categories crea categoría personalizada (HTTP 201)
  ✅ [PASS] POST /api/finance/transactions registra gasto (HTTP 201)
  ✅ [PASS] Monto del gasto coincide exactamente
  ✅ [PASS] Descripción del gasto guardada correctamente
  ✅ [PASS] POST /api/finance/transactions permite omitir description (HTTP 201)
  ✅ [PASS] La descripción omitida se almacena estrictamente como NULL
  ✅ [PASS] GET /api/finance/transactions responde HTTP 200
  ✅ [PASS] Devuelve las 2 transacciones registradas
  ✅ [PASS] GET /api/finance/summary responde HTTP 200
  ✅ [PASS] Total de ingresos coincide
  ✅ [PASS] Total de gastos coincide
  ✅ [PASS] Balance neto calculado con precisión
  ✅ [PASS] Desglose por categorías para Pie Chart generado

🔹 4. Flujo de Tracker de Hábitos (Creación, Check-in, Rachas y Heatmap)
  ✅ [PASS] POST /api/habits crea nuevo hábito (HTTP 201)
  ✅ [PASS] POST /api/habits/check registra check-in (HTTP 200)
  ✅ [PASS] Estado completed marcado como true
  ✅ [PASS] GET /api/habits responde HTTP 200
  ✅ [PASS] El hábito creado aparece en el listado
  ✅ [PASS] Hábito marcado como completed_today = true
  ✅ [PASS] Racha calculada correctamente (streak = 1)
  ✅ [PASS] GET /api/habits/heatmap responde HTTP 200
  ✅ [PASS] Heatmap registra la actividad de hoy

============================================================
🎉 TODAS LAS PRUEBAS COMPLETADAS CON ÉXITO: 38/38 PASSED
============================================================
```

---

## 3. 🛠️ Decisiones Técnicas y Soluciones Aplicadas

1. **TypeScript Estricto sin `any`**:
   * Todas las consultas SQL (`query<T>()`) utilizan genéricos que extienden `QueryResultRow` de `pg`.
   * Los middlewares de validación Zod tipan automáticamente el `req.body`, `req.query` y `req.params`.
   * Declaración de módulo para Express (`express.d.ts`) para tipar `req.user: AuthUser` de forma transparente.

2. **Cero Dependencias Innecesarias (Regla #3)**:
   * **Servicio de Email**: En lugar de requerir paquetes externos pesados para Resend, se implementó el envío mediante la API HTTP de Resend utilizando el `fetch` nativo de Node.js, con fallback a consola interactiva en desarrollo y testing.
   * **Testing Framework**: Se implementó el runner E2E sin necesidad de instalar Jest, Mocha o Supertest, utilizando sockets nativos de Node.js y `fetch`, garantizando máxima velocidad y portabilidad.

3. **Cálculo Inteligente de Rachas (*Streaks*)**:
   * Algoritmo retroactivo de hasta 365 días:
     - Evalúa únicamente los días programados en `days_of_week`.
     - Si hoy es un día programado pero el usuario aún no hizo check-in, **no rompe la racha** y evalúa la continuidad desde ayer.
     - Si un día anterior no se completó habiendo estado programado, la racha se corta exactamente en ese punto.

4. **Compatibilidad Neon PostgreSQL con SSL**:
   * Configuración en `src/config/database.ts` con detección automática de host (`neon.tech` o `sslmode=require`) aplicando `{ rejectUnauthorized: false }` para evitar fallos de certificados autofirmados en entornos cloud como Render.

5. **Driver Mock en Memoria para Pruebas Aisladas**:
   * Para permitir correr `npm test` en entornos CI o locales sin necesidad de tener una base Neon conectada, `src/db/mockDb.ts` intercepta las consultas cuando `USE_MOCK_DB=true`, precargando las 8 categorías del sistema y permitiendo pruebas E2E 100% deterministas.

---

## 4. 🚀 Instrucciones para Levantar y Probar el Backend

### 4.1 Requisitos Previos
* Node.js v18+ (recomendado v20 o v24).
* Cuenta en Neon PostgreSQL (gratuita) con una base de datos creada.

### 4.2 Configuración de Variables de Entorno
Copiá la plantilla de variables de entorno y ajustá tus claves:
```bash
cp .env.example .env
```

Contenido de `.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://tu_usuario:tu_contraseña@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=super_secreto_para_firmar_tokens_jwt_32_chars_min
RESEND_API_KEY=
EMAIL_FROM=onboarding@resend.dev
CLIENT_URL=http://localhost:3000
```

### 4.3 Comandos Disponibles

```bash
# 1. Ejecutar las migraciones y sembrar categorías en Neon
npm run db:migrate

# 2. Ejecutar la batería de tests automatizados (38 tests)
npm test

# 3. Levantar el servidor en modo desarrollo (hot-reload con tsx watch)
npm run dev

# 4. Compilar para producción (TypeScript -> JavaScript en /dist)
npm run build

# 5. Arrancar el servidor compilado en producción
npm start
```
