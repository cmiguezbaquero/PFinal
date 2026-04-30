function getWeekStartISO() {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = (day + 6) % 7;
  now.setDate(now.getDate() - diffToMonday);
  return now.toISOString().slice(0, 10);
}

async function loadDashboard() {
  const currentUser = getCurrentUser();
  const homeUser = document.getElementById("homeUser");

  if (!currentUser) {
    homeUser.textContent = "Login from Users page to see your dashboard.";
    return;
  }

  homeUser.textContent = `Welcome ${currentUser.name}`;

  const weekStart = getWeekStartISO();
  const [routinesRes, workoutsRes, complianceRes] = await Promise.all([
    fetch(`${API.routines}/user/${currentUser.id}`),
    fetch(`${API.workouts}/user/${currentUser.id}/week/${weekStart}`),
    fetch(`${API.sessions}/compliance/user/${currentUser.id}/week/${weekStart}`)
  ]);

  const routines = routinesRes.ok ? await routinesRes.json() : [];
  const workouts = workoutsRes.ok ? await workoutsRes.json() : [];

  const compliance = complianceRes.ok
    ? await complianceRes.json()
    : { planned: 0, completed: 0, percentage: 0 };

  document.getElementById("activePlans").textContent =
    `Active Plans: ${routines.length}`;

  document.getElementById("weeklyWorkouts").textContent =
    `Weekly Workouts: ${workouts.length}`;

  // 🔥 FIX IMPORTANTE
  const percentage = compliance.percentage ?? 0;

  document.getElementById("complianceCard").textContent =
    `Compliance: ${compliance.completed}/${compliance.planned} (${percentage.toFixed(1)}%)`;
}

loadDashboard();
