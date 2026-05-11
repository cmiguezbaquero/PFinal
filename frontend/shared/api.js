const BASE_URL = "http://localhost:8080/api";

// ENPOINTS

export const API = {
  auth: `${BASE_URL}/auth`,
  users: `${BASE_URL}/users`,
  exercises: `${BASE_URL}/exercises`,
  routines: `${BASE_URL}/routines`,
  workouts: `${BASE_URL}/workouts`,
  sessions: `${BASE_URL}/workout-sessions`
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

