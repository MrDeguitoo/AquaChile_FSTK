# AquaChile - Sistema de Evaluación Psicolaboral

Sistema Full Stack para la gestión de evaluaciones psicolaborales de AquaChile.

## Stack Tecnológico

- **Frontend**: React 19 + Vite + Tailwind CSS 4 + Lucide React + React Router v7
- **Backend**: Node.js + Express + PostgreSQL
- **Base de Datos**: PostgreSQL 15 (Docker)
- **Contenedorización**: Docker Compose
- **Testing**: Vitest + @testing-library/react + @testing-library/jest-dom

## Estructura del Proyecto

```
AquaChile_FSTK/
├── docker-compose.yml          # Configuración de PostgreSQL
├── package.json                # Dependencias del frontend
├── docs/                       # Documentación del proyecto (PDFs)
│   ├── Especificación de Requisitos de Software (ERS).pdf
│   └── Evidencia de Vitest.pdf
├── postman/                    # Colecciones y environments Postman
│   ├── collections/
│   ├── environments/
│   └── globals/
├── server/
│   ├── package.json            # Dependencias del backend
│   ├── src/
│   │   ├── index.js            # Servidor Express (API REST)
│   │   └── schema.sql          # Esquema de base de datos
│   └── uploads/                # Carpeta para CVs subidos
└── src/
    ├── components/
    │   ├── candidatos/         # FormCandidato, TablaCandidatos
    │   ├── solicitudes/        # FormSolicitud, TablaSolicitudes
    │   ├── Navbar, Sidebar, ProtectedRoute, LoadingSpinner
    ├── context/AuthContext.jsx # Autenticación con localStorage
    ├── layouts/AppLayout.jsx   # Layout principal con Navbar + Sidebar
    ├── pages/
    │   ├── login.jsx           # Login con validación @aquachile.cl
    │   ├── DashboardPage.jsx   # Dashboard con KPIs desde API
    │   ├── CandidatosPage.jsx  # CRUD candidatos conectado a API
    │   ├── SolicitudesPage.jsx # CRUD solicitudes + cambio de estado
    │   └── NotFoundPage.jsx
    ├── data.js                 # Datos mock (legacy)
    ├── App.jsx                 # Rutas protegidas + públicas
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
- **Usuario**: postgres
- **Contraseña**: aquachile_secure_pass
- **Base de datos**: aquachile_db
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

El servidor se ejecutará en `http://localhost:5000`

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

Los CVs se suben a la carpeta `server/uploads/` y son accesibles vía `http://localhost:5000/uploads/<filename>`.

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
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'aquachile_db',
  password: process.env.DB_PASSWORD || 'aquachile_secure_pass',
  port: process.env.DB_PORT || 5432,
});
```

Para desarrollo local, crear `server/.env`:
```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=aquachile_db
DB_PASSWORD=aquachile_secure_pass
DB_PORT=5432
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

## Documentación del Proyecto

Los siguientes documentos están disponibles en la carpeta [`docs/`](docs/):

### Especificaciones y Evidencias
- **[Especificación de Requisitos de Software (ERS)](docs/Especificaci%C3%B3n%20de%20Requisitos%20de%20Software%20(ERS).pdf)** — Documento técnico con requisitos funcionales, no funcionales, alcance del sistema, correspondencia con stakeholders y matriz de trazabilidad.
- **[Evidencia de Vitest](docs/Evidencia%20de%20Vitest.pdf)** — Capturas y resultados de la suite de pruebas automatizadas (57 tests pasando) con Vitest + @testing-library/react.

### Colecciones Postman
La carpeta [`postman/`](postman/) contiene la configuración para probar la API REST:
- **Environment**: `New Collection` — Variable `baseUrl` apuntando a `http://localhost:5000`
- **Collections**: Definición de endpoints en `collections/New Collection/.resources/definition.yaml`

> **Nota**: Para importar en Postman, usar `File > Import` y seleccionar los archivos `.yaml` de la carpeta `postman/`.

## Flujo de Trabajo Git

La rama principal es `main`. Se trabaja en ramas de feature/fix.

```bash
# Ver estado actual
git status

# Cambiar a rama de desarrollo
git checkout fix/Correcciones-varias

# Commit y push
git add .
git commit -m "feat: descripción del cambio"
git push origin fix/Correcciones-varias

# Crear PR hacia main
```

## Licencia

Proyecto interno de AquaChile - 2026