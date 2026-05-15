/**
 * history.js
 * ─────────────────────────────────────────────────────────────
 * Feature: 📈 Historial de Sesiones / Mi Progreso
 * Endpoint: GET /api/workout-sessions/user/{userId}
 *
 * HOW TO USE IN home.html:
 *   1. Add a nav button:  <button class="nav-btn" onclick="showSection('history')" data-section="history">...</button>
 *   2. Add a section:     <section id="history" class="section"> <div id="historyRoot"></div> </section>
 *   3. Import: <script type="module" src="history.js"></script>
 * ─────────────────────────────────────────────────────────────
 */

import { getCurrentUser }  from "../shared/session.js";
import { getUserSessions } from "../shared/api.js";

// ── Init (lazy — called by globals.js when section opens) ────
window._loadHistory = () => {
  const user = getCurrentUser();
  if (!user) return;
  loadHistory(user.id);
};

// ── Main loader ───────────────────────────────────────────────
async function loadHistory(userId) {
  const root = document.getElementById("historyRoot");
  if (!root) return;

  root.innerHTML = renderSkeleton();

  try {
    const res = await getUserSessions(userId);

    if (!res.ok) {
      root.innerHTML = renderError("No se pudo cargar el historial.");
      return;
    }

    let sessions = await res.json();
    if (!Array.isArray(sessions)) sessions = [];

    // Sort newest first
    sessions.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));

    root.innerHTML = renderHistory(sessions);
    attachFilters(sessions);
  } catch (err) {
    console.error("[history] fetch error:", err);
    root.innerHTML = renderError("Error de conexión con el servidor.");
  }
}

// ── Render ────────────────────────────────────────────────────
function renderHistory(sessions) {
  /*
   * Expected session shape (adapt if yours differs):
   * {
   *   id, date, completed, durationMinutes,
   *   workout: { description, plannedDate },
   *   exercises: [ { name, sets, reps, weight } ]
   * }
   */

  // Aggregate stats
  const total     = sessions.length;
  const completed = sessions.filter(s => s.completed).length;
  const totalMins = sessions.reduce((acc, s) => acc + (s.durationMinutes ?? 0), 0);
  const avgMins   = total > 0 ? Math.round(totalMins / total) : 0;

  const sessionCards = sessions.length > 0
    ? sessions.map(renderSessionCard).join("")
    : `<div class="history-empty card"><p>Aún no hay sesiones registradas. ¡Completa tu primer entrenamiento!</p></div>`;

  return `
    <div class="history-wrap">

      <!-- Summary stats -->
      <div class="history-stats-row">
        ${renderStatCard("Sesiones totales", total,     "◈", "#cc6fff")}
        ${renderStatCard("Completadas",      completed, "✓", "#6ee7b7")}
        ${renderStatCard("Pendientes",  total - completed, "○", "#fb7bb8")}
        ${renderStatCard("Tiempo medio", avgMins > 0 ? avgMins + " min" : "—", "⏱", "#818cf8")}
      </div>

      <!-- Filter bar -->
      <div class="history-filters">
        <button class="history-filter active" data-filter="all">Todas</button>
        <button class="history-filter" data-filter="completed">Completadas</button>
        <button class="history-filter" data-filter="pending">Pendientes</button>
      </div>

      <!-- Session list -->
      <div class="history-list" id="historyList">
        ${sessionCards}
      </div>

    </div>
  `;
}

function renderStatCard(label, value, icon, color) {
  return `
    <div class="history-stat-card card">
      <span class="history-stat-icon" style="color:${color}">${icon}</span>
      <span class="history-stat-num" style="color:${color}">${value}</span>
      <span class="history-stat-lbl">${label}</span>
    </div>
  `;
}

function renderSessionCard(session) {
  const date      = session.date || session.plannedDate || session.createdAt || "";
  const dateLabel = date
    ? new Date(date.slice(0,10) + "T00:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "short" })
    : "Fecha desconocida";

  const desc      = session.workout?.description || session.description || "Sesión";
  const done      = session.completed;
  const duration  = session.durationMinutes;
  const exercises = session.exercises || session.workout?.exercises || [];

  const exPreview = exercises.slice(0, 3).map(e => {
    const name   = e.exercise?.name || e.name || "Ejercicio";
    const sets   = e.sets  ?? "—";
    const reps   = e.reps  ?? "—";
    const weight = e.weight ?? 0;
    return `
      <div class="history-ex-row">
        <span class="history-ex-name">${name}</span>
        <span class="history-ex-meta">${sets}×${reps}${weight > 0 ? ` · ${weight}kg` : ""}</span>
      </div>
    `;
  }).join("");

  const more = exercises.length > 3
    ? `<p class="history-ex-more">+${exercises.length - 3} ejercicios más</p>`
    : "";

  return `
    <div class="history-card card" data-completed="${done}">
      <div class="history-card-header">
        <div>
          <p class="history-card-date">${dateLabel}</p>
          <p class="history-card-desc">${desc}</p>
        </div>
        <div class="history-card-right">
          ${duration ? `<span class="history-duration">⏱ ${duration} min</span>` : ""}
          <span class="history-status-pill ${done ? "done" : "pending"}">${done ? "Completada" : "Pendiente"}</span>
        </div>
      </div>
      ${exercises.length > 0 ? `
        <div class="history-ex-list">
          ${exPreview}
          ${more}
        </div>` : ""}
    </div>
  `;
}

function renderSkeleton() {
  const cards = Array(3).fill(`
    <div class="history-card card skeleton-card">
      <div class="skeleton-line w60"></div>
      <div class="skeleton-line w40"></div>
      <div class="skeleton-line w80"></div>
      <div class="skeleton-line w50"></div>
    </div>
  `).join("");
  return `<div class="history-wrap"><div class="history-list">${cards}</div></div>`;
}

function renderError(msg) {
  return `<div class="history-error card"><p>⚠️ ${msg}</p></div>`;
}

// ── Filters ───────────────────────────────────────────────────
function attachFilters(sessions) {
  document.querySelectorAll(".history-filter").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".history-filter").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;
      const list   = document.getElementById("historyList");
      if (!list) return;

      const filtered = filter === "all"       ? sessions
                     : filter === "completed" ? sessions.filter(s => s.completed)
                     :                          sessions.filter(s => !s.completed);

      list.innerHTML = filtered.length > 0
        ? filtered.map(renderSessionCard).join("")
        : `<div class="history-empty card"><p>No hay sesiones en esta categoría.</p></div>`;
    });
  });
}

window.loadHistory = loadHistory;