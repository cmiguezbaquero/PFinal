import {
  API,
  updateGoals,
  getCurrentUser,
  setCurrentUser
} from "../shared/api.js";

const user = getCurrentUser();

if (!user) {
  window.location.href = "/users/users.html";
}

// 🔥 GUARDAR OBJETIVOS + GENERAR RUTINA
async function saveGoal() {
  const days = document.getElementById("days").value;
  const goalType = document.getElementById("type").value;
  const level = document.getElementById("level").value;

  if (!days || days < 1 || days > 7) {
    alert("Introduce un número válido de días (1-7)");
    return;
  }

  const res = await updateGoals(user.id, {
    goalType,
    level,
    trainingDaysPerWeek: parseInt(days)
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error backend:", errorText);
    alert("Error guardando objetivos");
    return;
  }

  const updatedUser = await res.json();
  setCurrentUser(updatedUser);

  const weekStart = getWeekStartISO();

  const routineRes = await fetch(`${API.routines}/weekly/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userId: user.id,
      weekStart
    })
  });

  if (!routineRes.ok) {
    const errorText = await routineRes.text();
    console.error("Error rutina:", errorText);
    alert("Error generando rutina");
    return;
  }

  window.location.href = "../index.html";
}

window.saveGoal = saveGoal;

function getWeekStartISO() {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = (day + 6) % 7;
  now.setDate(now.getDate() - diffToMonday);
  return now.toISOString().slice(0, 10);
}

// 🔥 EVENT LISTENER MODERNO (opcional pero recomendado)
document.getElementById("saveGoalBtn").addEventListener("click", saveGoal);