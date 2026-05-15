/**
 * globals.js — SIN type="module"
 * ─────────────────────────────────────────────────────────────
 * Todas las funciones llamadas desde onclick="" en el HTML.
 * Se carga ANTES que los módulos para que el scope global
 * ya las tenga disponibles cuando el usuario haga click.
 * ─────────────────────────────────────────────────────────────
 */

/* ── Navigation ─────────────────────────────────────────────── */
function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  const target = document.getElementById(id);
  if (target) target.classList.add("active");

  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.section === id);
  });

  // Lazy-load cada feature la primera vez que se abre su sección
  if (id === "compliance"         && window._loadCompliance)        window._loadCompliance();
  if (id === "recommendations"    && window._loadRecommendations)   window._loadRecommendations();
  if (id === "history"            && window._loadHistory)           window._loadHistory();
  if (id === "workout-exercises"  && window._loadWorkoutExercises)  window._loadWorkoutExercises();
  if (id === "profile"            && window._loadProfile)           window._loadProfile();
}

/* ── Add exercise drawer ────────────────────────────────────── */
function showAddExercise() {
  document.getElementById("addExercisePanel")?.classList.remove("hidden");
}

function hideAddExercise() {
  document.getElementById("addExercisePanel")?.classList.add("hidden");
}

/* ── Day detail ─────────────────────────────────────────────── */
function closeDayDetail() {
  document.getElementById("dayDetail")?.classList.add("hidden");
  document.querySelectorAll(".day-tile").forEach(t => t.classList.remove("selected"));
}

/* ── Logout ──────────────────────────────────────────────────── */
function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "../index.html";
}

/* ── Profile accordion ──────────────────────────────────────── */
function toggleSection(bodyId) {
  const body    = document.getElementById(bodyId);
  const chevron = document.getElementById("chevron-" + bodyId);
  if (!body) return;
  const isHidden = body.classList.toggle("hidden");
  if (chevron) chevron.textContent = isHidden ? "▾" : "▴";
}

/* ── Recommendations refresh ────────────────────────────────── */
function refreshRecommendations() {
  if (window._loadRecommendations) window._loadRecommendations();
}