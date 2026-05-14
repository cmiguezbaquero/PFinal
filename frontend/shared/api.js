const BASE_URL = "http://localhost:8080/api";

// ENPOINTS

export const API = {
  auth: `${BASE_URL}/auth`,
  users: `${BASE_URL}/users`,
  exercises: `${BASE_URL}/exercises`,
  routines: `${BASE_URL}/routines`,
  workouts: `${BASE_URL}/workouts`,
  sessions: `${BASE_URL}/workout-sessions`,
  recommendations: `${BASE_URL}/recommendations`
};

// GOALS

export async function updateGoals(userId, data) {
  return fetch(`${API.users}/${userId}/goals`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
}

export async function generateWeeklyRoutine(userId, weekStart) {
  return fetch(`${API.routines}/weekly/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ userId, weekStart })
  });
}

export async function getWeeklyWorkouts(userId, weekStart) {
  return fetch(`${API.workouts}/user/${userId}/week/${weekStart}`);
}

export async function toggleWorkoutCompletion(workoutId, completed = true) {
  return fetch(`${API.workouts}/${workoutId}/completion?completed=${completed}`, {
    method: "PUT"
  });
}

// Create a standalone exercise (backend contract: POST /exercises)
export async function createExercise(data) {
  return fetch(`${API.exercises}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
}

/* =========================================================
   COMPLIANCE
========================================================= */

export function getCompliance(userId, weekStart) {
  return fetch(`${API.sessions}/compliance/user/${userId}/week/${weekStart}`);
}

/* =========================================================
   RECOMMENDATIONS
========================================================= */

export function getRecommendations(userId) {
  return fetch(`${API.recommendations}/${userId}`);
}

/* =========================================================
   AVAILABLE EXERCISES
========================================================= */

export function getAvailableExercises(userId) {
  return fetch(`${API.exercises}/available/${userId}`);
}

/* =========================================================
   USERS
========================================================= */

export function updateUser(userId, data) {
  return fetch(`${API.users}/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
}

export function deleteUser(userId) {
  return fetch(`${API.users}/${userId}`, {
    method: "DELETE"
  });
}