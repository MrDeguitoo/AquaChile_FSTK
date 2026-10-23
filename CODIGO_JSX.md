# Código Fuente JSX - Proyecto AquaChile FSTK

Este documento recopila el código fuente de todos los archivos `.jsx` del proyecto, organizados por módulos y capas de la aplicación.

---

## Índice de Archivos

1. [src/main.jsx](#1-srcmainjsx)
2. [src/App.jsx](#2-srcappjsx)
3. [src/context/AuthContext.jsx](#3-srccontextauthcontextjsx)
4. [src/components/ProtectedRoute.jsx](#4-srccomponentsprotectedroutejsx)
5. [src/layouts/AppLayout.jsx](#5-srclayoutsapplayoutjsx)
6. [src/components/Navbar.jsx](#6-srccomponentsnavbarjsx)
7. [src/components/Sidebar.jsx](#7-srccomponentssidebarjsx)
8. [src/pages/login.jsx](#8-srcpagesloginjsx)
9. [src/pages/Dashboard.jsx](#9-srcpagesdashboardjsx)
10. [src/pages/CandidatosPage.jsx](#10-srcpagescandidatospagejsx)
11. [src/pages/SolicitudesPage.jsx](#11-srcpagessolicitudespagejsx)

---

## 1. `src/main.jsx`

**Ruta:** `src/main.jsx`  
**Descripción:** Punto de entrada de la aplicación React con ReactDOM y StrictMode.

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

---

## 2. `src/App.jsx`

**Ruta:** `src/App.jsx`  
**Descripción:** Configuración de rutas (React Router), proveedor de autenticación y estructura de navegación protegida.

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';

import LoginPage from './pages/login';
import DashboardPage from './pages/dashboard';
import CandidatosPage from './pages/CandidatosPage';
import SolicitudesPage from './pages/SolicitudesPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/candidatos" element={<CandidatosPage />} />
              <Route path="/solicitudes" element={<SolicitudesPage />} />
            </Route>
          </Route>

          <Route path="*" element={<h2 className="p-6 text-red-600 font-bold">404 - Página no encontrada</h2>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

---

## 3. `src/context/AuthContext.jsx`

**Ruta:** `src/context/AuthContext.jsx`  
**Descripción:** Contexto y Hook personalizado (`useAuth`) para el manejo del estado global de sesión y persistencia en LocalStorage.

```jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('aquachile_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('aquachile_session', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aquachile_session');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

---

## 4. `src/components/ProtectedRoute.jsx`

**Ruta:** `src/components/ProtectedRoute.jsx`  
**Descripción:** Componente guardián para restringir el acceso a rutas protegidas si el usuario no ha iniciado sesión.

```jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
```

---

## 5. `src/layouts/AppLayout.jsx`

**Ruta:** `src/layouts/AppLayout.jsx`  
**Descripción:** Diseño principal del panel (Navbar superior, Sidebar lateral responsivo y contenedor del Outlet).

```jsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Menu, X } from 'lucide-react';

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <div className="md:hidden bg-white border-b px-4 py-2 flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-700">Menú de Navegación</span>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-[240px_1fr]">
        <Sidebar mobileOpen={mobileMenuOpen} closeMobile={() => setMobileMenuOpen(false)} />

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

---

## 6. `src/components/Navbar.jsx`

**Ruta:** `src/components/Navbar.jsx`  
**Descripción:** Barra superior de navegación con identidad de AquaChile, información del usuario activo y botón de cierre de sesión.

```jsx
import { User, LogOut } from "lucide-react";

export default function Navbar() {
    return (
        <header className = "bg-blue-900 text-white px-6 py-3.5 flex justify-between items-center shadow-md">
            {/* Branding AquaChile */}
            <div className = "flex items-center space-x-3">
                <span className = "font-bold text-xl tracking-wide">AquaChile</span>
                <span className = "text-xs bg-blue-800 text-blue-200 px-2.5 py-1 rounded-full font-medium">Psicolaboral</span>
            </div>
            {/* Usuario Activo y Perfil */}
            <div className = "flex items-center space-x-4">
                <div className = "flex items-center space-x-2 text-sm">
                    <div className = "p-1.5 bg-blue-800 rounded-full">
                        <User className = "w-4 h-4 text-blue-200" />
                    </div>
                    <div>
                        <p className = "font-semibold leading-tight">Analista de Reclutamiento</p>
                        <p className = "text-xs text-blue-200 leading-tight">analista@aquachile.cl</p>
                    </div>
                </div>
                <button className = "p-2 hover:bg-blue-800 rounded-lg text-blue-200 hover:text-white transition-colors" title="Cerrar Sesión">
                    <LogOut className = "w-4 h-4" />
                </button>
            </div>
        </header>
    )
}
```

---

## 7. `src/components/Sidebar.jsx`

**Ruta:** `src/components/Sidebar.jsx`  
**Descripción:** Menú lateral de navegación con enlaces a Dashboard, Candidatos y Solicitudes utilizando NavLink con estilos activos.

```jsx
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardList } from 'lucide-react';

export default function Sidebar({ mobileOpen, closeMobile }) {
  const linkClass = ({ isActive }) =>
    `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-50 text-blue-700 font-semibold'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <aside
      className={`bg-white border-r border-gray-200 p-4 ${
        mobileOpen ? 'block' : 'hidden'
      } md:block`}
    >
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">
        Navegación Principal
      </p>

      <nav className="space-y-1">
        <NavLink to="/" onClick={closeMobile} className={linkClass}>
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/candidatos" onClick={closeMobile} className={linkClass}>
          <Users className="w-4 h-4" />
          <span>Candidatos</span>
        </NavLink>

        <NavLink to="/solicitudes" onClick={closeMobile} className={linkClass}>
          <ClipboardList className="w-4 h-4" />
          <span>Solicitudes</span>
        </NavLink>
      </nav>
    </aside>
  );
}
```

---

## 8. `src/pages/login.jsx`

**Ruta:** `src/pages/login.jsx`  
**Descripción:** Formulario de autenticación con selección de rol (Analista de Reclutamiento o Profesional Evaluador).

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [role, setRole] = useState('analista');
  const [email, setEmail] = useState('analista@aquachile.cl');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    login({
      email,
      role,
      name: role === 'analista' ? 'Analista de Reclutamiento' : 'Psicólogo Evaluador',
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-900">AquaChile</h1>
          <p className="text-sm text-gray-500">Evaluaciones Psicolaborales</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Perfil de Acceso</label>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setEmail(e.target.value === 'analista' ? 'analista@aquachile.cl' : 'psicologo@aquachile.cl');
              }}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="analista">Analista de Reclutamiento</option>
              <option value="evaluador">Profesional Evaluador (Psicólogo/a)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors flex items-center justify-center space-x-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Ingresar al Sistema</span>
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

## 9. `src/pages/Dashboard.jsx`

**Ruta:** `src/pages/Dashboard.jsx`  
**Descripción:** Vista principal del dashboard con métricas del proceso psicolaboral.

```jsx
export default function DashboardPage() {
    return (
        <div>
            <h1 className = "text-2xl font-bold text-gray-800 mb-2">Dashboard</h1>
            <p className = "text-gray-600">Panel principal de métricas del proceso psicolaboral de AquaChile.</p>
        </div>
    );
}
```

---

## 10. `src/pages/CandidatosPage.jsx`

**Ruta:** `src/pages/CandidatosPage.jsx`  
**Descripción:** Vista del módulo de gestión de candidatos del proceso de selección.

```jsx
export default function CandidatosPage() {
    return (
        <div>
            <h1 className = "text-2xl font-bold text-gray-800 mb-2">Candidatos</h1>
            <p className = "text-gray-600">Panel de gestión de candidatos del proceso psicolaboral de AquaChile.</p>
        </div>
    );
}
```

---

## 11. `src/pages/SolicitudesPage.jsx`

**Ruta:** `src/pages/SolicitudesPage.jsx`  
**Descripción:** Vista del módulo de solicitudes del proceso psicolaboral.

```jsx
export default function SolicitudesPage() {
    return (
        <div className = "text-2xl font-bold text-gray-800 mb-2">
            <h1>Solicitudes</h1>
            <p className = "text-gray-600">Panel de solicitudes del proceso psicolaboral de AquaChile.</p>
        </div>
    );
}
```
