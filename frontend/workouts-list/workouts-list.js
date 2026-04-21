const workoutsAPI = API.workouts;
const sessionsAPI = API.sessions;

let currentUser = null;

function getWeekStartISO() {
  const input = document.getElementById("weekStart").value;
  if (input) {
    return input;
  }

  const now = new Date();
  const day = now.getDay();
  const diffToMonday = (day + 6) % 7;
  now.setDate(now.getDate() - diffToMonday);
  return now.toISOString().slice(0, 10);
}

async function loadWorkouts() {
  if (!currentUser) {
    document.getElementById("compliance").textContent = "Login from Users page first.";
    render([]);
    return;
  }

  const weekStart = getWeekStartISO();
  document.getElementById("weekStart").value = weekStart;

  const [workoutsRes, complianceRes] = await Promise.all([
    fetch(`${workoutsAPI}/user/${currentUser.id}/week/${weekStart}`),
    fetch(`${sessionsAPI}/compliance/user/${currentUser.id}/week/${weekStart}`)
  ]);

  const workouts = workoutsRes.ok ? await workoutsRes.json() : [];
  const compliance = complianceRes.ok ? await complianceRes.json() : { planned: 0, completed: 0, percentage: 0 };

  document.getElementById("compliance").textContent =
    `Compliance: ${compliance.completed}/${compliance.planned} (${compliance.percentage.toFixed(1)}%)`;

  render(workouts);
}

function render(workouts) {
  const container = document.getElementById("container");
  container.innerHTML = "";

  workouts.forEach(w => {
    const card = document.createElement("div");
    card.className = "card";

    const exercisesHTML = w.exercises.map(e => `
      <div style="margin-left:10px; margin-top:5px;">
        🔹 ${e.exercise.name} 
        (${e.sets}x${e.reps} - ${e.weight}kg)
      </div>
    `).join("");

    card.innerHTML = `
      <h3>💪 ${w.description || "Workout"}</h3>
      <p>📅 ${w.plannedDate || "No planned date"}</p>
      <p>✅ ${w.completed ? "Completed" : "Pending"}</p>
      <button onclick="markCompleted(${w.id}, ${!w.completed})">
        ${w.completed ? "Mark as pending" : "Mark as completed"}
      </button>
      <button class="btn-secondary" onclick="toggle(this)">Show exercises</button>
      
      <div class="details" style="display:none;">
        ${exercisesHTML || "<p>No exercises</p>"}
      </div>
    `;

    container.appendChild(card);
  });
}

function toggle(btn) {
  const details = btn.nextElementSibling;

  if (details.style.display === "none") {
    details.style.display = "block";
    btn.textContent = "Hide exercises";
  } else {
    details.style.display = "none";
    btn.textContent = "Show exercises";
  }
}

async function markCompleted(id, completed) {
  await fetch(`${workoutsAPI}/${id}/completion?completed=${completed}`, { method: "PUT" });
  loadWorkouts();
}

function init() {
  currentUser = getCurrentUser();
  document.getElementById("weekStart").value = getWeekStartISO();
  loadWorkouts();
}

init();
