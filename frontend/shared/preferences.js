/**
 * preferences.js
 * ─────────────────────────────────────────────────────────────
 * Gestiona las preferencias del usuario:
 * - Tema: light/dark
 * - Vista: calendar/horizontal
 * ─────────────────────────────────────────────────────────────
 */

const STORAGE_KEY = "fitplan_preferences";

const DEFAULT_PREFS = {
  theme: "dark",      // dark | light
  viewMode: "calendar" // calendar | horizontal
};

export function getPreferences() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...DEFAULT_PREFS, ...JSON.parse(stored) } : DEFAULT_PREFS;
  } catch (err) {
    console.warn("[preferences] Error reading:", err);
    return DEFAULT_PREFS;
  }
}

export function savePreferences(prefs) {
  try {
    const current = getPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    applyPreferences(updated);
    console.log("[preferences] Guardadas:", updated);
    return updated;
  } catch (err) {
    console.error("[preferences] Error saving:", err);
    return getPreferences();
  }
}

export function applyPreferences(prefs) {
  const html = document.documentElement;

  // Aplicar tema
  if (prefs.theme === "light") {
    html.classList.add("light-theme");
    html.classList.remove("dark-theme");
  } else {
    html.classList.remove("light-theme");
    html.classList.add("dark-theme");
  }

  // Aplicar modo de vista
  if (prefs.viewMode === "horizontal") {
    html.classList.add("view-horizontal");
    html.classList.remove("view-calendar");
  } else {
    html.classList.add("view-calendar");
    html.classList.remove("view-horizontal");
  }

  // Emitir evento para que otros módulos reaccionen
  window.dispatchEvent(new CustomEvent("preferencesChanged", {
    detail: prefs
  }));
}

// Aplicar preferencias al cargar
export function initPreferences() {
  const prefs = getPreferences();
  applyPreferences(prefs);
  console.log("[preferences] Inicializadas:", prefs);
}

// Exponer para acceso global
window.preferences = {
  get: getPreferences,
  set: savePreferences,
  apply: applyPreferences
};

console.log("[preferences] Módulo cargado");

