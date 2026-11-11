# 🚀 TrackWise - Life OS & Personal Control Center

> Monorepo que combina el **Seguimiento de Hábitos Diarios** y el **Control Financiero Personal** sin fricción.  
> Basado estrictamente en [**`MVP_SPECIFICATION.md`**](file:///c:/Users/mateo/OneDrive/Escritorio/TrackWise/MVP_SPECIFICATION.md).

---

## 🏗️ Arquitectura del Monorepo

```text
TrackWise/
├── MVP_SPECIFICATION.md       # Especificación técnica y funcional aprobada
├── README.md                  # Este documento (guía global de inicio rápido)
│
├── backend/                   # API REST en Node.js + Express + TypeScript estricto
│   ├── BACKEND_REPORT.md      # Reporte técnico detallado de la API y resultados de 38/38 tests
│   ├── src/                   # Controladores, servicios, modelos, rutas y schemas Zod
│   └── package.json           # Scripts: npm run dev, npm test, npm run db:migrate, npm run build
│
└── frontend/                  # Cliente Web en Next.js 14+ (App Router) + Tailwind CSS
    ├── FRONTEND_REPORT.md     # Reporte técnico detallado del cliente y build de producción
    ├── src/                   # App Router ((auth) y (dashboard)), componentes, hooks y contexto
    └── package.json           # Scripts: npm run dev, npm run build, npm start
```

---

## ⚡ Guía de Inicio Rápido

### 1. Iniciar el Backend

1. Entrar al directorio del backend e instalar dependencias:
   ```bash
   cd backend
   npm install
   ```

2. Configurar variables de entorno (`backend/.env`):
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL=postgresql://usuario:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require
   JWT_SECRET=super_secreto_para_firmar_tokens_jwt_32_chars_min
   CLIENT_URL=http://localhost:3000
   ```

3. Ejecutar las migraciones en Neon y sembrar categorías por defecto:
   ```bash
   npm run db:migrate
   ```

4. Correr la batería de pruebas automatizadas:
   ```bash
   npm test
   ```

5. Levantar el servidor en desarrollo:
   ```bash
   npm run dev
   ```
   *La API estará escuchando en `http://localhost:5000/api`.*

---

### 2. Iniciar el Frontend

1. Entrar al directorio del frontend e instalar dependencias:
   ```bash
   cd frontend
   npm install
   ```

2. Variables de entorno (`frontend/.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. Levantar la aplicación en modo desarrollo:
   ```bash
   npm run dev
   ```
   *La aplicación estará disponible en `http://localhost:3000`.*

4. Compilar para producción:
   ```bash
   npm run build
   ```

---

## 📄 Documentación y Reportes de Implementación

* [**Reporte del Backend (`backend/BACKEND_REPORT.md`)**](file:///c:/Users/mateo/OneDrive/Escritorio/TrackWise/backend/BACKEND_REPORT.md): Detalle de todos los endpoints, flujo de autenticación OTP, lógica de rachas y resultados de testing.
* [**Reporte del Frontend (`frontend/FRONTEND_REPORT.md`)**](file:///c:/Users/mateo/OneDrive/Escritorio/TrackWise/frontend/FRONTEND_REPORT.md): Catálogo de vistas, diseño mobile-first, componentes interactivos y optimizaciones de build.
