# AquaChile - Sistema de Evaluación Psicolaboral

Sistema Full Stack para la gestión de evaluaciones psicolaborales de AquaChile.

## Stack Tecnológico

- **Frontend**: React 19 + Vite + Tailwind CSS 4 + Lucide React
- **Backend**: Node.js + Express + PostgreSQL
- **Base de Datos**: PostgreSQL 15 (Docker)
- **Contenedorización**: Docker Compose

## Estructura del Proyecto

```
AquaChile_FSTK/
├── docker-compose.yml          # Configuración de PostgreSQL
├── package.json                # Dependencias del frontend
├── server/
│   ├── package.json            # Dependencias del backend
│   ├── src/
│   │   ├── index.js            # Servidor Express
│   │   └── schema.sql          # Esquema de base de datos
│   └── uploads/                # Carpeta para CVs subidos
└── src/
    ├── pages/
    │   └── dashboard.jsx       # Vista del dashboard con KPIs
    ├── data.js                 # Datos mock (para desarrollo)
    ├── App.jsx                 # Componente principal
    └── main.jsx                # Punto de entrada
```

## Requisitos Previos

- Node.js 18+
- Docker y Docker Compose
- Git

## Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd AquaChile_FSTK
```

### 2. Levantar la base de datos con Docker

```bash
docker compose up -d
```

Esto creará un contenedor PostgreSQL con:
- **Usuario**: aquachile_user
- **Contraseña**: aquachile_password
- **Base de datos**: aquachile_psicolaboral
- **Puerto**: 5432

El esquema SQL se ejecuta automáticamente al iniciar el contenedor.

### 3. Instalar dependencias del Frontend

```bash
npm install
```

### 4. Instalar dependencias del Backend

```bash
cd server && npm install && cd ..
```

### 5. Iniciar el servidor Backend

```bash
cd server && npm run dev
```

El servidor se ejecutará en `http://localhost:3000`

### 6. Iniciar el Frontend

En una nueva terminal:

```bash
npm run dev
```

El frontend se ejecutará en `http://localhost:5173`

## Endpoints de la API

### Dashboard
- `GET /api/dashboard/stats` - Estadísticas para el dashboard

### Candidatos
- `GET /api/candidatos` - Listar todos los candidatos
- `POST /api/candidatos` - Crear nuevo candidato (con archivo CV opcional)

### Solicitudes
- `GET /api/solicitudes` - Listar todas las solicitudes
- `POST /api/solicitudes` - Crear nueva solicitud
- `PUT /api/solicitudes/:id` - Actualizar estado de solicitud

### Usuarios
- `GET /api/usuarios` - Listar usuarios
- `POST /api/usuarios` - Crear usuario

### Health Check
- `GET /api/health` - Verificar estado del servidor

## Estados de Solicitudes

Los estados válidos para las solicitudes son:
- `Pendiente` - Solicitud creada, pendiente de asignación
- `En Proceso` - Evaluación en curso
- `Completado` - Evaluación finalizada
- `Finalizada` - Proceso completamente cerrado

## Subida de Archivos

Los CVs se suben a la carpeta `server/uploads/` y son accesibles vía `http://localhost:3000/uploads/<filename>`.

## Desarrollo

### Frontend
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run lint         # Linting con Oxlint
```

### Backend
```bash
cd server
npm run dev          # Servidor con watch mode
npm run start        # Servidor en producción
```

## Variables de Entorno

El backend usa las siguientes variables (configuradas en `server/src/index.js`):

```javascript
const pool = new Pool({
  user: 'aquachile_user',
  host: 'localhost',
  database: 'aquachile_psicolaboral',
  password: 'aquachile_password',
  port: 5432,
});
```

## Scripts Útiles

```bash
# Ver logs de la base de datos
docker compose logs -f postgres-db

# Detener la base de datos
docker compose down

# Detener y eliminar volúmenes (¡borra los datos!)
docker compose down -v

# Reiniciar la base de datos
docker compose restart postgres-db
```

## Flujo de Trabajo Git

La rama principal de desarrollo es `feature/dashboard-backend-docker`.

```bash
# Cambiar a la rama
git checkout feature/dashboard-backend-docker

# Ver cambios
git status

# Commit y push
git add .
git commit -m "feat: descripción del cambio"
git push origin feature/dashboard-backend-docker
```

## Licencia

Proyecto interno de AquaChile - 2026