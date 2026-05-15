/**
 * compliance.js
 * ─────────────────────────────────────────────────────────────
 * Feature: 📊 Cumplimiento Semanal
 * Endpoint: GET /api/workout-sessions/compliance/user/{userId}/week/{weekStart}
 *
 * HOW TO USE IN home.html:
 *   1. Add a nav button:  <button class="nav-btn" onclick="showSection('compliance')" data-section="compliance">...</button>
 *   2. Add a section:     <section id="compliance" class="section">  <div id="complianceRoot"></div> </section>
 *   3. Import this file:  <script type="module" src="compliance.js"></script>
 *      (or add this import inside home.js: import './compliance.js')
 * ─────────────────────────────────────────────────────────────
 */

import { getCurrentUser }    from "../shared/session.js";
import { getWeekStartISO }   from "../shared/date.js";
import { getWeeklyCompliance } from "../shared/api.js";

// ── Init (lazy — called by globals.js when section opens) ────
window._loadCompliance = () => {
  const user = getCurrentUser();
  if (!user) return;
  loadCompliance(user.id);
};

// ── Main loader ───────────────────────────────────────────────
export async function loadCompliance(userId) {
  const root = document.getElementById("complianceRoot");
  if (!root) return;

  root.innerHTML = renderSkeleton();

  const weekStart = getWeekStartISO();

  try {
    const res = await getWeeklyCompliance(userId, weekStart);

    if (!res.ok) {
      root.innerHTML = renderError("No se pudo cargar el cumplimiento semanal.");
      return;
    }

    const data = await res.json();
    root.innerHTML = renderCompliance(data, weekStart);
    animateBars();
  } catch (err) {
    console.error("[compliance] fetch error:", err);
    root.innerHTML = renderError("Error de conexión con el servidor.");
  }
}

// ── Render ────────────────────────────────────────────────────
function renderCompliance(data, weekStart) {
  /*
   * Expected shape from backend (adapt field names if yours differ):
   * {
   *   completedWorkouts: number,
   *   totalWorkouts:     number,
   *   complianceRate:    number,   // 0–100
   *   dailyBreakdown:    [ { date, completed, planned } ]  // optional
   * }
   */
  const completed   = data.completedWorkouts ?? data.completed        ?? 0;
  const total       = data.totalWorkouts     ?? data.planned          ?? 0;
  const rate        = data.complianceRate    ?? (total > 0 ? Math.round((completed / total) * 100) : 0);
  const daily       = data.dailyBreakdown    ?? data.days             ?? [];

  const rateColor   = rate >= 80 ? "#6ee7b7" : rate >= 50 ? "#fbbf24" : "#fb7bb8";
  const rateLabel   = rate >= 80 ? "Excelente 🔥" : rate >= 50 ? "Bien 💪" : "Sigue adelante ⚡";

  return `
    <div class="compliance-wrap">

      <!-- Hero metric -->
      <div class="compliance-hero card">
        <div class="compliance-ring-wrap">
          <svg class="compliance-ring" viewBox="0 0 120 120">
            <circle class="ring-track" cx="60" cy="60" r="52"/>
            <circle class="ring-fill"  cx="60" cy="60" r="52"
              stroke="${rateColor}"
              stroke-dasharray="${2 * Math.PI * 52}"
              stroke-dashoffset="${2 * Math.PI * 52 * (1 - rate / 100)}"
              data-rate="${rate}"/>
          </svg>
          <div class="compliance-ring-label">
            <span class="compliance-pct" style="color:${rateColor}">${rate}%</span>
            <span class="compliance-pct-sub">cumplimiento</span>
          </div>
        </div>
        <div class="compliance-hero-text">
          <p class="compliance-verdict">${rateLabel}</p>
          <p class="compliance-week">Semana del ${formatDate(weekStart)}</p>
          <div class="compliance-stats-row">
            <div class="compliance-stat">
              <span class="compliance-stat-num" style="color:#6ee7b7">${completed}</span>
              <span class="compliance-stat-lbl">completados</span>
            </div>
            <div class="compliance-stat-divider"></div>
            <div class="compliance-stat">
              <span class="compliance-stat-num">${total}</span>
              <span class="compliance-stat-lbl">planificados</span>
            </div>
            <div class="compliance-stat-divider"></div>
            <div class="compliance-stat">
              <span class="compliance-stat-num" style="color:#fb7bb8">${total - completed}</span>
              <span class="compliance-stat-lbl">pendientes</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Daily breakdown bar chart -->
      ${daily.length > 0 ? renderDailyBreakdown(daily) : ""}

    </div>
  `;
}

function renderDailyBreakdown(days) {
  const bars = days.map(d => {
    const pct   = d.planned > 0 ? Math.round((d.completed / d.planned) * 100) : 0;
    const color = d.completed >= d.planned && d.planned > 0
      ? "#6ee7b7"
      : d.completed > 0 ? "#fbbf24" : "rgba(255,255,255,0.10)";
    const label = new Date(d.date + "T00:00:00").toLocaleDateString("es-ES", { weekday: "short" });

    return `
      <div class="daily-bar-col">
        <div class="daily-bar-wrap">
          <div class="daily-bar-fill"
               style="height: ${Math.max(pct, 4)}%; background: ${color};"
               data-target="${Math.max(pct, 4)}">
          </div>
        </div>
        <span class="daily-bar-label">${label}</span>
        <span class="daily-bar-num">${d.completed}/${d.planned}</span>
      </div>
    `;
  }).join("");

  return `
    <div class="card compliance-chart-card">
      <p class="compliance-chart-title">Desglose diario</p>
      <div class="daily-bars">${bars}</div>
    </div>
  `;
}

function renderSkeleton() {
  return `
    <div class="compliance-wrap">
      <div class="card compliance-hero skeleton-card">
        <div class="skeleton-circle"></div>
        <div class="skeleton-lines">
          <div class="skeleton-line w60"></div>
          <div class="skeleton-line w40"></div>
          <div class="skeleton-line w80"></div>
        </div>
      </div>
    </div>
  `;
}

function renderError(msg) {
  return `<div class="compliance-error card"><p>⚠️ ${msg}</p></div>`;
}

// ── Animations ────────────────────────────────────────────────
function animateBars() {
  // Animate SVG ring
  const ring = document.querySelector(".ring-fill");
  if (ring) {
    const total   = 2 * Math.PI * 52;
    const rate    = Number(ring.dataset.rate);
    const target  = total * (1 - rate / 100);
    ring.style.transition = "stroke-dashoffset 1.1s cubic-bezier(0.16,1,0.3,1)";
    ring.style.strokeDashoffset = String(total); // start at 0%
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ring.style.strokeDashoffset = String(target);
      });
    });
  }

  // Animate bar heights
  document.querySelectorAll(".daily-bar-fill").forEach(bar => {
    const target = bar.dataset.target + "%";
    bar.style.height = "0%";
    bar.style.transition = "height 0.7s cubic-bezier(0.16,1,0.3,1)";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { bar.style.height = target; });
    });
  });
}

// ── Helpers ───────────────────────────────────────────────────
function formatDate(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long" });
}

window.loadCompliance = loadCompliance;