/**
 * recommendations.js
 * ─────────────────────────────────────────────────────────────
 * Feature: 🤖 Recomendaciones de Ejercicios
 * Endpoint: GET /api/recommendations/{userId}
 *
 * HOW TO USE IN home.html:
 *   1. Add a nav button:  <button class="nav-btn" onclick="showSection('recommendations')" data-section="recommendations">...</button>
 *   2. Add a section:     <section id="recommendations" class="section"> <div id="recommendationsRoot"></div> </section>
 *   3. Import this file in home.js or via <script type="module" src="recommendations.js"></script>
 * ─────────────────────────────────────────────────────────────
 */

import { getCurrentUser }       from "../shared/session.js";
import { getRecommendations }   from "../shared/api.js";
import { getAvailableExercises} from "../shared/api.js";

// ── Init (lazy — called by globals.js when section opens) ────
window._loadRecommendations = () => {
  const user = getCurrentUser();
  if (!user) return;
  loadRecommendations(user.id);
};

// ── Main loader ───────────────────────────────────────────────
async function loadRecommendations(userId) {
  const root = document.getElementById("recommendationsRoot");
  if (!root) return;

  root.innerHTML = renderSkeleton();

  try {
    const [recRes, availRes] = await Promise.all([
      getRecommendations(userId),
      getAvailableExercises(userId)
    ]);

    const recommendations = recRes.ok   ? await recRes.json()   : [];
    const available       = availRes.ok ? await availRes.json() : [];

    root.innerHTML = renderRecommendations(recommendations, available);
    attachHandlers(userId);
  } catch (err) {
    console.error("[recommendations] fetch error:", err);
    root.innerHTML = renderError("No se pudieron cargar las recomendaciones.");
  }
}

// ── Render ────────────────────────────────────────────────────
function renderRecommendations(recs, available) {
  /*
   * Expected recommendation shape (adapt if yours differs):
   * [ { id, name, description, muscleGroup, difficulty, sets, reps, reason } ]
   *
   * Expected available exercise shape:
   * [ { id, name, description, muscleGroup, difficulty } ]
   */

  const recsHtml = recs.length > 0
    ? recs.map(r => renderRecCard(r, true)).join("")
    : `<p class="rec-empty">No hay recomendaciones disponibles aún. ¡Completa más entrenamientos!</p>`;

  const availHtml = available.length > 0
    ? available.map(e => renderRecCard(e, false)).join("")
    : "";

  return `
    <div class="rec-wrap">

      <!-- Recommended by AI -->
      <div class="rec-section">
        <div class="rec-section-header">
          <div>
            <p class="rec-eyebrow">Inteligencia artificial</p>
            <h3 class="rec-title">Para ti esta semana</h3>
          </div>
          <button class="rec-refresh-btn" onclick="refreshRecommendations()">↻ Actualizar</button>
        </div>
        <div class="rec-grid" id="recGrid">${recsHtml}</div>
      </div>

      <!-- Available exercises for this user -->
      ${available.length > 0 ? `
      <div class="rec-section">
        <div class="rec-section-header">
          <div>
            <p class="rec-eyebrow">Biblioteca personal</p>
            <h3 class="rec-title">Ejercicios disponibles</h3>
          </div>
        </div>
        <div class="rec-grid">${availHtml}</div>
      </div>` : ""}

    </div>
  `;
}

function renderRecCard(ex, isRec) {
  /*
   * Safely read fields — backend may use different casing
   */
  const name       = ex.name        || ex.exerciseName   || "Ejercicio";
  const desc       = ex.description || ex.reason         || "";
  const muscle     = ex.muscleGroup || ex.muscle         || ex.category || "";
  const difficulty = ex.difficulty  || ex.level          || "";
  const sets       = ex.sets        ?? "";
  const reps       = ex.reps        ?? "";

  const diffColor = {
    PRINCIPIANTE: "#6ee7b7", principiante: "#6ee7b7", beginner: "#6ee7b7",
    INTERMEDIO:   "#fbbf24", intermedio:   "#fbbf24", intermediate: "#fbbf24",
    AVANZADO:     "#fb7bb8", avanzado:     "#fb7bb8", advanced: "#fb7bb8",
  }[difficulty] || "rgba(255,255,255,0.4)";

  return `
    <div class="rec-card card" data-id="${ex.id ?? ""}">
      ${isRec ? `<span class="rec-ai-badge">✦ IA</span>` : ""}
      <div class="rec-card-top">
        <p class="rec-card-name">${name}</p>
        ${difficulty ? `<span class="rec-pill" style="color:${diffColor}; border-color:${diffColor}40;">${difficulty}</span>` : ""}
      </div>
      ${muscle ? `<span class="rec-muscle">${muscle}</span>` : ""}
      ${desc    ? `<p class="rec-desc">${desc}</p>` : ""}
      ${(sets && reps) ? `
        <div class="rec-stats">
          <span class="rec-stat-pill">${sets} series</span>
          <span class="rec-stat-pill">${reps} reps</span>
        </div>` : ""}
      <button class="rec-add-btn" data-id="${ex.id ?? ""}" data-name="${name}">
        + Añadir a rutina
      </button>
    </div>
  `;
}

function renderSkeleton() {
  const cards = Array(4).fill(`
    <div class="rec-card card skeleton-card">
      <div class="skeleton-line w60"></div>
      <div class="skeleton-line w40"></div>
      <div class="skeleton-line w80"></div>
    </div>
  `).join("");
  return `<div class="rec-wrap"><div class="rec-section"><div class="rec-grid">${cards}</div></div></div>`;
}

function renderError(msg) {
  return `<div class="rec-error card"><p>⚠️ ${msg}</p></div>`;
}

// ── Handlers ─────────────────────────────────────────────────
function attachHandlers(userId) {
  document.querySelectorAll(".rec-add-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.name;
      // Open the add exercise panel and prefill the name
      const panel = document.getElementById("addExercisePanel");
      const nameInput = document.querySelector("#addExerciseForm input[name='name']");
      if (panel)     panel.classList.remove("hidden");
      if (nameInput) { nameInput.value = name; nameInput.focus(); }
    });
  });
}

async function refreshRecommendations() {
  const user = getCurrentUser();
  if (!user) return;
  await loadRecommendations(user.id);
}

window.refreshRecommendations = refreshRecommendations;
window.loadRecommendations    = loadRecommendations;