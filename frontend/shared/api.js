const BASE_URL = "http://localhost:8080/api";

export const API = {
  auth: `${BASE_URL}/auth`,
  users: `${BASE_URL}/users`,
  exercises: `${BASE_URL}/exercises`,
  routines: `${BASE_URL}/routines`,
  workouts: `${BASE_URL}/workouts`,
  sessions: `${BASE_URL}/workout-sessions`
};

// 🔥 GOALS (backend correcto)
export function updateGoals(userId, data) {
  return fetch(`${BASE_URL}/users/${userId}/goals`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
}

// 👤 USER STORAGE
export function getCurrentUser() {
  const raw = localStorage.getItem("currentUser");
  return raw ? JSON.parse(raw) : null;
}

export function setCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

export function clearCurrentUser() {
  localStorage.removeItem("currentUser");
}
