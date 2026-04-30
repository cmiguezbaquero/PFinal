# Workout Planner Backend

Backend Spring Boot para gestionar:

- usuarios
- rutinas
- workouts
- sesiones de entrenamiento
- recomendaciones básicas de ejercicios

## Requisitos

- Java 21
- MariaDB en `localhost:3306`
- Base de datos `workout`

## Configuración de base de datos

El proyecto ya viene configurado para usar MariaDB con estos valores en `src/main/resources/application.properties`:

- usuario: `user`
- contraseña: `password`
- base de datos: `workout`

Si usas `docker-compose.yml`, puedes levantar la BD con:

```bash
docker compose up -d
```

## Ejecutar el backend

```bash
./mvnw spring-boot:run
```

En Windows PowerShell:

```powershell
.\mvnw.cmd spring-boot:run
```

> Nota: en este entorno la ejecución con Maven requiere que `JAVA_HOME` esté configurado correctamente.

## Endpoints disponibles

### Users
- `GET /users`
- `GET /users/{id}`
- `GET /users/email/{email}`
- `POST /users`
- `PUT /users/{id}`
- `DELETE /users/{id}`

### Routines
- `GET /routines`
- `GET /routines/{id}`
- `POST /routines`
- `PUT /routines/{id}`
- `DELETE /routines/{id}`

### Exercises
- `GET /exercises`
- `GET /exercises/{id}`
- `POST /exercises`
- `PUT /exercises/{id}`
- `DELETE /exercises/{id}`

### Workouts
- `GET /workouts`
- `GET /workouts/{id}`
- `GET /workouts/user/{userId}`
- `POST /workouts`
- `PUT /workouts/{id}`
- `DELETE /workouts/{id}`

### Workout sessions
- `GET /workout-sessions`
- `GET /workout-sessions/{id}`
- `GET /workout-sessions/workout/{workoutId}`
- `GET /workout-sessions/user/{userId}`
- `POST /workout-sessions`
- `PUT /workout-sessions/{id}`
- `DELETE /workout-sessions/{id}`

### Recommendations
- `GET /recommendations/{userId}`

## CORS Configuration

La configuración CORS ya está lista en `CorsConfig.java`. Permite que tu frontend en `localhost:3000` o `localhost:5173` se comunique con el backend.

### ¿Qué permite?
- Requests desde `http://localhost:3000` (React tradicional)
- Requests desde `http://localhost:5173` (Vite dev server)
- Métodos: GET, POST, PUT, DELETE, OPTIONS
- Headers personalizados
- Credenciales (cookies, auth headers)
- Cache de CORS por 1 hora

### Frontend - Configurar Axios

En tu proyecto React, configura la instancia de Axios así:

**`src/services/api.js`**
```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Importante para CORS con credenciales
});

export default api;
```

### Usar en servicios

**`src/services/userService.js`**
```javascript
import api from './api';

export const userService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (user) => api.post('/users', user),
  update: (id, user) => api.put(`/users/${id}`, user),
  delete: (id) => api.delete(`/users/${id}`),
};
```

**`src/services/routineService.js`**
```javascript
import api from './api';

export const routineService = {
  getAll: () => api.get('/routines'),
  getById: (id) => api.get(`/routines/${id}`),
  create: (routine) => api.post('/routines', routine),
  update: (id, routine) => api.put(`/routines/${id}`, routine),
  delete: (id) => api.delete(`/routines/${id}`),
};
```

### Usar en componentes React

```javascript
import { useEffect, useState } from 'react';
import { routineService } from '@/services/routineService';

export function Routines() {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const data = await routineService.getAll();
        setRoutines(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutines();
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {routines.map((routine) => (
        <div key={routine.id}>{routine.name}</div>
      ))}
    </div>
  );
}
```

### Custom Hook para API calls

**`src/hooks/useApi.js`**
```javascript
import { useState, useEffect } from 'react';

export function useApi(apiFunction, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const result = await apiFunction();
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, loading, error };
}
```

Uso:
```javascript
const { data: routines, loading, error } = useApi(() => routineService.getAll());
```


## Siguiente paso recomendado

Crear el frontend y luego añadir autenticación JWT para que cada usuario vea solo sus rutinas y progreso.

---

## 🚀 GUÍA COMPLETA - ESTRUCTURA DEL FRONTEND

### Paso 1: Crear proyecto React + Vite

```bash
npm create vite@latest workout-planner -- --template react
cd workout-planner
npm install
```

### Paso 2: Instalar dependencias necesarias

```bash
npm install axios react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install framer-motion recharts
npm install lucide-react
```

### Paso 3: Estructura de carpetas

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx
│   │   ├── Topbar.jsx
│   │   └── Layout.jsx
│   ├── common/
│   │   ├── StatCard.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── EmptyState.jsx
│   ├── cards/
│   │   ├── RoutineCard.jsx
│   │   ├── WorkoutCard.jsx
│   │   └── SessionCard.jsx
│   ├── forms/
│   │   ├── RoutineForm.jsx
│   │   ├── WorkoutForm.jsx
│   │   ├── SessionForm.jsx
│   │   └── ExerciseForm.jsx
│   └── charts/
│       ├── ProgressChart.jsx
│       └── MuscleGroupChart.jsx
├── pages/
│   ├── Landing.jsx
│   ├── Dashboard.jsx
│   ├── Routines.jsx
│   ├── RoutineDetail.jsx
│   ├── Workouts.jsx
│   ├── Sessions.jsx
│   ├── Progress.jsx
│   ├── Exercises.jsx
│   └── Settings.jsx
├── services/
│   ├── api.js
│   ├── userService.js
│   ├── routineService.js
│   ├── workoutService.js
│   ├── sessionService.js
│   ├── exerciseService.js
│   └── recommendationService.js
├── hooks/
│   ├── useApi.js
│   └── useWorkoutContext.js
├── context/
│   └── WorkoutContext.jsx
├── styles/
│   └── index.css
├── App.jsx
└── main.jsx
```

### Paso 4: Configurar Tailwind

**`tailwind.config.js`**
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0F172A',
          card: '#1E293B',
          border: '#334155',
        },
        primary: {
          DEFAULT: '#10B981',
          hover: '#059669',
        },
        secondary: '#06B6D4',
        accent: '#8B5CF6',
      },
    },
  },
  plugins: [],
}
```

**`src/styles/index.css`**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-dark-bg text-white font-sans;
}

.card {
  @apply bg-dark-card border border-dark-border rounded-lg p-6 shadow-lg;
}

.btn-primary {
  @apply px-4 py-2 bg-primary rounded-lg hover:bg-primary-hover transition;
}

.btn-secondary {
  @apply px-4 py-2 bg-secondary rounded-lg hover:bg-cyan-600 transition;
}
```

### Paso 5: Configurar rutas

**`src/App.jsx`**
```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import Routines from '@/pages/Routines';
import RoutineDetail from '@/pages/RoutineDetail';
import Workouts from '@/pages/Workouts';
import Sessions from '@/pages/Sessions';
import Progress from '@/pages/Progress';
import Exercises from '@/pages/Exercises';
import Settings from '@/pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/routines" element={<Routines />} />
          <Route path="/routines/:id" element={<RoutineDetail />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### Paso 6: Crear Context para estado global

**`src/context/WorkoutContext.jsx`**
```javascript
import { createContext, useState, useContext } from 'react';

const WorkoutContext = createContext();

export function WorkoutProvider({ children }) {
  const [user, setUser] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [exercises, setExercises] = useState([]);

  return (
    <WorkoutContext.Provider value={{
      user, setUser,
      routines, setRoutines,
      workouts, setWorkouts,
      sessions, setSessions,
      exercises, setExercises,
    }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkoutContext() {
  return useContext(WorkoutContext);
}
```

**`src/main.jsx`**
```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { WorkoutProvider } from './context/WorkoutContext'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WorkoutProvider>
      <App />
    </WorkoutProvider>
  </React.StrictMode>,
)
```

### Paso 7: Crear componentes base

**`src/components/common/Button.jsx`**
```javascript
export default function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) {
  const variants = {
    primary: 'bg-primary hover:bg-primary-hover',
    secondary: 'bg-secondary hover:bg-cyan-600',
    danger: 'bg-red-500 hover:bg-red-600',
    neutral: 'bg-slate-700 hover:bg-slate-600',
  };

  return (
    <button 
      className={`px-4 py-2 rounded-lg transition ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

**`src/components/common/StatCard.jsx`**
```javascript
import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, title, value, subtitle }) {
  return (
    <motion.div 
      className="card"
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">{title}</p>
          <h3 className="text-3xl font-bold mt-2">{value}</h3>
          {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
        </div>
        {Icon && <Icon className="w-12 h-12 text-primary opacity-20" />}
      </div>
    </motion.div>
  );
}
```

**`src/components/layout/Sidebar.jsx`**
```javascript
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Dumbbell, 
  Activity, 
  TrendingUp, 
  Weight, 
  Settings 
} from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Dumbbell, label: 'Rutinas', path: '/routines' },
    { icon: Activity, label: 'Workouts', path: '/workouts' },
    { icon: Activity, label: 'Sesiones', path: '/sessions' },
    { icon: TrendingUp, label: 'Progreso', path: '/progress' },
    { icon: Weight, label: 'Ejercicios', path: '/exercises' },
    { icon: Settings, label: 'Configuración', path: '/settings' },
  ];

  return (
    <aside className="w-64 bg-dark-card border-r border-dark-border h-screen overflow-y-auto p-6">
      <div className="flex items-center gap-2 mb-8">
        <Dumbbell className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold">Workout</h1>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-dark-border transition"
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

**`src/components/layout/Topbar.jsx`**
```javascript
import { User, Bell } from 'lucide-react';

export default function Topbar() {
  return (
    <header className="bg-dark-card border-b border-dark-border px-8 py-4 flex justify-between items-center">
      <div className="flex-1">
        <input
          type="text"
          placeholder="Buscar..."
          className="w-64 bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 hover:bg-dark-border rounded-lg transition">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <button className="p-2 hover:bg-dark-border rounded-lg transition">
          <User className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
```

**`src/components/layout/Layout.jsx`**
```javascript
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

### Paso 8: Página Landing

**`src/pages/Landing.jsx`**
```javascript
import { Link } from 'react-router-dom';
import { Dumbbell, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '@/components/common/Button';
import StatCard from '@/components/common/StatCard';

export default function Landing() {
  return (
    <div className="bg-dark-bg min-h-screen">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 border-b border-dark-border">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold">Workout Planner</span>
        </div>
        <Link to="/dashboard">
          <Button>Empezar</Button>
        </Link>
      </nav>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-8 py-20">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl font-bold mb-4">
            Planifica, Registra y <span className="text-primary">Domina</span> tu Progreso
          </h1>
          <p className="text-xl text-slate-400 mb-8">
            La app de fitness que entiende tu entrenamiento
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/dashboard">
              <Button className="flex items-center gap-2 text-lg">
                Empezar Ahora <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mt-20">
          <StatCard icon={Dumbbell} title="Rutinas" value="0" subtitle="Creadas" />
          <StatCard icon={Dumbbell} title="Sesiones" value="0" subtitle="Completadas" />
          <StatCard icon={Dumbbell} title="Progreso" value="---" subtitle="En construcción" />
        </div>
      </div>
    </div>
  );
}
```

### Paso 9: Ejecutar

```bash
npm run dev
```

Abre `http://localhost:5173`

---

## 📋 Resumen de archivos creados

✅ CorsConfig.java - Ya corregido
✅ Estructura React + Vite
✅ Tailwind CSS configurado
✅ Componentes base listos
✅ Context API para estado global
✅ Routing con React Router
✅ Landing page bonita
✅ Integración con backend lista

