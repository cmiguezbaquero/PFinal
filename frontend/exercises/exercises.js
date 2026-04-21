const API_URL = API.exercises;

let allExercises = [];

/* LOAD */
async function loadExercises() {
  const res = await fetch(API_URL);
  const data = await res.json();

  allExercises = data;
  render(data);
}

/* RENDER */
function render(exercises) {
  const container = document.getElementById("container");
  container.innerHTML = "";

  exercises.forEach(e => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${e.name}</h3>
      <p>🔥 ${e.muscleGroup}</p>
      <p>${e.description}</p>
      <button onclick="deleteExercise(${e.id})">Delete</button>
    `;

    container.appendChild(card);
  });
}

/* CREATE */
async function createExercise() {
  const name = document.getElementById("name").value;
  const muscleGroup = document.getElementById("muscle").value;
  const description = document.getElementById("description").value;

  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, muscleGroup, description })
  });

  loadExercises();
}

/* DELETE */
async function deleteExercise(id) {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  loadExercises();
}

/* FILTER */
function filter(group) {
  if (group === "ALL") {
    render(allExercises);
  } else {
    const filtered = allExercises.filter(e => e.muscleGroup === group);
    render(filtered);
  }
}

/* INIT */
loadExercises();