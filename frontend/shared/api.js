const BASE_URL = "http://localhost:8080/api";

// ── Endpoints ────────────────────────────────────────────────
export const API = {
  auth:            `${BASE_URL}/auth`,
  users:           `${BASE_URL}/users`,
  exercises:       `${BASE_URL}/exercises`,
  routines:        `${BASE_URL}/routines`,
  workouts:        `${BASE_URL}/workouts`,
  sessions:        `${BASE_URL}/workout-sessions`,
  recommendations: `${BASE_URL}/recommendations`,
  workoutExercises:`${BASE_URL}/workout-exercises`,
};

// ── Auth / Goals ─────────────────────────────────────────────
export async function updateGoals(userId, data) {
  return fetch(`${API.users}/${userId}/goals`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

// ── Routines ─────────────────────────────────────────────────
export async function generateWeeklyRoutine(userId, weekStart) {
  return fetch(`${API.routines}/weekly/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, weekStart })
  });
}

// ── Workouts ─────────────────────────────────────────────────
export async function getWeeklyWorkouts(userId, weekStart) {
  return fetch(`${API.workouts}/user/${userId}/week/${weekStart}`);
}

export async function toggleWorkoutCompletion(workoutId, completed = true) {
  return fetch(`${API.workouts}/${workoutId}/completion?completed=${completed}`, {
    method: "PUT"
  });
}

// ── Exercises ─────────────────────────────────────────────────
export async function createExercise(data) {
  return fetch(API.exercises, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

/** GET /api/exercises/available/{userId} — exercises visible for this user */
export async function getAvailableExercises(userId) {
  return fetch(`${API.exercises}/available/${userId}`);
}

// ── Workout Exercises (CRUD dentro de un workout) ────────────
export async function getWorkoutExercises(workoutId) {
  return fetch(`${API.workoutExercises}/workout/${workoutId}`);
}

export async function addWorkoutExercise(data) {
  return fetch(API.workoutExercises, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

export async function updateWorkoutExercise(weId, data) {
  return fetch(`${API.workoutExercises}/${weId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

export async function deleteWorkoutExercise(weId) {
  return fetch(`${API.workoutExercises}/${weId}`, { method: "DELETE" });
}

// ── Workout Sessions ─────────────────────────────────────────
/** GET /api/workout-sessions/compliance/user/{userId}/week/{weekStart} */
export async function getWeeklyCompliance(userId, weekStart) {
  return fetch(`${API.sessions}/compliance/user/${userId}/week/${weekStart}`);
}

/** GET /api/workout-sessions/user/{userId} — full session history */
export async function getUserSessions(userId) {
  return fetch(`${API.sessions}/user/${userId}`);
}

export async function createSession(data) {
  return fetch(API.sessions, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

export async function updateSession(sessionId, data) {
  return fetch(`${API.sessions}/${sessionId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

export async function deleteSession(sessionId) {
  return fetch(`${API.sessions}/${sessionId}`, { method: "DELETE" });
}

// ── Recommendations ──────────────────────────────────────────
/** GET /api/recommendations/{userId} */
export async function getRecommendations(userId) {
  return fetch(`${API.recommendations}/${userId}`);
}

// ── Users ─────────────────────────────────────────────────────
export async function getUser(userId) {
  return fetch(`${API.users}/${userId}`);
}

export async function updateUser(userId, data) {
  return fetch(`${API.users}/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

export async function deleteUser(userId) {
  return fetch(`${API.users}/${userId}`, { method: "DELETE" });
}

export async function changePassword(userId, data) {
  return fetch(`${API.users}/${userId}/password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}