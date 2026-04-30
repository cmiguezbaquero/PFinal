# 🏗️ ARQUITECTURA VISUAL - Workout Planner

## 📐 DIAGRAMA DE FLUJO: Registro → Login → Objetivos → Rutina → Progreso

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FLUJO USUARIO PRINCIPAL                          │
└─────────────────────────────────────────────────────────────────────────┘

1️⃣ REGISTRO & LOGIN
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  FRONTEND: /users/users.html                                        │
│  ├─ Form: email, password, name                                     │
│  └─ Botones: [Register] [Login]                                     │
│                    │              │                                 │
│                    ▼              ▼                                 │
│  POST /api/auth/register  POST /api/auth/login                     │
│                    │              │                                 │
│                    └──┬───────────┘                                 │
│                       ▼                                              │
│  BACKEND: AuthController                                            │
│  ├─ @PostMapping("/register")                                      │
│  │  └─→ UserService.register(User)                                 │
│  │      ├─ Valida email/password                                   │
│  │      ├─ Hash password PBKDF2                                    │
│  │      └─ Guarda en BD + devuelve AuthUserResponse                │
│  │                                                                  │
│  └─ @PostMapping("/login")                                         │
│     └─→ UserService.login(email, password)                         │
│         ├─ Busca User por email                                    │
│         ├─ Valida password con PBKDF2                              │
│         └─ Devuelve AuthUserResponse (sin password)                │
│                    │                                                │
│                    ▼                                                │
│  FRONTEND: Guardamos User en localStorage                          │
│  ├─ setCurrentUser({id, name, email, hasGoals, ...})              │
│  └─ Redirigimos a /goals/goals.html                                │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

2️⃣ CONFIGURAR OBJETIVOS
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  FRONTEND: /goals/goals.html                                        │
│  ├─ Form: goalType (gain_muscle/lose_weight), level (beginner/...) │
│  │         trainingDaysPerWeek (1-7)                               │
│  └─ Botón: [Save & Generate Routine]                               │
│                    │                                                 │
│                    ▼                                                 │
│  PUT /api/users/{id}/goals                                         │
│  {                                                                   │
│    "goalType": "gain_muscle",                                      │
│    "level": "intermediate",                                        │
│    "trainingDaysPerWeek": 4                                        │
│  }                                                                   │
│                    │                                                 │
│                    ▼                                                 │
│  BACKEND: UserController.updateGoals(id, UserGoalsRequest)        │
│  └─→ UserService.updateGoals(id, req)                             │
│      ├─ Valida campos requeridos                                   │
│      ├─ Actualiza User.goalType, level, trainingDaysPerWeek       │
│      ├─ Set hasGoals = true                                        │
│      └─ Guarda y devuelve User actualizado                         │
│                    │                                                 │
│                    ▼                                                 │
│  FRONTEND: Actualiza localStorage + Genera rutina                  │
│  POST /api/routines/weekly/generate                                │
│  {                                                                   │
│    "userId": 1,                                                    │
│    "weekStart": "2024-04-22"                                       │
│  }                                                                   │
│                    │                                                 │
│                    ▼                                                 │
│  BACKEND: RoutineController.generateWeeklyPlan(request)           │
│  └─→ RoutineService.generateWeeklyPlan(userId, weekStart)         │
│      ├─ Carga User (validar hasGoals, level, trainingDaysPerWeek) │
│      ├─ Carga Ejercicios disponibles (global o del usuario)        │
│      ├─ Crea Routine con autoGenerated=true                        │
│      ├─ Genera N workouts según trainingDaysPerWeek                │
│      │  ├─ buildDayOffsets() distribuye días en la semana         │
│      │  └─ Cada workout obtiene 3 ejercicios recomendados         │
│      ├─ Cada WorkoutExercise:                                      │
│      │  ├─ Sets/Reps según goalType (gain_muscle=4x10, loss=3x15) │
│      │  └─ Weight según level (beginner=0, inter=20, adv=40)      │
│      └─ Guarda Routine completa (cascade)                          │
│                    │                                                 │
│                    ▼                                                 │
│  FRONTEND: Redirige a /home/home.html                              │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

3️⃣ VER RUTINA & PROGRESO
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  FRONTEND: /home/home.html (Dashboard)                              │
│  ├─ loadDashboard()                                                 │
│  │  ├─ GET /api/routines/user/{id}  → Ver planes activos          │
│  │  ├─ GET /api/workouts/user/{id}/week/{weekStart}               │
│  │  └─ GET /api/sessions/compliance/user/{id}/week/{weekStart}    │
│  │                                                                   │
│  ├─ Muestra:                                                        │
│  │  ├─ Active Plans: N                                              │
│  │  ├─ Weekly Workouts: N                                           │
│  │  └─ Compliance: 3/4 completados (75%)                           │
│  │                                                                   │
│  └─ Botón: [View Full Routine] → /workouts/workouts.html          │
│                                                                      │
│  FRONTEND: /workouts/workouts.html                                  │
│  ├─ loadWorkouts()                                                  │
│  └─ GET /api/workouts/user/{id}/week/{weekStart}                  │
│     Muestra tabla:                                                  │
│     ┌──────────┬────────┬──────────┬──────────────┐                │
│     │ Día      │ Sesión │ Ejerc.  │ Completado   │                │
│     ├──────────┼────────┼──────────┼──────────────┤                │
│     │ Lunes    │ Sess-1 │ 3 ejer. │ [✓] Marcar  │                │
│     │ Miérc.   │ Sess-2 │ 3 ejer. │ [  ] Marcar │                │
│     │ Viernes  │ Sess-3 │ 3 ejer. │ [✓] Marcar  │                │
│     └──────────┴────────┴──────────┴──────────────┘                │
│                    │                                                 │
│     Al hacer click [✓]:                                            │
│     PUT /api/workouts/{id}/mark-completed                         │
│     Body: { "completed": true }                                    │
│                    │                                                 │
│                    ▼                                                 │
│     BACKEND: WorkoutService.markCompleted(id, true)              │
│     ├─ Actualiza Workout.completed = true                         │
│     ├─ Set completedAt = LocalDate.now()                          │
│     └─ Guarda en BD                                                │
│                    │                                                 │
│                    ▼                                                 │
│     FRONTEND: Actualiza UI (marca como completado)                │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

```

---

## 📦 MODELO DE DATOS (JPA Entities)

```
┌─────────────────┐
│     USER        │
├─────────────────┤
│ id (PK)         │
│ name            │ ← Usuario registrado
│ email (UNIQUE)  │
│ password        │ ← Hasheado PBKDF2
│ hasGoals        │ ← ¿Configuró sus objetivos?
│ goalType        │ ← "gain_muscle" | "lose_weight"
│ level           │ ← "beginner" | "intermediate" | "advanced"
│ trainingDaysPerWeek │ ← 1-7
│ workouts (1→N)  │ ← Lista de workouts
└─────────────────┘
        │
        │ 1
        └────────────────┐
                         │ N
        ┌────────────────┴─────────────────────────┐
        │                                          │
┌──────────────────────┐        ┌──────────────────────────┐
│     ROUTINE          │        │      WORKOUT             │
├──────────────────────┤        ├──────────────────────────┤
│ id (PK)              │        │ id (PK)                  │
│ name                 │◄───────│ routine_id (FK)          │
│ description          │   1:N  │ user_id (FK)             │
│ weekStart            │        │ description              │
│ autoGenerated        │        │ plannedDate              │
│ user_id (FK)         │        │ completed                │
│ workouts (1→N)       │        │ completedAt              │
└──────────────────────┘        │ exercises (1→N)          │
                                └──────────────────────────┘
                                        │
                                        │ 1
                                        └──────────────────┐
                                                          │ N
                                    ┌─────────────────────┴──────────┐
                                    │                                │
                        ┌───────────────────────┐  ┌─────────────────────┐
                        │  WORKOUTEXERCISE      │  │    EXERCISE         │
                        ├───────────────────────┤  ├─────────────────────┤
                        │ id (PK)               │  │ id (PK)             │
                        │ workout_id (FK)       │  │ name                │
                        │ exercise_id (FK)      │──│ muscleGroup         │
                        │ sets                  │  │ description         │
                        │ reps                  │  │ ownerId (nullable)  │
                        │ weight                │  │ shared (bool)       │
                        └───────────────────────┘  └─────────────────────┘
                                    │
                                    │ 1
                                    └──────────────────┐
                                                      │ 1:N
                                      ┌───────────────────────────────┐
                                      │   WORKOUTSESSION              │
                                      ├───────────────────────────────┤
                                      │ id (PK)                       │
                                      │ workout_id (FK)               │
                                      │ date                          │
                                      │ notes                         │
                                      └───────────────────────────────┘

```

---

## 🔌 ENDPOINTS CRÍTICOS

| Método | Endpoint | Request | Response | Propósito |
|--------|----------|---------|----------|-----------|
| POST | `/api/auth/register` | `{name, email, password}` | `{id, name, email, hasGoals, goalType, ...}` | Crear usuario |
| POST | `/api/auth/login` | `{email, password}` | `{id, name, email, hasGoals, ...}` | Login |
| PUT | `/api/users/{id}/goals` | `{goalType, level, trainingDaysPerWeek}` | `User` | Guardar objetivos |
| POST | `/api/routines/weekly/generate` | `{userId, weekStart}` | `Routine` | Generar rutina |
| GET | `/api/routines/user/{userId}` | - | `[Routine]` | Ver planes |
| GET | `/api/workouts/user/{id}/week/{weekStart}` | - | `[Workout]` | Ver workouts semana |
| PUT | `/api/workouts/{id}` | `{completed, ...}` | `Workout` | Actualizar workout |
| GET | `/api/sessions/compliance/user/{id}/week/{weekStart}` | - | `{planned, completed, percentage}` | Compliance semana |

---

## 🛡️ SEGURIDAD (Fase A)

- ✅ **Auth**: Email + Password
- ✅ **Hash**: PBKDF2 (65536 iteraciones, SHA256)
- ✅ **Comparison**: Timing-safe (XOR de bytes)
- ✅ **Response**: No devuelve password (JsonProperty.Access.WRITE_ONLY)
- ⏳ **Next (Fase B)**: JWT tokens + refresh tokens

---

## 📊 VALIDACIONES IMPLEMENTADAS

| Campo | Validación | Dónde |
|-------|-----------|-------|
| Email | No vacío, único en BD | `UserService.validateEmail()` |
| Password | Min 6 chars | `UserService.validatePassword()` |
| goalType | No vacío, requerido | `UserService.updateGoals()` |
| level | No vacío, requerido | `UserService.updateGoals()` |
| trainingDaysPerWeek | 1-7 | `UserService.updateGoals()` |
| Ejercicio.name | No vacío | `ExerciseService.validateExercise()` |
| Ejercicio.muscleGroup | No vacío | `ExerciseService.validateExercise()` |
| WorkoutExercise.sets | > 0 | `WorkoutService.validateWorkoutExercise()` |
| WorkoutExercise.reps | > 0 | `WorkoutService.validateWorkoutExercise()` |
| WorkoutExercise.weight | >= 0 | `WorkoutService.validateWorkoutExercise()` |

---

## 🎯 DECISIONES DE DISEÑO

1. **Solo User para goals** (no Goal entity en flujo principal)
   - Razón: Evitar duplicación de fuente de verdad
   - Goal.java existe pero no se usa en controllers

2. **Exercises globales + privados**
   - Global: `ownerId = null && shared = true`
   - Privado: `ownerId = userId && shared = false/true`

3. **Routine = Contenedor semanal**
   - 1 Routine = 1 semana
   - N Workouts por Routine (según días entrenamiento)
   - autoGenerated = true para rutinas del sistema

4. **Workout = Sesión diaria**
   - Tiene fecha plannedDate
   - Tiene flag completed + completedAt
   - N WorkoutExercises

5. **WorkoutSession != Workout**
   - WorkoutSession = histórico/notas
   - Workout = plan + estado de cumplimiento

---

## ✅ CHECKLIST DE CONSISTENCIA

- [x] AuthUserResponse devuelve: id, name, email, hasGoals, goalType, level, trainingDaysPerWeek
- [x] User.java tiene getters/setters públicos
- [x] Validaciones en UserService, ExerciseService, WorkoutService
- [x] Passwords hasheados PBKDF2 + timing-safe comparison
- [x] buildDayOffsets() maneja 1-7 días correctamente
- [x] WorkoutSessionService.getWeeklyCompliance() implementado
- [ ] Tests en AuthControllerTest + RoutineServiceTest (en progreso)
- [ ] Documentación de endpoints en README


