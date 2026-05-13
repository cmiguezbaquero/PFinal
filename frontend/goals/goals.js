import { generateWeeklyRoutine, updateGoals } from "../shared/api.js";
import { getCurrentUser, setCurrentUser } from "../shared/session.js";
import { getWeekStartISO } from "../shared/date.js";

const user = getCurrentUser();

if (!user) {
  window.location.href = "../users/users.html";
}

/* =========================
   SAVE GOALS
========================= */
async function saveGoal(event) {
  event?.preventDefault();

  const days = Number(document.getElementById("days").value);
  const goalType = document.getElementById("type").value;
  const level = document.getElementById("level").value;

  if (!days || days < 1 || days > 7) {
    alert("Introduce un número válido de días (1-7)");
    return;
  }

  try {
    const res = await updateGoals(user.id, {
      goalType,
      level,
      trainingDaysPerWeek: days
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error backend:", errorText);
      alert("Error guardando objetivos");
      return;
    }

    const updatedUser = await res.json();
    setCurrentUser(updatedUser);

    const routineRes = await generateWeeklyRoutine(updatedUser.id, getWeekStartISO());

    if (!routineRes.ok) {
      const errorText = await routineRes.text();
      console.error("Error rutina:", errorText);
      alert("Error generando rutina");
      return;
    }

    window.location.href = "../index.html";
  } catch (err) {
    console.error("CATCH ERROR COMPLETO:", err);
    console.error("MENSAJE:", err.message);
    alert(err.message);
  }
}

/* =========================
   INIT
========================= */

document.getElementById("goalsForm")
  .addEventListener("submit", saveGoal);
