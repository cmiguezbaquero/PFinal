/**
 * goals.js (Integrated Dashboard Module - SIMPLIFICADO)
 * ─────────────────────────────────────────────────────────────
 * Feature: 🎯 Objetivos personalizados
 * Endpoint: PUT /api/users/{userId}/goals
 *           POST /api/routines/weekly/generate
 *
 * Integrated with home.html dashboard lazy-loading
 * ─────────────────────────────────────────────────────────────
 */

import { generateWeeklyRoutine, updateGoals } from "../shared/api.js";
import { getCurrentUser, setCurrentUser } from "../shared/session.js";
import { getWeekStartISO } from "../shared/date.js";

console.log("[goals.js] ✓ Módulo cargado");

let currentUserId = null;

// ── Init (lazy — called by globals.js when section opens) ────
window._loadGoals = () => {
  console.log("[goals.js] ✓ _loadGoals() llamado");
  const user = getCurrentUser();
  if (!user) {
    console.warn("[goals.js] ✗ No hay usuario logueado");
    return;
  }
  currentUserId = user.id;
  renderForm();
  setupFormListener();
};

// ── Render formulario ──────────────────────────────────────────
function renderForm() {
  const root = document.getElementById("goalsRoot");
  if (!root) {
    console.error("[goals.js] ✗ #goalsRoot NO encontrado");
    return;
  }

  root.innerHTML = `
    <div class="goals-wrap">
      <div class="goals-card card">
        <form id="goalsForm">
          <div class="form-group">
            <label>Objetivo</label>
            <select id="tipObj" required>
              <option value="">Selecciona un objetivo</option>
              <option value="PERDER_PESO">Perder peso</option>
              <option value="GANAR_MUSCULO">Ganar músculo</option>
              <option value="MANTENER_FORMA">Mantener forma</option>
            </select>
          </div>

          <div class="form-group">
            <label>Días por semana</label>
            <input type="number" id="tipDias" min="1" max="7" placeholder="1-7" required />
          </div>

          <div class="form-group">
            <label>Nivel</label>
            <select id="tipNivel" required>
              <option value="">Selecciona tu nivel</option>
              <option value="PRINCIPIANTE">Principiante</option>
              <option value="INTERMEDIO">Intermedio</option>
              <option value="AVANZADO">Avanzado</option>
            </select>
          </div>

          <div class="form-actions">
            <button type="submit">Guardar objetivos</button>
          </div>
        </form>
        <div id="goalsMsg"></div>
      </div>
    </div>
  `;
  console.log("[goals.js] ✓ Formulario renderizado");
}

// ── Setup form listener ────────────────────────────────────────
function setupFormListener() {
  const form = document.getElementById("goalsForm");
  if (!form) {
    console.error("[goals.js] ✗ Formulario NO encontrado después de render");
    return;
  }

  console.log("[goals.js] ✓ Configurando listener del formulario");

  form.addEventListener("submit", handleFormSubmit);
}

// ── Handle form submit ─────────────────────────────────────────
async function handleFormSubmit(e) {
  e.preventDefault();
  console.log("[goals.js] ✓ Submit ejecutado");

  if (!currentUserId) {
    console.error("[goals.js] ✗ No hay userId");
    showMsg("Error: Usuario no disponible", "error");
    return;
  }

  const tipo = document.getElementById("tipObj")?.value || "";
  const dias = document.getElementById("tipDias")?.value || "";
  const nivel = document.getElementById("tipNivel")?.value || "";

  console.log("[goals.js] Datos capturados:", { tipo, dias, nivel });

  if (!tipo || !dias || !nivel) {
    console.warn("[goals.js] ✗ Campos incompletos");
    showMsg("Completa todos los campos", "error");
    return;
  }

  const parsedDias = parseInt(dias);
  if (isNaN(parsedDias) || parsedDias < 1 || parsedDias > 7) {
    console.warn("[goals.js] ✗ Días inválidos");
    showMsg("Días debe estar entre 1 y 7", "error");
    return;
  }

  console.log("[goals.js] ✓✓ Enviando al backend...");

  try {
    // Enviar goals
    const res = await updateGoals(currentUserId, {
      goalType: tipo,
      trainingDaysPerWeek: parsedDias,
      level: nivel
    });

    console.log("[goals.js] Response status:", res.status);

    if (!res.ok) {
      const msg = await res.text().catch(() => "Error desconocido");
      console.error("[goals.js] ✗ Backend error:", msg);
      showMsg(`Error ${res.status}: ${msg}`, "error");
      return;
    }

    const userData = await res.json();
    console.log("[goals.js] ✓ Goals guardados, actualizando usuario");
    setCurrentUser(userData);

    // Generar rutina
    console.log("[goals.js] ✓ Generando rutina...");
    const routRes = await generateWeeklyRoutine(currentUserId, getWeekStartISO());
    console.log("[goals.js] Rutina response:", routRes.status);

    showMsg("✓ Objetivos guardados correctamente", "success");
    console.log("[goals.js] ✓✓✓ ¡Éxito completo!");

    // Ir al dashboard en 2 segundos
    setTimeout(() => {
      console.log("[goals.js] Volviendo a dashboard...");
      window.showSection("dashboard");
    }, 2000);
  } catch (err) {
    console.error("[goals.js] ✗ Error:", err.message);
    showMsg("Error de conexión: " + err.message, "error");
  }
}

// ── Show message ───────────────────────────────────────────────
function showMsg(text, type) {
  const el = document.getElementById("goalsMsg");
  if (!el) {
    console.warn("[goals.js] ✗ #goalsMsg no existe");
    return;
  }
  el.innerHTML = `<p class="goals-message ${type}">${text}</p>`;
  console.log(`[goals.js] Mensaje (${type}): ${text}`);
}

console.log("[goals.js] ✓✓ Módulo listo");
