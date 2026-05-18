# Endpoints principales

Base URL:
http://localhost:8080/api

Auth:
- POST /auth/register
- POST /auth/login

Users:
- GET /users/{id}
- PUT /users/{id}
- PUT /users/{id}/goals

Exercises:
- GET /exercises
- POST /exercises
- PUT /exercises/{id}
- DELETE /exercises/{id}
- GET /exercises/available/{userId}

Routines:
- GET /routines
- GET /routines/{id}
- GET /routines/user/{userId}
- POST /routines/weekly/generate

Workouts:
- GET /workouts/user/{userId}
- GET /workouts/user/{userId}/week/{weekStart}
- PUT /workouts/{id}/completion

Sessions:
- GET /workout-sessions/user/{userId}
- POST /workout-sessions
- PUT /workout-sessions/{id}

Recommendations:
- GET /recommendations/{userId}
