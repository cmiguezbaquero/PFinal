# Workout Planner

Aplicación full stack para crear rutinas, registrar workouts y seguir el progreso de entrenamiento.

## Qué incluye

- Registro e inicio de sesión
- Objetivos del usuario
- Generación automática de rutinas semanales
- Workouts con ejercicios, series, repeticiones y peso
- Sesiones para registrar progreso
- Recomendaciones básicas de ejercicios

## Estructura

- `src/main/java`: backend Spring Boot
- `src/main/resources`: configuración y datos
- `frontend`: interfaz web en HTML, CSS y JavaScript
- `README/`: documentación breve

## Tecnologías

- Java 21
- Spring Boot
- Spring Data JPA
- MariaDB
- HTML, CSS y JavaScript

## Cómo ejecutar

1. Levanta MariaDB.
2. Arranca el backend:

```zsh
./mvnw spring-boot:run
```

3. Abre `frontend/index.html` con un servidor local.

## Endpoints principales

- `POST /api/auth/register`
- `POST /api/auth/login`
- `PUT /api/users/{id}/goals`
- `POST /api/routines/weekly/generate`
- `GET /api/workouts/user/{userId}/week/{weekStart}`
- `PUT /api/workouts/{id}/completion`
- `GET /api/recommendations/{userId}`

## Flujo general

1. El usuario se registra o inicia sesión.
2. Guarda sus objetivos y nivel.
3. El backend genera la rutina.
4. El usuario completa workouts y sesiones.
5. La app muestra progreso y recomendaciones.

## Nota

La generación de rutinas evita repetir ejercicios dentro del mismo día.
