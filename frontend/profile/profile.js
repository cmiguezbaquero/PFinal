/**
 * profile.js
 * ─────────────────────────────────────────────────────────────
 * Feature: 👥 Gestión de Perfil
 * Endpoints:
 *   GET    /api/users/{userId}
 *   PUT    /api/users/{userId}
 *   PUT    /api/users/{userId}/password
 *   DELETE /api/users/{userId}
 * ─────────────────────────────────────────────────────────────
 */

import { getCurrentUser, setCurrentUser, clearCurrentUser } from "../shared/session.js";
import { getUser, updateUser, changePassword, deleteUser }  from "../shared/api.js";

// ── Init (lazy — called by globals.js when section opens) ────
window._loadProfile = () => {
  const user = getCurrentUser();
  if (!user) return;
  loadProfile(user.id);
};

// ── Main loader ───────────────────────────────────────────────
async function loadProfile(userId) {
  const root = document.getElementById("profileRoot");
  if (!root) return;

  root.innerHTML = renderSkeleton();

  try {
    const res  = await getUser(userId);
    const user = res.ok ? await res.json() : getCurrentUser();

    root.innerHTML = renderProfile(user);
    attachHandlers(user);
  } catch (err) {
    console.error("[profile] fetch error:", err);
    // Fallback to session data
    const user = getCurrentUser();
    if (user) {
      root.innerHTML = renderProfile(user);
      attachHandlers(user);
    } else {
      root.innerHTML = renderError("No se pudo cargar el perfil.");
    }
  }
}

// ── Render ────────────────────────────────────────────────────
function renderProfile(user) {
  const name  = user.name  || "";
  const email = user.email || "";
  const goal  = user.goalType || user.goal  || "";
  const level = user.level    || "";

  const goalLabels = {
    PERDER_PESO:   "Perder peso",
    GANAR_MUSCULO: "Ganar músculo",
    MANTENER_FORMA:"Mantener forma"
  };
  const levelLabels = {
    PRINCIPIANTE: "Principiante",
    INTERMEDIO:   "Intermedio",
    AVANZADO:     "Avanzado"
  };

  return `
    <div class="profile-wrap">

      <!-- Avatar + summary -->
      <div class="profile-hero card">
        <div class="profile-avatar">
          <span>${getInitials(name)}</span>
        </div>
        <div class="profile-hero-info">
          <h3 class="profile-name">${name}</h3>
          <p class="profile-email">${email}</p>
          <div class="profile-pills">
            ${goal  ? `<span class="profile-pill">${goalLabels[goal]  || goal}</span>`  : ""}
            ${level ? `<span class="profile-pill">${levelLabels[level]|| level}</span>` : ""}
          </div>
        </div>
      </div>

      <!-- Edit profile -->
      <div class="profile-section card" id="editProfileCard">
        <div class="profile-section-header" onclick="toggleSection('editProfileBody')">
          <div>
            <p class="profile-section-eyebrow">Cuenta</p>
            <h4 class="profile-section-title">Editar perfil</h4>
          </div>
          <span class="profile-chevron" id="chevron-editProfileBody">▾</span>
        </div>
        <div class="profile-section-body" id="editProfileBody">
          <form id="editProfileForm" class="profile-form">
            <div class="form-group">
              <label class="form-label">Nombre</label>
              <input type="text" name="name" id="profileName" value="${name}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" name="email" id="profileEmail" value="${email}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Objetivo</label>
              <select name="goalType" id="profileGoal">
                <option value="PERDER_PESO"    ${goal === "PERDER_PESO"    ? "selected" : ""}>Perder peso</option>
                <option value="GANAR_MUSCULO"  ${goal === "GANAR_MUSCULO"  ? "selected" : ""}>Ganar músculo</option>
                <option value="MANTENER_FORMA" ${goal === "MANTENER_FORMA" ? "selected" : ""}>Mantener forma</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Nivel</label>
              <select name="level" id="profileLevel">
                <option value="PRINCIPIANTE" ${level === "PRINCIPIANTE" ? "selected" : ""}>Principiante</option>
                <option value="INTERMEDIO"   ${level === "INTERMEDIO"   ? "selected" : ""}>Intermedio</option>
                <option value="AVANZADO"     ${level === "AVANZADO"     ? "selected" : ""}>Avanzado</option>
              </select>
            </div>
            <div class="profile-form-actions">
              <button type="submit" id="saveProfileBtn">Guardar cambios</button>
            </div>
            <p class="profile-feedback hidden" id="editFeedback"></p>
          </form>
        </div>
      </div>

      <!-- Change password -->
      <div class="profile-section card">
        <div class="profile-section-header" onclick="toggleSection('passwordBody')">
          <div>
            <p class="profile-section-eyebrow">Seguridad</p>
            <h4 class="profile-section-title">Cambiar contraseña</h4>
          </div>
          <span class="profile-chevron" id="chevron-passwordBody">▾</span>
        </div>
        <div class="profile-section-body hidden" id="passwordBody">
          <form id="changePasswordForm" class="profile-form">
            <div class="form-group">
              <label class="form-label">Contraseña actual</label>
              <input type="password" name="currentPassword" id="currentPassword" required>
            </div>
            <div class="form-group">
              <label class="form-label">Nueva contraseña</label>
              <input type="password" name="newPassword" id="newPassword" required minlength="6">
            </div>
            <div class="form-group">
              <label class="form-label">Confirmar nueva contraseña</label>
              <input type="password" name="confirmPassword" id="confirmPassword" required minlength="6">
            </div>
            <div class="profile-form-actions">
              <button type="submit">Cambiar contraseña</button>
            </div>
            <p class="profile-feedback hidden" id="passwordFeedback"></p>
          </form>
        </div>
      </div>

      <!-- Danger zone -->
      <div class="profile-section card profile-danger-card">
        <div class="profile-section-header" onclick="toggleSection('dangerBody')">
          <div>
            <p class="profile-section-eyebrow danger-eyebrow">Zona peligrosa</p>
            <h4 class="profile-section-title">Eliminar cuenta</h4>
          </div>
          <span class="profile-chevron" id="chevron-dangerBody">▾</span>
        </div>
        <div class="profile-section-body hidden" id="dangerBody">
          <p class="profile-danger-warning">
            Esta acción es <strong>irreversible</strong>. Se eliminarán todos tus datos,
            rutinas e historial de entrenamientos.
          </p>
          <button id="deleteAccountBtn" class="profile-delete-btn">
            Eliminar mi cuenta permanentemente
          </button>
        </div>
      </div>

    </div>
  `;
}

function renderSkeleton() {
  return `
    <div class="profile-wrap">
      <div class="profile-hero card skeleton-card" style="height:110px;"></div>
      <div class="profile-section card skeleton-card" style="height:80px;"></div>
      <div class="profile-section card skeleton-card" style="height:80px;"></div>
    </div>
  `;
}

function renderError(msg) {
  return `<div class="card" style="padding:24px;"><p>⚠️ ${msg}</p></div>`;
}

// ── Accordion toggle ──────────────────────────────────────────
function toggleSection(bodyId) {
  const body    = document.getElementById(bodyId);
  const chevron = document.getElementById(`chevron-${bodyId}`);
  if (!body) return;
  const isHidden = body.classList.toggle("hidden");
  if (chevron) chevron.textContent = isHidden ? "▾" : "▴";
}

window.toggleSection = toggleSection;

// ── Form handlers ─────────────────────────────────────────────
function attachHandlers(user) {

  // ── Edit profile ──
  document.getElementById("editProfileForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn      = document.getElementById("saveProfileBtn");
    const feedback = document.getElementById("editFeedback");

    const payload = {
      name:     document.getElementById("profileName") ?.value.trim(),
      email:    document.getElementById("profileEmail")?.value.trim(),
      goalType: document.getElementById("profileGoal") ?.value,
      level:    document.getElementById("profileLevel")?.value,
    };

    btn.disabled     = true;
    btn.textContent  = "Guardando…";

    try {
      const res = await updateUser(user.id, payload);
      if (!res.ok) throw new Error("Server error");

      const updated = await res.json();
      // Update session with new data
      setCurrentUser({ ...getCurrentUser(), ...updated });

      showFeedback(feedback, "✓ Perfil actualizado correctamente", "success");
      // Refresh the hero section
      const heroName  = document.querySelector(".profile-name");
      const heroEmail = document.querySelector(".profile-email");
      if (heroName)  heroName.textContent  = updated.name  || payload.name;
      if (heroEmail) heroEmail.textContent = updated.email || payload.email;
    } catch (err) {
      console.error("[profile] updateUser error:", err);
      showFeedback(feedback, "✗ No se pudo actualizar el perfil", "error");
    } finally {
      btn.disabled    = false;
      btn.textContent = "Guardar cambios";
    }
  });

  // ── Change password ──
  document.getElementById("changePasswordForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const feedback    = document.getElementById("passwordFeedback");
    const newPwd      = document.getElementById("newPassword")?.value;
    const confirmPwd  = document.getElementById("confirmPassword")?.value;

    if (newPwd !== confirmPwd) {
      showFeedback(feedback, "✗ Las contraseñas no coinciden", "error");
      return;
    }

    try {
      const res = await changePassword(user.id, {
        currentPassword: document.getElementById("currentPassword")?.value,
        newPassword:     newPwd
      });

      if (!res.ok) throw new Error("Server error");
      showFeedback(feedback, "✓ Contraseña cambiada correctamente", "success");
      document.getElementById("changePasswordForm").reset();
    } catch (err) {
      console.error("[profile] changePassword error:", err);
      showFeedback(feedback, "✗ Contraseña actual incorrecta o error del servidor", "error");
    }
  });

  // ── Delete account ──
  document.getElementById("deleteAccountBtn")?.addEventListener("click", async () => {
    const confirmed = confirm(
      "¿Estás seguro? Esta acción eliminará tu cuenta y todos tus datos de forma permanente."
    );
    if (!confirmed) return;

    const double = confirm("Última confirmación: ¿eliminar cuenta definitivamente?");
    if (!double) return;

    try {
      const res = await deleteUser(user.id);
      if (!res.ok) throw new Error("Server error");
      clearCurrentUser();
      window.location.href = "../index.html";
    } catch (err) {
      console.error("[profile] deleteUser error:", err);
      alert("No se pudo eliminar la cuenta. Inténtalo de nuevo.");
    }
  });
}

// ── Feedback helper ───────────────────────────────────────────
function showFeedback(el, msg, type) {
  if (!el) return;
  el.textContent  = msg;
  el.className    = `profile-feedback ${type}`;
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 4000);
}

// ── Initials avatar ───────────────────────────────────────────
function getInitials(name) {
  return (name || "?")
    .split(" ")
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || "")
    .join("");
}

window.loadProfile = loadProfile;