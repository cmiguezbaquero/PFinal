const exercisesAPI = API.exercises;
const workoutsAPI = API.workouts;
const routinesAPI = API.routines;

let selectedExercises = [];
let currentUser = null;

function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}

async function loadExercises() {
  const userId = currentUser ? currentUser.id : 0;
  const res = await fetch(`${exercisesAPI}/available/${userId}`);
  if (!res.ok) {
    return;
  }

  const exercises = await res.json();

  const container = document.getElementById("exerciseList");
  container.innerHTML = "";

  exercises.forEach(e => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h4>${e.name}</h4>
      <p>${e.muscleGroup}</p>
      <button onclick="addExercise(${e.id}, ${JSON.stringify(e.name)})">Add</button>
    `;

    container.appendChild(div);
  });
}

function addExercise(id, name) {
  selectedExercises.push({
    exercise: { id },
    sets: 3,
    reps: 10,
    weight: 0,
    name
  });

  renderSelected();
}

function renderSelected() {
  const container = document.getElementById("selectedList");
  container.innerHTML = "";

  selectedExercises.forEach((e, index) => {
    const div = document.createElement("div");

    div.innerHTML = `
      <h4>${e.name}</h4>
      <input type="number" value="${e.sets}" onchange="update(${index}, 'sets', this.value)">
      <input type="number" value="${e.reps}" onchange="update(${index}, 'reps', this.value)">
      <input type="number" value="${e.weight}" onchange="update(${index}, 'weight', this.value)">
      <button onclick="removeExercise(${index})">❌</button>
    `;

    container.appendChild(div);
  });
}

function update(index, field, value) {
  selectedExercises[index][field] = Number(value);
}

function removeExercise(index) {
  selectedExercises.splice(index, 1);
  renderSelected();
}

async function createWorkout() {
  if (!currentUser) {
    alert("Please login first from Users page.");
    return;
  }

  const description = document.getElementById("description").value;
  const plannedDate = document.getElementById("plannedDate").value || getTodayISO();

  const body = {
    description,
    user: { id: Number(currentUser.id) },
    plannedDate,
    exercises: selectedExercises.map(e => ({
      exercise: { id: e.exercise.id },
      sets: e.sets,
      reps: e.reps,
      weight: e.weight
    }))
  };

  await fetch(workoutsAPI, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  alert("🔥 Workout created!");

  selectedExercises = [];
  renderSelected();
}

async function createCustomExercise() {
  if (!currentUser) {
    alert("Please login first from Users page.");
    return;
  }

  const name = document.getElementById("customExerciseName").value;
  const muscleGroup = document.getElementById("customExerciseMuscle").value;
  const description = document.getElementById("customExerciseDescription").value;
  const shared = document.getElementById("customExerciseShared").checked;

  const res = await fetch(exercisesAPI, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, muscleGroup, description, ownerId: currentUser.id, shared })
  });

  if (!res.ok) {
    const message = await res.text();
    alert(`Could not create exercise: ${message}`);
    return;
  }

  await loadExercises();
}

async function generateWeeklyPlan() {
  if (!currentUser) {
    alert("Please login first from Users page.");
    return;
  }

  const weekStart = document.getElementById("weekStart").value;
  if (!weekStart) {
    alert("Select a week start date first.");
    return;
  }

  const res = await fetch(`${routinesAPI}/weekly/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: currentUser.id, weekStart })
  });

  if (!res.ok) {
    const message = await res.text();
    alert(`Could not generate plan: ${message}`);
    return;
  }

  alert("Weekly plan generated.");
}

function init() {
  currentUser = getCurrentUser();
  const currentUserInfo = document.getElementById("currentUserInfo");
  if (!currentUser) {
    currentUserInfo.textContent = "Login from the Users page first.";
    return;
  }

  currentUserInfo.textContent = `${currentUser.name} (${currentUser.email})`;
  document.getElementById("plannedDate").value = getTodayISO();
  loadExercises();
}

init();
