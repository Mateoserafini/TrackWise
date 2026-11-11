# 📋 Especificación Técnica y Funcional del MVP
## Tracker de Hábitos & Gestor de Finanzas Personales

> **Estado del Documento**: Aprobado para Desarrollo  
> **Versión**: 1.0.0 (MVP)  
> **Arquitectura**: Monorepo (`/frontend` en Vercel, `/backend` en Render, DB PostgreSQL en Neon)  
> **Enfoque de Diseño**: *Mobile-First*, responsivo (Web en iOS Safari, Android Chrome y Escritorio).

---

## 📑 Tabla de Contenidos
1. [Visión General del Producto](#1-visión-general-del-producto)
2. [Arquitectura e Infraestructura](#2-arquitectura-e-infraestructura)
3. [Matriz de Nullabilidad y Diccionario de Datos](#3-matriz-de-nullabilidad-y-diccionario-de-datos)
4. [Módulos Funcionales en Detalle](#4-módulos-funcionales-en-detalle)
   - 4.1 [Autenticación y Verificación de Cuenta](#41-autenticación-y-verificación-de-cuenta)
   - 4.2 [Módulo de Finanzas (Ingresos, Egresos y Categorías)](#42-módulo-de-finanzas-ingresos-egresos-y-categorías)
   - 4.3 [Módulo de Tracker de Hábitos](#43-módulo-de-tracker-de-hábitos)
   - 4.4 [Dashboard Principal (Vista Unificada)](#44-dashboard-principal-vista-unificada)
5. [Modelo de Base de Datos SQL (PostgreSQL en Neon)](#5-modelo-de-base-de-datos-sql-postgresql-en-neon)
6. [Validaciones con Zod (Esquemas Backend y Frontend)](#6-validaciones-con-zod-esquemas-backend-y-frontend)
7. [Diseño de la API RESTful](#7-diseño-de-la-api-restful)
8. [Estructura del Proyecto (Monorepo)](#8-estructura-del-proyecto-monorepo)
9. [Guía de Despliegue y Variables de Entorno](#9-guía-de-despliegue-y-variables-de-entorno)

---

## 1. Visión General del Producto

La aplicación es un **Centro de Control Personal (Life OS)** que combina dos hábitos clave para el bienestar diario:
1. **Control Financiero**: Registro ágil de ingresos y gastos con categorización flexible, iconos personalizables y analíticas visuales (gráficos de torta y barras).
2. **Hábitos Diarios**: Seguimiento de hábitos programables por días de la semana con visualización de consistencia mediante mapa de calor (*heatmap* estilo GitHub) y cálculo de rachas.

### Principios Clave:
- **Independencia Total de Datos**: Los registros financieros y los hábitos son autónomos. No se fuerza ninguna vinculación entre un gasto y un hábito.
- **Flexibilidad y Agilidad en la Carga**: Menos fricción al registrar. Campos secundarios (como el detalle específico de un gasto o la descripción de un hábito) son **100% opcionales (NULL)**.
- **Mobile-First Real**: Navegable con una sola mano en smartphones (iOS y Android) y adaptado a monitores de escritorio.

---

## 2. Arquitectura e Infraestructura

```mermaid
flowchart LR
    subgraph Cliente ["Cliente Web (Mobile & Desktop)"]
        A[Next.js 14+ / React / Tailwind] -->|Fetch / Axios| B(API REST)
    end

    subgraph Vercel ["Hosting Frontend"]
        A
    end

    subgraph Render ["Hosting Backend"]
        B[Node.js + Express + TypeScript]
        Z[Zod Validation]
        J[JWT Auth & Middleware]
        B --> Z
        B --> J
    end

    subgraph Neon ["Base de Datos Cloud"]
        D[(PostgreSQL SQL)]
    end

    subgraph EmailService ["Servicio de Correo"]
        E[Resend / Nodemailer OTP]
    end

    B -->|SQL Driver / Drizzle / Prisma| D
    B -->|Envío de Códigos OTP| E
```

- **Frontend**: Next.js (App Router), React, Tailwind CSS, Lucide Icons (selector de más de 50+ iconos categorizados), Recharts (gráficos de barra, torta/dona y heatmap SVG).
- **Backend**: Node.js + Express con TypeScript, validación de DTOs y payloads con **Zod**, manejo de tokens criptográficos con **JSON Web Tokens (JWT)** y contraseñas con **bcrypt**.
- **Base de Datos**: PostgreSQL alojado en **Neon** (servidor SQL serverless de alto rendimiento).
- **Verificación de Email**: Código OTP numérico de 6 dígitos con expiración de 15 minutos (soporte para Resend/Nodemailer y modo de consola para desarrollo).

---

## 3. Matriz de Nullabilidad y Diccionario de Datos

Esta sección define estrictamente qué campos son obligatorios (**NOT NULL**) y cuáles son opcionales (**NULLABLE**), garantizando que el usuario pueda registrar información en 3 segundos sin bloqueos innecesarios.

### 3.1 Transacciones Financieras (`transactions`)

| Campo | Tipo SQL | Nullabilidad | Descripción / Justificación |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **NOT NULL** | Identificador único de la transacción. |
| `user_id` | `UUID` | **NOT NULL** | Llave foránea del usuario dueño del registro. |
| `category_id` | `UUID` | **NOT NULL** | Llave foránea de la categoría asignada. |
| `type` | `VARCHAR(10)` | **NOT NULL** | Tipo: `'EXPENSE'` (gasto) o `'INCOME'` (ingreso). |
| `amount` | `NUMERIC(12,2)` | **NOT NULL** | Monto monetario (mayor a 0). |
| `date` | `DATE` | **NOT NULL** | Fecha del movimiento (por defecto: fecha actual). |
| `description` | `VARCHAR(255)` | **NULLABLE (Opcional)** | **No obligatorio**. Ejemplo: el usuario selecciona "Comida" y no desea aclarar si fue en verdulería o restaurante. Puede dejarse vacío. |
| `created_at` | `TIMESTAMP` | **NOT NULL** | Fecha/hora del guardado en el sistema. |
| `updated_at` | `TIMESTAMP` | **NOT NULL** | Fecha/hora de última modificación. |

### 3.2 Categorías de Finanzas (`categories`)

| Campo | Tipo SQL | Nullabilidad | Descripción / Justificación |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **NOT NULL** | Identificador único. |
| `user_id` | `UUID` | **NULLABLE** | `NULL` para categorías del sistema globales por defecto, o `UUID` si fue creada/personalizada por el usuario. |
| `name` | `VARCHAR(50)` | **NOT NULL** | Nombre de la categoría (ej. "Comida", "Transporte"). |
| `icon` | `VARCHAR(50)` | **NOT NULL** | Identificador del icono de Lucide (ej. `'Utensils'`, `'Bus'`, `'Home'`). |
| `color` | `VARCHAR(20)` | **NOT NULL** | Código hexadecimal o clase HSL (ej. `'#EF4444'`, `'#10B981'`). |
| `type` | `VARCHAR(10)` | **NOT NULL** | `'EXPENSE'`, `'INCOME'` o `'BOTH'`. |
| `is_default` | `BOOLEAN` | **NOT NULL** | `true` si es una categoría precargada (editable por el usuario), `false` si es custom. |
| `created_at` | `TIMESTAMP` | **NOT NULL** | Timestamp de creación. |

### 3.3 Hábitos (`habits`)

| Campo | Tipo SQL | Nullabilidad | Descripción / Justificación |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **NOT NULL** | Identificador único. |
| `user_id` | `UUID` | **NOT NULL** | Llave foránea del usuario. |
| `name` | `VARCHAR(100)` | **NOT NULL** | Nombre del hábito (ej. "Tomar 2L de agua", "Leer 20 páginas"). |
| `description` | `TEXT` | **NULLABLE (Opcional)** | **No obligatorio**. Notas, objetivo detallado o contexto adicional. |
| `days_of_week` | `INT[]` | **NOT NULL** | Días activos de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado). **Por defecto: todos los días `[0,1,2,3,4,5,6]`**. |
| `color` | `VARCHAR(20)` | **NOT NULL** | Color identificador para la UI y el mapa de calor (default: verde/esmeralda). |
| `is_archived` | `BOOLEAN` | **NOT NULL** | Para pausar o archivar hábitos sin borrar el historial pasado (default: `false`). |
| `created_at` | `TIMESTAMP` | **NOT NULL** | Fecha de inicio del hábito. |

### 3.4 Registros de Cumplimiento de Hábitos (`habit_logs`)

| Campo | Tipo SQL | Nullabilidad | Descripción / Justificación |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **NOT NULL** | Identificador único del log. |
| `habit_id` | `UUID` | **NOT NULL** | Hábito correspondiente (FK). |
| `date` | `DATE` | **NOT NULL** | Fecha del check-in (`YYYY-MM-DD`). |
| `completed` | `BOOLEAN` | **NOT NULL** | `true` si se completó, `false` o ausencia de registro si no. |
| `created_at` | `TIMESTAMP` | **NOT NULL** | Timestamp exacto del check-in. |

### 3.5 Usuarios y Seguridad (`users` & `email_verifications`)

| Campo | Tipo SQL | Nullabilidad | Descripción / Justificación |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **NOT NULL** | Identificador único del usuario. |
| `username` | `VARCHAR(50)` | **NOT NULL** | Nombre de usuario o apodo visible. |
| `email` | `VARCHAR(255)` | **NOT NULL (UNIQUE)** | Correo electrónico válido. |
| `password_hash` | `VARCHAR(255)` | **NOT NULL** | Contraseña cifrada con algoritmo bcrypt. |
| `is_verified` | `BOOLEAN` | **NOT NULL** | `false` al registrarse, `true` tras validar el código OTP. |
| `otp_code` | `VARCHAR(6)` | **NULLABLE** | Código de 6 dígitos numéricos enviado por mail. |
| `otp_expires_at`| `TIMESTAMP` | **NULLABLE** | Timestamp de expiración del código OTP (ej. 15 minutos). |
| `created_at` | `TIMESTAMP` | **NOT NULL** | Fecha de registro. |

---

## 4. Módulos Funcionales en Detalle

### 4.1 Autenticación y Verificación de Cuenta
1. **Paso 1: Formulario de Registro**:
   - Campos: `username` (requerido), `email` (requerido, formato email estricto con Zod), `password` (mínimo 6 caracteres).
   - El sistema genera un código de 6 dígitos numéricos aleatorios (ej. `492817`) con tiempo de expiración de 15 minutos.
   - El usuario se guarda con `is_verified: false`.
   - Se despacha el email con el código de verificación al correo provisto.
2. **Paso 2: Pantalla de Verificación OTP**:
   - Vista centrada con 6 casillas numéricas de auto-enfoque.
   - Botón de "Reenviar código" con contador de espera de 60 segundos.
   - Al ingresar el código correcto: `is_verified` pasa a `true`, se elimina el OTP y se emite el JWT de sesión.
3. **Paso 3: Inicio de Sesión (Login)**:
   - Campos: `email` y `password`.
   - Valida que la cuenta esté verificada. Si no lo está, redirige al ingreso del código.
   - Retorna token JWT y datos de perfil.

### 4.2 Módulo de Finanzas (Ingresos, Egresos y Categorías)
- **Registro Rápido**:
  - Modal o formulario inferior accesible mediante botón flotante `+`.
  - Selector de Tipo: Gasto / Ingreso.
  - Campo Monto (teclado numérico en móvil).
  - Selector visual de Categoría (con icono y color).
  - Campo Descripción: **100% opcional (placeholder: *"Opcional: ej. Almuerzo afuera"*). Si el usuario no escribe nada, se guarda simplemente como "Comida"**.
  - Selector de fecha (por defecto: hoy).
- **Categorías Predefinidas (Seed del Sistema)**:
  - 🍔 **Comida**: Icono `Utensils`, Color Naranja `#F97316`.
  - 🚌 **Transporte**: Icono `Bus`, Color Azul `#3B82F6`.
  - 🏠 **Vivienda / Alquiler**: Icono `Home`, Color Morado `#8B5CF6`.
  - 💡 **Servicios**: Icono `Zap`, Color Amarillo `#EAB308`.
  - 🎮 **Ocio / Entretenimiento**: Icono `Gamepad2`, Color Rosa `#EC4899`.
  - 💊 **Salud**: Icono `HeartPulse`, Color Rojo `#EF4444`.
  - 💼 **Salario / Sueldo (Ingreso)**: Icono `Briefcase`, Color Verde `#10B981`.
  - ➕ **Otros**: Icono `Tag`, Color Gris `#6B7280`.
- **Personalización Total de Categorías**:
  - El usuario puede editar **cualquier** categoría (incluso las predefinidas):
    - Cambiar el icono (selector visual con más de 50 opciones: compras, autos, gimnasio, café, tecnología, etc.).
    - Cambiar el color (paleta con 16 colores predefinidos o selector HEX libre).
    - Cambiar el nombre.
  - El usuario puede crear nuevas categorías totalmente libres.

### 4.3 Módulo de Tracker de Hábitos
- **Creación de Hábito**:
  - `name`: Obligatorio (ej. "Entrenar 45 min", "Meditación", "Tomar vitaminas").
  - `description`: **Opcional (NULL)**. Puede estar vacío.
  - `days_of_week`: Selector con chips de Lunes a Domingo. Por defecto están todos seleccionados (7 días). El usuario puede desmarcar días fácilmente (ej. solo Lun-Mie-Vie o Lun a Vie).
  - `color`: Selector de color de racha.
- **Check-in Diario**:
  - Lista de hábitos filtrada automáticamente según los días correspondientes a hoy.
  - Check interactivo con respuesta háptica/animación de satisfacción al marcar.
  - Indicador de racha actual (*streak* en días consecutivos cumplidos).
- **Mapa de Calor (Activity Heatmap)**:
  - Cuadrícula estilo GitHub (últimas semanas o meses).
  - Intensidad de color según el porcentaje o cantidad de hábitos completados ese día:
    - 0 hábitos: Gris neutro.
    - 1-2 hábitos: Tono suave.
    - 3-4 hábitos: Tono medio.
    - Todos los hábitos cumplidos: Verde/Color principal intenso.
  - Al tocar o pasar el mouse sobre un día, muestra un tooltip con los hábitos logrados en esa fecha.

### 4.4 Dashboard Principal (Vista Unificada)
El Dashboard es la pantalla de bienvenida que unifica la productividad y las finanzas sin mezclar sus registros:
1. **Encabezado**: Saludo personalizado con el `username`, fecha de hoy y botón de perfil/cerrar sesión.
2. **Resumen Financiero del Mes**:
   - Tarjetas de balance: **Total Ingresos**, **Total Gastos** y **Balance Neto**.
   - **Gráfico de Torta / Dona**: Desglose porcentual de gastos por categoría (con los iconos y colores reales de cada una).
   - **Gráfico de Barras**: Comparativa semanal o mensual de ingresos vs egresos.
3. **Resumen de Hábitos del Día**:
   - Widget de "Hábitos de Hoy" con checkboxes rápidos para completar sin salir del dashboard.
   - Barra de progreso diaria (ej. "3 de 4 completados hoy - 75%").
4. **Heatmap de Hábitos**:
   - Visualizador de consistencia de los últimos 60-90 días.
5. **Navegación Inferior (Mobile Bottom Navigation Bar)**:
   - 🏠 **Inicio** (Dashboard)
   - 💰 **Finanzas** (Historial completo, filtros por fecha, gestión de categorías)
   - ⚡ **Hábitos** (Gestión de hábitos, edición de días, detalle histórico)
   - ⚙️ **Ajustes** (Moneda, perfil, exportar datos)

---

## 5. Modelo de Base de Datos SQL (PostgreSQL en Neon)

```sql
-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA DE USUARIOS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    otp_code VARCHAR(6) NULL,
    otp_expires_at TIMESTAMP NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA DE CATEGORÍAS
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(20) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('EXPENSE', 'INCOME', 'BOTH')),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA DE TRANSACCIONES (FINANZAS)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    type VARCHAR(10) NOT NULL CHECK (type IN ('EXPENSE', 'INCOME')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description VARCHAR(255) NULL, -- NULLABLE: El usuario puede omitirlo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLA DE HÁBITOS
CREATE TABLE habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL, -- NULLABLE: No obligatorio
    days_of_week INT[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}', -- 0: Domingo, 6: Sábado
    color VARCHAR(20) NOT NULL DEFAULT '#10B981',
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABLA DE LOGS DE HÁBITOS (CHECK-INS)
CREATE TABLE habit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_habit_per_day UNIQUE (habit_id, date)
);

-- ÍNDICES PARA ALTO RENDIMIENTO
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date);
CREATE INDEX idx_habit_logs_habit_date ON habit_logs(habit_id, date);
CREATE INDEX idx_categories_user ON categories(user_id);
```

---

## 6. Validaciones con Zod (Esquemas Backend y Frontend)

```typescript
import { z } from 'zod';

// ==========================================
// 1. AUTENTICACIÓN
// ==========================================
export const RegisterSchema = z.object({
  username: z.string().min(2, "El nombre de usuario debe tener al menos 2 caracteres").max(50),
  email: z.string().email("Ingresa un correo electrónico válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres")
});

export const VerifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "El código debe ser de exactamente 6 dígitos")
});

export const LoginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(1, "La contraseña es requerida")
});

// ==========================================
// 2. CATEGORÍAS
// ==========================================
export const CategorySchema = z.object({
  name: z.string().min(1, "El nombre de la categoría es requerido").max(50),
  icon: z.string().min(1, "Debes seleccionar un icono"),
  color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Color hexadecimal válido"),
  type: z.enum(['EXPENSE', 'INCOME', 'BOTH'])
});

// ==========================================
// 3. TRANSACCIONES (FINANZAS)
// ==========================================
export const TransactionSchema = z.object({
  categoryId: z.string().uuid("Categoría inválida"),
  type: z.enum(['EXPENSE', 'INCOME']),
  amount: z.number().positive("El monto debe ser un número positivo mayor a 0"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha YYYY-MM-DD").default(() => new Date().toISOString().split('T')[0]),
  // DESCRIPCIÓN ES NULLABLE / OPCIONAL:
  description: z.string().max(255).nullish().transform(val => val?.trim() || null)
});

// ==========================================
// 4. HÁBITOS
// ==========================================
export const HabitSchema = z.object({
  name: z.string().min(1, "El nombre del hábito es obligatorio").max(100),
  // DESCRIPCIÓN ES NULLABLE / OPCIONAL:
  description: z.string().nullish().transform(val => val?.trim() || null),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1, "Selecciona al menos un día").default([0, 1, 2, 3, 4, 5, 6]),
  color: z.string().default('#10B981')
});

export const HabitCheckInSchema = z.object({
  habitId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  completed: z.boolean().default(true)
});
```

---

## 7. Diseño de la API RESTful

Todas las rutas privadas requieren el header `Authorization: Bearer <TOKEN_JWT>`.

### Auth (`/api/auth`)
- `POST /api/auth/register`: Registra un usuario y envía el código OTP de 6 dígitos.
- `POST /api/auth/verify-otp`: Valida el código y activa la cuenta emitiendo el JWT.
- `POST /api/auth/resend-otp`: Genera y reenvía un nuevo código OTP.
- `POST /api/auth/login`: Autentica credenciales y emite el JWT.
- `GET  /api/auth/me`: Retorna los datos del usuario logueado.

### Finanzas (`/api/finance`)
- `GET  /api/finance/categories`: Lista las categorías del usuario (incluyendo por defecto y personalizadas).
- `POST /api/finance/categories`: Crea una nueva categoría con icono y color.
- `PUT  /api/finance/categories/:id`: Modifica una categoría existente (nombre, icono o color).
- `DELETE /api/finance/categories/:id`: Elimina una categoría personalizada.
- `GET  /api/finance/transactions`: Lista transacciones con filtros opcionales (`month`, `year`, `categoryId`, `type`).
- `POST /api/finance/transactions`: Crea un nuevo gasto o ingreso (con `description` opcional).
- `DELETE /api/finance/transactions/:id`: Elimina una transacción.
- `GET  /api/finance/summary`: Retorna totales del mes, gastos por categoría y datos para los gráficos de torta y barra.

### Hábitos (`/api/habits`)
- `GET  /api/habits`: Lista los hábitos activos del usuario.
- `POST /api/habits`: Crea un nuevo hábito (con `description` opcional y días personalizables).
- `PUT  /api/habits/:id`: Edita nombre, días o color de un hábito.
- `DELETE /api/habits/:id`: Elimina o archiva un hábito.
- `POST /api/habits/check`: Alterna el estado de completitud de un hábito en una fecha dada.
- `GET  /api/habits/heatmap`: Retorna la matriz de fechas y conteo de hábitos completados para renderizar el mapa de calor.

---

## 8. Estructura Detallada del Proyecto (Monorepo)

```text
mvps/
├── MVP_SPECIFICATION.md                       # Especificación técnica y funcional detallada
├── README.md                                  # Guía de inicio rápido y comandos del monorepo
│
├── frontend/                                  # APLICACIÓN CLIENTE (Next.js 14+ / React / Tailwind)
│   ├── .env.example                           # Plantilla de variables de entorno (NEXT_PUBLIC_API_URL)
│   ├── .gitignore                             # Ignora node_modules, .next, etc.
│   ├── next.config.js                         # Configuración de Next.js (headers, rewrites, PWA/desktop)
│   ├── package.json                           # Dependencias frontend (lucide-react, recharts, zod, tailwind)
│   ├── postcss.config.js                      # Configuración de PostCSS para Tailwind
│   ├── tailwind.config.ts                     # Configuración de colores, temas y fuentes
│   ├── tsconfig.json                          # Configuración de TypeScript y path aliases (@/*)
│   │
│   ├── public/                                # Activos estáticos públicos
│   │   ├── favicon.ico                        # Icono de la pestaña del navegador
│   │   ├── manifest.json                      # Configuración Web App / Mobile / Desktop
│   │   └── icons/                             # Iconos de la aplicación en varias resoluciones
│   │       ├── icon-192x192.png
│   │       └── icon-512x512.png
│   │
│   └── src/                                   # Código fuente del Frontend
│       ├── app/                               # App Router de Next.js
│       │   ├── globals.css                    # Estilos globales y directivas Tailwind
│       │   ├── layout.tsx                     # RootLayout (fuentes Inter, AuthProvider, ThemeProvider)
│       │   │
│       │   ├── (auth)/                        # Grupo de rutas públicas de autenticación
│       │   │   ├── layout.tsx                 # AuthLayout (centrado visual, gradiente de fondo)
│       │   │   ├── login/                     # Ruta: /login
│       │   │   │   ├── LoginPage.tsx          # Componente completo de Inicio de Sesión
│       │   │   │   └── page.tsx               # Conector Next.js: export { default } from './LoginPage'
│       │   │   ├── register/                  # Ruta: /register
│       │   │   │   ├── RegisterPage.tsx       # Componente de Registro con validación de contraseña
│       │   │   │   └── page.tsx               # Conector Next.js: export { default } from './RegisterPage'
│       │   │   └── verify/                    # Ruta: /verify
│       │   │       ├── VerifyOtpPage.tsx      # Componente de validación de código OTP de 6 dígitos
│       │   │       └── page.tsx               # Conector Next.js: export { default } from './VerifyOtpPage'
│       │   │
│       │   └── (dashboard)/                   # Grupo de rutas privadas protegidas
│       │       ├── layout.tsx                 # DashboardLayout (TopNavbar, Sidebar desktop, BottomNav móvil)
│       │       ├── overview/                  # Ruta: / o /overview (Dashboard principal unificado)
│       │       │   ├── DashboardOverviewPage.tsx  # Vista unificada (resumen financiero + hábitos de hoy)
│       │       │   └── page.tsx               # Conector Next.js: export { default } from './DashboardOverviewPage'
│       │       ├── finances/                  # Ruta: /finances
│       │       │   ├── FinancesPage.tsx       # Vista completa de gestión financiera y transacciones
│       │       │   └── page.tsx               # Conector Next.js: export { default } from './FinancesPage'
│       │       ├── habits/                    # Ruta: /habits
│       │       │   ├── HabitsPage.tsx         # Vista completa de tracker de hábitos y heatmap
│       │       │   └── page.tsx               # Conector Next.js: export { default } from './HabitsPage'
│       │       └── settings/                  # Ruta: /settings
│       │           ├── SettingsPage.tsx       # Configuración, personalización de categorías y moneda
│       │           └── page.tsx               # Conector Next.js: export { default } from './SettingsPage'
│       │
│       ├── components/                        # Componentes modulares y reutilizables
│       │   ├── ui/                            # Componentes atómicos base
│       │   │   ├── Button.tsx                 # Botón con variantes (primary, secondary, danger, ghost)
│       │   │   ├── Input.tsx                  # Input con manejo de errores y estados de focus
│       │   │   ├── Modal.tsx                  # Ventana modal accesible con backdrop desenfocado
│       │   │   ├── Card.tsx                   # Contenedor estilo tarjeta con bordes y sombra
│       │   │   ├── Badge.tsx                  # Etiqueta visual para estados o categorías
│       │   │   └── Skeleton.tsx               # Placeholder animado para estados de carga
│       │   │
│       │   ├── layout/                        # Estructura visual de navegación
│       │   │   ├── TopNavbar.tsx              # Barra superior con avatar, username y logout
│       │   │   ├── DesktopSidebar.tsx         # Menú lateral para pantallas de computadora
│       │   │   └── MobileBottomNav.tsx        # Barra de navegación fija inferior para celulares
│       │   │
│       │   ├── auth/                          # Componentes del flujo de autenticación
│       │   │   ├── AuthCard.tsx               # Contenedor estilizado de formularios auth
│       │   │   ├── OtpInputBox.tsx            # Inputs individuales con salto automático para los 6 dígitos
│       │   │   └── ResendOtpTimer.tsx         # Cuenta regresiva interactiva para reenviar código
│       │   │
│       │   ├── finances/                      # Componentes de ingresos, egresos y categorías
│       │   │   ├── TransactionModal.tsx       # Modal para crear/editar gasto o ingreso (descripción opcional)
│       │   │   ├── TransactionList.tsx        # Lista cronológica agrupada por fecha
│       │   │   ├── TransactionItem.tsx        # Fila de movimiento con icono, color y monto
│       │   │   ├── ExpensePieChart.tsx        # Gráfico interactivo de dona por categoría
│       │   │   ├── IncomeExpenseBarChart.tsx  # Gráfico de barras comparativo de ingresos vs gastos
│       │   │   ├── BalanceSummaryCard.tsx     # Tarjetas de Balance Total, Ingresos del Mes y Gastos del Mes
│       │   │   ├── CategoryBadge.tsx          # Pill con icono y color de categoría
│       │   │   └── CategoryManagerModal.tsx   # Modal para crear y editar categorías (icono y color)
│       │   │
│       │   ├── habits/                        # Componentes del tracker de hábitos
│       │   │   ├── HabitModal.tsx             # Modal para crear/editar hábito (descripción opcional)
│       │   │   ├── HabitList.tsx              # Lista de hábitos del día o globales
│       │   │   ├── HabitCheckCard.tsx         # Tarjeta interactiva de hábito con toggle de completitud
│       │   │   ├── HabitHeatmap.tsx           # Cuadrícula interactiva de consistencia (estilo GitHub)
│       │   │   ├── WeekDaysSelector.tsx       # Selector visual de días (L, M, M, J, V, S, D)
│       │   │   └── StreakBadge.tsx            # Indicador de fuego/racha de días continuos
│       │   │
│       │   └── common/                        # Selectores y utilidades visuales compartidas
│       │       ├── IconPicker.tsx             # Selector visual de iconos de Lucide (50+ iconos)
│       │       ├── ColorPicker.tsx            # Paleta de colores predefinidos y selector hexadecimal
│       │       └── ConfirmDialog.tsx          # Diálogo de confirmación antes de eliminar registros
│       │
│       ├── context/                           # Estado global de React Context
│       │   ├── AuthContext.tsx                # Sesión, usuario autenticado, login, logout, token
│       │   └── ThemeContext.tsx               # Modo oscuro / claro
│       │
│       ├── hooks/                             # Custom hooks para lógica reutilizable
│       │   ├── useAuth.ts                     # Hook para acceder al contexto de autenticación
│       │   ├── useFinances.ts                 # Hook para transacciones, balances y filtros
│       │   ├── useHabits.ts                   # Hook para hábitos, check-ins y rachas
│       │   └── useCategories.ts               # Hook para categorías predefinidas y personalizadas
│       │
│       ├── services/                          # Clientes HTTP y llamadas al backend
│       │   ├── api.ts                         # Instancia central de Axios/Fetch con interceptor JWT
│       │   ├── authService.ts                 # Endpoints de register, verify, login y getMe
│       │   ├── financeService.ts              # Endpoints de transacciones, resumen y balances
│       │   ├── habitService.ts                # Endpoints de hábitos, check-in diario y heatmap
│       │   └── categoryService.ts             # Endpoints CRUD de categorías
│       │
│       ├── types/                             # Definiciones de tipos TypeScript
│       │   ├── auth.types.ts                  # Interfaces User, LoginResponse, VerifyPayload
│       │   ├── finance.types.ts               # Interfaces Transaction, SummaryData, FilterOptions
│       │   ├── habit.types.ts                 # Interfaces Habit, HabitLog, HeatmapDay
│       │   └── category.types.ts              # Interfaces Category, CategoryCreateInput
│       │
│       └── lib/                               # Utilidades generales
│           ├── utils.ts                       # Helper cn() para Tailwind (clsx + tailwind-merge)
│           ├── formatters.ts                  # Formato de moneda ($ ARS, USD, etc.) y fechas
│           ├── constants.ts                   # Iconos predeterminados, colores base y categorías seed
│           └── validators.ts                  # Validaciones Zod del lado cliente
│
└── backend/                                   # SERVIDOR API (Node.js / Express / TypeScript en Render)
    ├── .env.example                           # Plantilla de variables de entorno (PORT, DATABASE_URL, JWT_SECRET)
    ├── .gitignore                             # Ignora node_modules, dist, .env
    ├── package.json                           # Dependencias backend (express, cors, pg, zod, jsonwebtoken, bcrypt)
    ├── tsconfig.json                          # Configuración TypeScript (target ES2022, outDir dist)
    ├── render.yaml                            # Archivo Blueprint de despliegue automático en Render
    │
    └── src/                                   # Código fuente del Servidor
        ├── index.ts                           # Punto de entrada principal (arranque del servidor HTTP)
        ├── app.ts                             # Configuración de Express, CORS, Helmet y parseo JSON
        │
        ├── config/                            # Configuraciones del entorno y servicios externos
        │   ├── env.ts                         # Validación estricta de variables de entorno con Zod
        │   └── database.ts                    # Conexión al pool de Neon PostgreSQL (`pg.Pool`)
        │
        ├── db/                                # Esquema y migraciones SQL
        │   ├── schema.sql                     # DDL de creación de tablas, índices y extensiones UUID
        │   ├── seeds.sql                      # Datos precargados (categorías por defecto del sistema)
        │   └── index.ts                       # Métodos helper para ejecutar queries SQL tipadas
        │
        ├── middlewares/                       # Interceptores de peticiones HTTP
        │   ├── auth.middleware.ts             # Valida el JWT del header y adjunta el usuario al request
        │   ├── validate.middleware.ts         # Middleware genérico para validar body/query con Zod
        │   └── error.middleware.ts            # Captura global de excepciones y formato de errores JSON
        │
        ├── routes/                            # Definición de rutas HTTP de la API
        │   ├── index.ts                       # Router principal que monta los prefijos bajo /api
        │   ├── auth.routes.ts                 # /api/auth (register, verify-otp, login, me, resend)
        │   ├── finance.routes.ts              # /api/finance (transactions, summary, stats)
        │   ├── habit.routes.ts                # /api/habits (habits, check-in, heatmap)
        │   └── category.routes.ts             # /api/categories (CRUD y edición de categorías)
        │
        ├── controllers/                       # Controladores de recepción de requests y respuestas
        │   ├── auth.controller.ts             # Lógica HTTP de registro, verificación y login
        │   ├── finance.controller.ts          # Lógica HTTP de transacciones y resumen financiero
        │   ├── habit.controller.ts            # Lógica HTTP de hábitos, check-ins y rachas
        │   └── category.controller.ts         # Lógica HTTP de administración de categorías
        │
        ├── services/                          # Lógica de negocio y acceso a base de datos
        │   ├── auth.service.ts                # Hasheo de contraseñas, generación de tokens y OTPs
        │   ├── email.service.ts               # Envío de correos OTP (Resend / Nodemailer o Console Logger)
        │   ├── finance.service.ts             # Queries SQL de transacciones y filtros
        │   ├── habit.service.ts               # Queries SQL de hábitos, logs diarios y cálculo de streaks
        │   ├── category.service.ts            # Queries SQL de categorías por defecto y de usuario
        │   └── stats.service.ts               # Agregaciones SQL para gráficos de dona, barras y heatmap
        │
        ├── schemas/                           # Esquemas de validación Zod (DTOs)
        │   ├── auth.schema.ts                 # Schemas para registro, login y código OTP
        │   ├── finance.schema.ts              # Schemas para transacciones (con descripción opcional/null)
        │   ├── habit.schema.ts                # Schemas para hábitos (con descripción opcional/null y días)
        │   └── category.schema.ts             # Schemas para categorías (nombre, icono, color)
        │
        └── types/                             # Tipos e interfaces globales del backend
            ├── express.d.ts                   # Extensión del tipo Request para incluir `req.user`
            └── models.ts                      # Interfaces de las tablas de PostgreSQL
```

---

## 9. Guía de Despliegue y Variables de Entorno

### Frontend en Vercel
- **Root Directory**: `frontend`
- **Framework Preset**: Next.js
- **Variables de Entorno**:
  ```env
  NEXT_PUBLIC_API_URL=https://tu-backend-en-render.onrender.com/api
  ```

### Backend en Render
- **Root Directory**: `backend`
- **Environment**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Variables de Entorno**:
  ```env
  PORT=5000
  NODE_ENV=production
  DATABASE_URL=postgresql://usuario:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require
  JWT_SECRET=super_secreto_para_firmar_tokens_jwt_32_chars_min
  RESEND_API_KEY=re_123456789 (o SMTP credentials para Nodemailer)
  EMAIL_FROM=onboarding@resend.dev
  CLIENT_URL=https://tu-frontend-en-vercel.app
  ```

---

*Documentación preparada y lista para iniciar el scaffolding y desarrollo del código.*
