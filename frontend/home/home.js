import { clearCurrentUser, getCurrentUser } from "../shared/session.js";
import { getWeekStartISO } from "../shared/date.js";
import { getWeeklyWorkouts, toggleWorkoutCompletion } from "../shared/api.js";

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  const user = getCurrentUser();

  if (!user) {
    window.location.href = "../index.html";
    return;
  }

  document.getElementById("welcomeText").innerText = `Welcome back, ${user.name}`;

  loadCalendar();
  await loadWorkouts(user);
});

/* =========================
   NAV
========================= */
function showSection(id) {
  document.querySelectorAll(".section").forEach(section => section.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

window.showSection = showSection;

/* =========================
   CALENDAR
========================= */
function loadCalendar() {
  const calendar = document.getElementById("calendar");
  if (!calendar) return;

  calendar.innerHTML = "";
  const start = new Date(`${getWeekStartISO()}T00:00:00`);

  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);

    const item = document.createElement("div");
    item.classList.add("day");
    item.innerText = day.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric"
    });

    calendar.appendChild(item);
  }
}

/* =========================
   WORKOUTS
========================= */
let draggedItem = null;

async function loadWorkouts(user) {
  const container = document.getElementById("workoutList");
  if (!container) return;

  container.innerHTML = "<p style='opacity:0.75'>Cargando rutina...</p>";

  try {
    const res = await getWeeklyWorkouts(user.id, getWeekStartISO());

    if (!res.ok) {
      throw new Error("No se pudo cargar la rutina");
    }

    const workouts = await res.json();

    if (!Array.isArray(workouts) || workouts.length === 0) {
      renderEmptyRoutine(container);
      renderDashboardSummary(null);
      updateProgress(0, 0);
      return;
    }

    renderWorkouts(container, workouts);
    renderDashboardSummary(workouts);
    updateProgress(workouts.filter(workout => workout.completed).length, workouts.length);
  } catch (error) {
    console.error(error);
    renderEmptyRoutine(container);
    renderDashboardSummary(null);
    updateProgress(0, 0);
  }
}

function renderEmptyRoutine(container) {
  container.innerHTML = `
    <div class="card" style="grid-column: 1 / -1;">
      <h3>No hay rutina generada todavía</h3>
      <p>Guarda tus objetivos para crear una rutina personalizada.</p>
    </div>
  `;
}

function renderDashboardSummary(workouts) {
  const title = document.querySelector(".highlight h3");
  const description = document.querySelector(".highlight p");
  const button = document.querySelector(".highlight button");

  if (!title || !description || !button) return;

  if (!workouts || workouts.length === 0) {
    title.innerText = "Today's Workout";
    description.innerText = "Generate your goals to unlock a personalized plan.";
    button.innerText = "Go to goals";
    button.onclick = () => {
      window.location.href = "../goals/goals.html";
    };
    return;
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  const todayWorkout = workouts.find(workout => workout.plannedDate === todayIso) ?? workouts[0];

  title.innerText = "Today's Workout";
  description.innerText = `${todayWorkout.description || "Rutina"} · ${todayWorkout.plannedDate}`;
  button.innerText = "View routine";
  button.onclick = () => showSection("workouts");
}

function renderWorkouts(container, workouts) {
  container.innerHTML = "";

  workouts.forEach((workout, index) => {
    const card = document.createElement("div");
    card.classList.add("exercise-card");
    card.setAttribute("draggable", "true");
    card.dataset.index = String(index);

    const statusClass = workout.completed ? "done" : "pending";
    const statusLabel = workout.completed ? "Done" : "Pending";
    const exercisesHtml = renderExercises(workout.exercises || []);

    card.innerHTML = `
      <strong>${workout.description || `Session ${index + 1}`}</strong>
      <span>${workout.plannedDate || ""}</span>
      <div style="margin-top: 0.75rem; display: grid; gap: 0.5rem;">
        ${exercisesHtml}
      </div>
      <span class="status ${statusClass}">${statusLabel}</span>
      <button type="button">${workout.completed ? "Mark as pending" : "Complete"}</button>
    `;

    card.addEventListener("dragstart", () => {
      draggedItem = card;
      setTimeout(() => card.classList.add("dragging"), 0);
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      draggedItem = null;
    });

    card.querySelector("button")?.addEventListener("click", async () => {
      await toggleWorkoutDone(workout.id, !workout.completed);
    });

    container.appendChild(card);
  });

  enableDrag(container);
}

function renderExercises(exercises) {
  if (!exercises.length) {
    return `<span style="opacity:0.7">No exercises</span>`;
  }

  return exercises.map(workoutExercise => {
    const exercise = workoutExercise.exercise || {};
    const sets = workoutExercise.sets ?? "-";
    const reps = workoutExercise.reps ?? "-";
    const weight = workoutExercise.weight ?? 0;

    return `
      <div class="card" style="padding: 0.75rem;">
        <strong>${exercise.name || "Exercise"}</strong>
        <p style="margin: 0.35rem 0 0; opacity: 0.75;">${sets} x ${reps} · ${weight} kg</p>
      </div>
    `;
  }).join("");
}

function updateProgress(done, total) {
  const sessionsDone = document.getElementById("sessionsDone");
  const progressFill = document.getElementById("progressFill");

  if (sessionsDone) {
    sessionsDone.innerText = String(done);
  }

  if (progressFill) {
    progressFill.style.width = total > 0 ? `${Math.round((done / total) * 100)}%` : "0%";
  }
}

async function toggleWorkoutDone(workoutId, completed) {
  const res = await toggleWorkoutCompletion(workoutId, completed);

  if (!res.ok) {
    alert("No se pudo actualizar el workout");
    return;
  }

  await loadWorkouts(getCurrentUser());
}

function enableDrag(container) {
  container.addEventListener("dragover", (event) => {
    event.preventDefault();

    const afterElement = getDragAfterElement(container, event.clientY);
    const draggable = document.querySelector(".dragging");

    if (!draggable) return;

    if (afterElement == null) {
      container.appendChild(draggable);
    } else {
      container.insertBefore(draggable, afterElement);
    }
  });
}

function getDragAfterElement(container, y) {
  const elements = [...container.querySelectorAll(".exercise-card:not(.dragging)")];

  return elements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;

    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    }

    return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

/* =========================
   ACTIONS
========================= */

window.logout = () => {
  clearCurrentUser();
  window.location.href = "../index.html";
};