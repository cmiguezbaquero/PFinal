import { clearCurrentUser, getCurrentUser } from "../shared/session.js";
import { getWeekStartISO } from "../shared/date.js";
import { getWeeklyWorkouts, toggleWorkoutCompletion, createExercise, addWorkoutExercise } from "../shared/api.js";

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

  renderWeekGrid();
  await loadWorkouts(user);
  populateAddExerciseDays();
});

/* =========================
   NAV — showSection lives in globals.js
========================= */

/* =========================
   CALENDAR
========================= */
function loadCalendar() {
  // kept for backward compatibility
}

/* =========================
   WORKOUTS
========================= */
let draggedItem = null;

async function loadWorkouts(user) {
  const container = document.getElementById("workoutList");
  if (!container) return;

  container.innerHTML = "<p style='opacity:0.6; padding: 8px 0;'>Loading routine…</p>";

  const weekStart = getWeekStartISO();

  try {
    const res = await getWeeklyWorkouts(user.id, weekStart);

    if (!res.ok) {
      const localWorkouts = buildWorkoutsFromLocal(user.id, weekStart);
      renderWorkouts(container, localWorkouts);
      renderDashboardSummary(localWorkouts);
      updateProgress(localWorkouts.filter(w => w.completed).length, localWorkouts.length);
      renderWeekTilesFromWorkouts(localWorkouts);
      return;
    }

    let workouts = await res.json();
    if (!Array.isArray(workouts)) workouts = [];

    // Limpiar localStorage si el servidor responde OK — evita duplicados
    localStorage.removeItem(getLocalExercisesKey(user.id, weekStart));
    workouts = mergeLocalExercisesIntoWorkouts(user.id, weekStart, workouts);

    if (workouts.length === 0) {
      renderEmptyRoutine(container);
      renderDashboardSummary(null);
      updateProgress(0, 0);
      return;
    }

    renderWorkouts(container, workouts);
    renderDashboardSummary(workouts);
    updateProgress(workouts.filter(w => w.completed).length, workouts.length);
    renderWeekTilesFromWorkouts(workouts);
  } catch (error) {
    console.error(error);
    const localWorkouts = buildWorkoutsFromLocal(user.id, weekStart);
    if (!localWorkouts || localWorkouts.length === 0) {
      renderEmptyRoutine(container);
      renderDashboardSummary(null);
      updateProgress(0, 0);
      return;
    }
    renderWorkouts(container, localWorkouts);
    renderDashboardSummary(localWorkouts);
    updateProgress(localWorkouts.filter(w => w.completed).length, localWorkouts.length);
    renderWeekTilesFromWorkouts(localWorkouts);
  }
}

/* =========================
   LOCAL STORAGE HELPERS
========================= */
function getLocalExercisesKey(userId, weekStart) {
  return `local_exercises_${userId}_${weekStart}`;
}

function getLocalExercises(userId, weekStart) {
  const key = getLocalExercisesKey(userId, weekStart);
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

function saveLocalExercise(userId, weekStart, exercise) {
  const key = getLocalExercisesKey(userId, weekStart);
  const arr = getLocalExercises(userId, weekStart);
  arr.push(exercise);
  localStorage.setItem(key, JSON.stringify(arr));
}

function buildWorkoutsFromLocal(userId, weekStart) {
  const local = getLocalExercises(userId, weekStart);
  const map = {};
  local.forEach(e => {
    const d = e.plannedDate || weekStart;
    if (!map[d]) map[d] = { id: `local-${d}`, plannedDate: d, exercises: [], completed: false, description: 'Local' };
    map[d].exercises.push(e);
  });
  return Object.values(map).sort((a, b) => a.plannedDate.localeCompare(b.plannedDate));
}

function mergeLocalExercisesIntoWorkouts(userId, weekStart, workouts) {
  const local = getLocalExercises(userId, weekStart);
  if (!local.length) return workouts;

  const byDate = {};
  workouts.forEach(w => { byDate[w.plannedDate] = w; });

  local.forEach(e => {
    const d = e.plannedDate || weekStart;
    if (byDate[d]) {
      byDate[d].exercises = byDate[d].exercises || [];
      byDate[d].exercises.push(e);
    } else {
      const newW = { id: `local-${d}-${Date.now()}`, plannedDate: d, exercises: [e], completed: false, description: 'Local' };
      workouts.push(newW);
      byDate[d] = newW;
    }
  });

  return workouts.sort((a, b) => (a.plannedDate || '').localeCompare(b.plannedDate || ''));
}

/* =========================
   WEEK GRID — big day cards
========================= */
function renderWeekGrid() {
  const grid = document.getElementById("weekGrid");
  if (!grid) return;

  grid.innerHTML = "";
  const todayIso = new Date().toISOString().slice(0, 10);
  const start = new Date(`${getWeekStartISO()}T00:00:00`);

  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const iso = day.toISOString().slice(0, 10);

    const tile = document.createElement("button");
    tile.classList.add("day-tile");
    tile.dataset.iso = iso;
    if (iso === todayIso) tile.classList.add("today");

    const weekday = day.toLocaleDateString("es-ES", { weekday: "short" });
    const dayNum  = day.getDate();

    tile.innerHTML = `
      <div class="day-tile-header">
        <span class="day-tile-weekday">${weekday}</span>
        <span class="day-tile-num">${dayNum}</span>
      </div>
      <div class="day-tile-exercises" id="tile-exercises-${iso}">
        <span class="day-tile-more" style="opacity:0.35">—</span>
      </div>
      <div class="day-tile-footer">
        <span class="day-tile-count" id="tile-count-${iso}"></span>
        <span class="day-tile-status empty" id="tile-status-${iso}">Rest</span>
      </div>
    `;

    tile.addEventListener("click", () => openDayDetail(iso));
    grid.appendChild(tile);
  }
}

/* Fill tiles once workouts are loaded */
function renderWeekTilesFromWorkouts(workouts) {
  // reset all tiles to "rest" state
  document.querySelectorAll(".day-tile").forEach(tile => {
    const iso = tile.dataset.iso;
    const exEl  = document.getElementById(`tile-exercises-${iso}`);
    const cntEl = document.getElementById(`tile-count-${iso}`);
    const stEl  = document.getElementById(`tile-status-${iso}`);

    if (exEl)  exEl.innerHTML  = `<span class="day-tile-more" style="opacity:0.28">—</span>`;
    if (cntEl) cntEl.textContent = "";
    if (stEl)  { stEl.textContent = "Rest"; stEl.className = "day-tile-status empty"; }
  });

  workouts.forEach(w => {
    const iso   = w.plannedDate;
    const exEl  = document.getElementById(`tile-exercises-${iso}`);
    const cntEl = document.getElementById(`tile-count-${iso}`);
    const stEl  = document.getElementById(`tile-status-${iso}`);
    if (!exEl) return;

    const exercises = w.exercises || [];
    const count = exercises.length;

    // Show up to 3 exercise names as preview dots
    const preview = exercises.slice(0, 3);
    const rest    = count - preview.length;

    exEl.innerHTML = preview.map(e => {
      const name = (e.exercise && e.exercise.name) || e.name || "Exercise";
      return `<span class="day-tile-ex">${name}</span>`;
    }).join("") + (rest > 0 ? `<span class="day-tile-more">+${rest} more</span>` : "");

    if (cntEl) cntEl.textContent = `${count} exercise${count !== 1 ? "s" : ""}`;

    if (stEl) {
      if (w.completed) {
        stEl.textContent = "Done ✓";
        stEl.className = "day-tile-status done";
      } else {
        stEl.textContent = "Pending";
        stEl.className = "day-tile-status pending";
      }
    }
  });
}

/* =========================
   DAY DETAIL PANEL
========================= */
function openDayDetail(iso) {
  const panel  = document.getElementById("dayDetail");
  const title  = document.getElementById("dayDetailTitle");
  const list   = document.getElementById("dayExercises");

  // Mark selected tile
  document.querySelectorAll(".day-tile").forEach(t => t.classList.remove("selected"));
  const activeTile = document.querySelector(`.day-tile[data-iso="${iso}"]`);
  if (activeTile) activeTile.classList.add("selected");

  title.textContent = new Date(iso + "T00:00:00").toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long"
  });

  list.innerHTML = `<p style="opacity:0.55; font-size:13px;">Loading…</p>`;
  panel.classList.remove("hidden");
  panel.scrollIntoView({ behavior: "smooth", block: "nearest" });

  const user = getCurrentUser();
  if (!user) return;

  getWeeklyWorkouts(user.id, getWeekStartISO()).then(async res => {
    if (!res.ok) { list.innerHTML = `<p style="opacity:0.55;">Could not load exercises.</p>`; return; }

    const workouts = await res.json();
    const day = workouts.find(w => w.plannedDate === iso);

    if (!day || !(day.exercises || []).length) {
      list.innerHTML = `
        <div style="padding: 16px 0; opacity: 0.5; font-size: 13px;">
          No exercises scheduled for this day.
        </div>`;
      return;
    }

    list.innerHTML = "";
    (day.exercises || []).forEach(e => {
      const exData = e.exercise || {};
      const name   = exData.name  || e.name  || "Exercise";
      const desc   = exData.description || e.description || "";
      const sets   = e.sets   ?? "—";
      const reps   = e.reps   ?? "—";
      const weight = e.weight ?? 0;
      const muscle = exData.muscleGroup || exData.muscle || "";

      const card = document.createElement("div");
      card.classList.add("exercise-detail-card");
      card.innerHTML = `
        <p class="exercise-detail-name">${name}</p>
        <div class="exercise-detail-stats">
          <span class="exercise-stat-pill">${sets} sets</span>
          <span class="exercise-stat-pill">${reps} reps</span>
          ${weight > 0 ? `<span class="exercise-stat-pill">${weight} kg</span>` : ""}
          ${muscle ? `<span class="exercise-stat-pill">${muscle}</span>` : ""}
        </div>
        ${desc ? `<p class="exercise-detail-desc">${desc}</p>` : ""}
      `;
      list.appendChild(card);
    });
  }).catch(err => {
    console.error(err);
    list.innerHTML = `<p style="opacity:0.55;">Error loading exercises.</p>`;
  });
}

function closeDayDetail() {
  document.getElementById("dayDetail").classList.add("hidden");
  document.querySelectorAll(".day-tile").forEach(t => t.classList.remove("selected"));
}

window.openDayDetail  = openDayDetail;
window.closeDayDetail = closeDayDetail;

/* =========================
   ADD EXERCISE FORM
========================= */
function populateAddExerciseDays() {
  const select = document.getElementById("addExerciseDay");
  if (!select) return;
  select.innerHTML = "";
  const start = new Date(`${getWeekStartISO()}T00:00:00`);
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const iso = day.toISOString().slice(0, 10);
    const opt = document.createElement("option");
    opt.value    = iso;
    opt.innerText = day.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" });
    select.appendChild(opt);
  }
}

function showAddExercise() { document.getElementById("addExercisePanel").classList.remove("hidden"); }
function hideAddExercise() { document.getElementById("addExercisePanel").classList.add("hidden"); }

window.showAddExercise = showAddExercise;
window.hideAddExercise = hideAddExercise;

document.getElementById("addExerciseForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());
  const user = getCurrentUser();
  if (!user) { alert("User not found"); return; }

  try {
    const payload = {
      name:        data.name,
      sets:        Number(data.sets)  || 3,
      reps:        Number(data.reps)  || 10,
      plannedDate: data.day,
      userId:      user.id
    };

    try {
      const res = await createExercise(payload);
      if (!res.ok) {
        saveLocalExercise(user.id, getWeekStartISO(), payload);
      }
    } catch {
      saveLocalExercise(user.id, getWeekStartISO(), payload);
    }

    hideAddExercise();
    await loadWorkouts(user);
  } catch (err) {
    console.error(err);
    hideAddExercise();
    await loadWorkouts(user);
  }
});

/* =========================
   RENDER HELPERS
========================= */
function renderEmptyRoutine(container) {
  container.innerHTML = `
    <div class="card" style="grid-column: 1 / -1; padding: 28px;">
      <h3 style="margin:0 0 8px;">No routine generated yet</h3>
      <p style="opacity:0.6; margin:0;">Save your goals to create a personalized plan.</p>
    </div>
  `;
}

function renderDashboardSummary(workouts) {
  const title       = document.querySelector(".highlight h3");
  const description = document.querySelector(".highlight p");
  const button      = document.querySelector(".highlight button");
  if (!title || !description || !button) return;

  if (!workouts || workouts.length === 0) {
    title.innerText       = "Today's Workout";
    description.innerText = "Generate your goals to unlock a personalized plan.";
    button.innerText      = "Go to goals";
    button.onclick        = () => { window.location.href = "../goals/goals.html"; };
    return;
  }

  const todayIso    = new Date().toISOString().slice(0, 10);
  const todayWorkout = workouts.find(w => w.plannedDate === todayIso) ?? workouts[0];

  title.innerText       = "Today's Workout";
  description.innerText = `${todayWorkout.description || "Routine"} · ${todayWorkout.plannedDate}`;
  button.innerText      = "View routine";
  button.onclick        = () => window.showSection("workouts");
}

function renderWorkouts(container, workouts) {
  container.innerHTML = "";

  workouts.forEach((workout, index) => {
    const card = document.createElement("div");
    card.classList.add("exercise-card");
    card.setAttribute("draggable", "true");
    card.dataset.index = String(index);

    const statusClass = workout.completed ? "done"    : "pending";
    const statusLabel = workout.completed ? "Done"    : "Pending";
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
  if (!exercises.length) return `<span style="opacity:0.55; font-size:13px;">No exercises</span>`;

  return exercises.map(we => {
    const exercise = we.exercise || {};
    const sets   = we.sets   ?? "—";
    const reps   = we.reps   ?? "—";
    const weight = we.weight ?? 0;
    return `
      <div class="card" style="padding: 10px 14px;">
        <strong style="font-size:13px;">${exercise.name || "Exercise"}</strong>
        <p style="margin: 4px 0 0; opacity: 0.65; font-size:12px;">${sets} × ${reps}${weight > 0 ? ` · ${weight} kg` : ""}</p>
      </div>
    `;
  }).join("");
}

function updateProgress(done, total) {
  const sessionsDone = document.getElementById("sessionsDone");
  const fills        = document.querySelectorAll("#progressFill");
  const pct          = total > 0 ? Math.round((done / total) * 100) : 0;

  if (sessionsDone) sessionsDone.innerText = String(done);
  fills.forEach(f => { f.style.width = `${pct}%`; });

  const detail = document.getElementById("sessionsDoneDetail");
  if (detail) detail.innerText = String(done);
}

async function toggleWorkoutDone(workoutId, completed) {
  const res = await toggleWorkoutCompletion(workoutId, completed);
  if (!res.ok) { alert("Could not update workout"); return; }
  await loadWorkouts(getCurrentUser());
}

function enableDrag(container) {
  container.addEventListener("dragover", (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(container, e.clientY);
    const draggable    = document.querySelector(".dragging");
    if (!draggable) return;
    if (afterElement == null) container.appendChild(draggable);
    else container.insertBefore(draggable, afterElement);
  });
}

function getDragAfterElement(container, y) {
  const elements = [...container.querySelectorAll(".exercise-card:not(.dragging)")];
  return elements.reduce((closest, child) => {
    const box    = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) return { offset, element: child };
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

/* =========================
   LOGOUT
========================= */
window.logout = () => {
  clearCurrentUser();
  window.location.href = "../index.html";
};