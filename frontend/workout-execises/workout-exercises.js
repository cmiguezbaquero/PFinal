/**
 * workout-exercises.js
 * ─────────────────────────────────────────────────────────────
 * Feature: 🏋️ WorkoutExercises & Sessions Detalladas
 * Endpoints:
 *   GET    /api/workout-exercises/workout/{workoutId}
 *   POST   /api/workout-exercises
 *   PUT    /api/workout-exercises/{id}
 *   DELETE /api/workout-exercises/{id}
 *   GET    /api/exercises/available/{userId}
 * ─────────────────────────────────────────────────────────────
 */

import { getCurrentUser }        from "../shared/session.js";
import { getWeekStartISO }       from "../shared/date.js";
import {
  getWeeklyWorkouts,
  getWorkoutExercises,
  addWorkoutExercise,
  updateWorkoutExercise,
  deleteWorkoutExercise,
  getAvailableExercises
} from "../shared/api.js";

// ── Init (lazy — called by globals.js when section opens) ────
window._loadWorkoutExercises = () => {
  const user = getCurrentUser();
  if (!user) return;
  loadWorkoutExercises(user.id);
};

// ── Main loader ───────────────────────────────────────────────
export async function loadWorkoutExercises(userId) {
  const root = document.getElementById("workoutExercisesRoot");
  if (!root) return;

  root.innerHTML = renderSkeleton();

  try {
    const [workoutsRes, availRes] = await Promise.all([
      getWeeklyWorkouts(userId, getWeekStartISO()),
      getAvailableExercises(userId)
    ]);

    const workouts  = workoutsRes.ok  ? await workoutsRes.json()  : [];
    const available = availRes.ok     ? await availRes.json()     : [];

    if (!workouts.length) {
      root.innerHTML = renderEmpty();
      return;
    }

    root.innerHTML = renderPanel(workouts, available);
    attachHandlers(userId, workouts, available);

    // Auto-open first workout
    if (workouts.length > 0) openWorkout(workouts[0].id, userId);

  } catch (err) {
    console.error("[workout-exercises] error:", err);
    root.innerHTML = renderError("Error cargando los ejercicios.");
  }
}

// ── Render shell ─────────────────────────────────────────────
function renderPanel(workouts, available) {
  const workoutTabs = workouts.map((w, i) => `
    <button class="we-tab ${i === 0 ? "active" : ""}"
            data-workout-id="${w.id}">
      <span class="we-tab-date">${formatShortDate(w.plannedDate)}</span>
      <span class="we-tab-desc">${w.description || "Sesión"}</span>
      <span class="we-tab-pill ${w.completed ? "done" : "pending"}">
        ${w.completed ? "✓" : "○"}
      </span>
    </button>
  `).join("");

  const availOptions = available.map(e =>
    `<option value="${e.id}">${e.name || e.exerciseName || "Ejercicio"}</option>`
  ).join("");

  return `
    <div class="we-wrap">

      <!-- Workout selector tabs -->
      <div class="we-tabs" id="weTabs">${workoutTabs}</div>

      <!-- Exercise list for selected workout -->
      <div class="we-detail card" id="weDetail">
        <div class="we-detail-loading">Selecciona un día…</div>
      </div>

      <!-- Add exercise form -->
      <div class="we-add-card card" id="weAddCard">
        <p class="we-add-title">Añadir ejercicio</p>
        <form id="weAddForm" class="we-form">
          <input type="hidden" id="weWorkoutId">

          <div class="we-form-row">
            <div class="form-group">
              <label class="form-label">Ejercicio</label>
              ${available.length > 0
                ? `<select id="weExerciseId" name="exerciseId">${availOptions}</select>`
                : `<input id="weExerciseName" name="name" placeholder="Nombre del ejercicio" required>`
              }
            </div>
          </div>

          <div class="we-form-row three">
            <div class="form-group">
              <label class="form-label">Series</label>
              <input type="number" name="sets" id="weSets" min="1" value="3">
            </div>
            <div class="form-group">
              <label class="form-label">Reps</label>
              <input type="number" name="reps" id="weReps" min="1" value="10">
            </div>
            <div class="form-group">
              <label class="form-label">Peso (kg)</label>
              <input type="number" name="weight" id="weWeight" min="0" value="0" step="0.5">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Notas (opcional)</label>
            <input type="text" name="notes" id="weNotes" placeholder="e.g. Descanso 60s entre series">
          </div>

          <div class="we-form-actions">
            <button type="submit">Añadir ejercicio</button>
            <button type="button" class="btn-ghost" id="weCancelEdit">Cancelar</button>
          </div>
        </form>
      </div>

    </div>
  `;
}

// ── Exercise list renderer ────────────────────────────────────
function renderExerciseList(exercises, workoutId) {
  if (!exercises.length) {
    return `
      <div class="we-empty">
        <p>No hay ejercicios en esta sesión todavía.</p>
        <p class="we-empty-hint">Usa el formulario de abajo para añadir.</p>
      </div>
    `;
  }

  return exercises.map(e => {
    const name   = e.exercise?.name || e.name   || "Ejercicio";
    const desc   = e.exercise?.description      || "";
    const muscle = e.exercise?.muscleGroup || e.exercise?.muscle || "";
    const sets   = e.sets   ?? "—";
    const reps   = e.reps   ?? "—";
    const weight = e.weight ?? 0;
    const notes  = e.notes  || "";

    return `
      <div class="we-exercise-card" data-we-id="${e.id}">
        <div class="we-exercise-left">
          <p class="we-exercise-name">${name}</p>
          ${muscle ? `<span class="we-muscle-tag">${muscle}</span>` : ""}
          ${desc   ? `<p class="we-exercise-desc">${desc}</p>` : ""}
          ${notes  ? `<p class="we-exercise-notes">📝 ${notes}</p>` : ""}
        </div>
        <div class="we-exercise-right">
          <div class="we-stats">
            <div class="we-stat">
              <span class="we-stat-num">${sets}</span>
              <span class="we-stat-lbl">series</span>
            </div>
            <div class="we-stat">
              <span class="we-stat-num">${reps}</span>
              <span class="we-stat-lbl">reps</span>
            </div>
            ${weight > 0 ? `
            <div class="we-stat">
              <span class="we-stat-num">${weight}</span>
              <span class="we-stat-lbl">kg</span>
            </div>` : ""}
          </div>
          <div class="we-exercise-actions">
            <button class="we-edit-btn btn-ghost"
                    data-we-id="${e.id}"
                    data-sets="${sets}"
                    data-reps="${reps}"
                    data-weight="${weight}"
                    data-notes="${notes}">
              ✎ Editar
            </button>
            <button class="we-delete-btn"
                    data-we-id="${e.id}"
                    data-name="${name}">
              ✕
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// ── Open a workout and load its exercises ─────────────────────
async function openWorkout(workoutId, userId) {
  // Update tab active state
  document.querySelectorAll(".we-tab").forEach(t => {
    t.classList.toggle("active", t.dataset.workoutId === String(workoutId));
  });

  // Set hidden workoutId in form
  const weWorkoutId = document.getElementById("weWorkoutId");
  if (weWorkoutId) weWorkoutId.value = workoutId;

  const detail = document.getElementById("weDetail");
  if (!detail) return;

  detail.innerHTML = `<div class="we-detail-loading">Cargando ejercicios…</div>`;

  try {
    const res = await getWorkoutExercises(workoutId);
    const exercises = res.ok ? await res.json() : [];
    detail.innerHTML = `
      <div class="we-detail-header">
        <p class="we-detail-title">Ejercicios de la sesión</p>
        <span class="we-detail-count">${exercises.length} ejercicio${exercises.length !== 1 ? "s" : ""}</span>
      </div>
      <div class="we-exercise-list" id="weExerciseList">
        ${renderExerciseList(exercises, workoutId)}
      </div>
    `;
    attachExerciseActions(workoutId, userId);
  } catch (err) {
    console.error("[workout-exercises] openWorkout error:", err);
    detail.innerHTML = `<p style="opacity:0.55">Error cargando ejercicios.</p>`;
  }
}

// ── Attach all interactive handlers ──────────────────────────
function attachHandlers(userId, workouts, available) {
  // Tab clicks
  document.querySelectorAll(".we-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      openWorkout(tab.dataset.workoutId, userId);
    });
  });

  // Add exercise form submit
  const form = document.getElementById("weAddForm");
  if (!form) return;

  let editingWeId = null;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const workoutId = document.getElementById("weWorkoutId")?.value;
    if (!workoutId) return;

    const exerciseIdEl = document.getElementById("weExerciseId");
    const exerciseNameEl = document.getElementById("weExerciseName");

    const payload = {
      workoutId:  Number(workoutId),
      exerciseId: exerciseIdEl  ? Number(exerciseIdEl.value) : undefined,
      name:       exerciseNameEl ? exerciseNameEl.value       : undefined,
      sets:       Number(document.getElementById("weSets")?.value   || 3),
      reps:       Number(document.getElementById("weReps")?.value   || 10),
      weight:     Number(document.getElementById("weWeight")?.value || 0),
      notes:      document.getElementById("weNotes")?.value || "",
      userId
    };

    try {
      if (editingWeId) {
        await updateWorkoutExercise(editingWeId, payload);
        editingWeId = null;
      } else {
        await addWorkoutExercise(payload);
      }
      form.reset();
      resetFormTitle();
      await openWorkout(workoutId, userId);
    } catch (err) {
      console.error("[workout-exercises] submit error:", err);
    }
  });

  // Cancel edit
  document.getElementById("weCancelEdit")?.addEventListener("click", () => {
    editingWeId = null;
    form.reset();
    resetFormTitle();
  });

  // Store editingWeId in closure via event delegation on the detail panel
  document.getElementById("weDetail")?.addEventListener("click", async (e) => {
    const editBtn   = e.target.closest(".we-edit-btn");
    const deleteBtn = e.target.closest(".we-delete-btn");

    if (editBtn) {
      editingWeId = editBtn.dataset.weId;
      document.getElementById("weSets")  .value = editBtn.dataset.sets;
      document.getElementById("weReps")  .value = editBtn.dataset.reps;
      document.getElementById("weWeight").value = editBtn.dataset.weight;
      document.getElementById("weNotes") .value = editBtn.dataset.notes;
      const title = document.querySelector(".we-add-title");
      if (title) title.textContent = "Editando ejercicio";
      document.getElementById("weAddCard")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    if (deleteBtn) {
      const name      = deleteBtn.dataset.name;
      const weId      = deleteBtn.dataset.weId;
      const workoutId = document.getElementById("weWorkoutId")?.value;
      if (!confirm(`¿Eliminar "${name}"?`)) return;
      try {
        await deleteWorkoutExercise(weId);
        await openWorkout(workoutId, userId);
      } catch (err) {
        console.error("[workout-exercises] delete error:", err);
      }
    }
  });
}

function attachExerciseActions(workoutId, userId) {
  // Already handled via event delegation on #weDetail — nothing extra needed
}

function resetFormTitle() {
  const title = document.querySelector(".we-add-title");
  if (title) title.textContent = "Añadir ejercicio";
}

// ── Skeletons / empty / error ─────────────────────────────────
function renderSkeleton() {
  return `
    <div class="we-wrap">
      <div class="we-tabs">
        ${Array(4).fill(`<div class="we-tab skeleton-card" style="height:56px;width:100px;border-radius:12px;"></div>`).join("")}
      </div>
      <div class="we-detail card skeleton-card" style="height:200px;"></div>
    </div>
  `;
}

function renderEmpty() {
  return `
    <div class="we-wrap">
      <div class="card" style="padding:32px;text-align:center;">
        <p style="opacity:0.6;">No hay rutina esta semana. Genera tus objetivos primero.</p>
      </div>
    </div>
  `;
}

function renderError(msg) {
  return `<div class="card" style="padding:24px;"><p>⚠️ ${msg}</p></div>`;
}

// ── Helpers ───────────────────────────────────────────────────
function formatShortDate(iso) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("es-ES", { weekday: "short", day: "numeric" });
}

window.loadWorkoutExercises = loadWorkoutExercises;