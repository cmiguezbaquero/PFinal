import { getCurrentUser, clearCurrentUser } from "../shared/session.js";

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const user = getCurrentUser();

  if (!user) {
    window.location.href = "../index.html";
    return;
  }

  document.getElementById("welcomeText").innerText =
    `Welcome back, ${user.name}`;

  loadCalendar();
  loadWorkouts();
  loadProgress();
});

/* =========================
   NAV
========================= */
function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

window.showSection = showSection;

/* =========================
   CALENDAR (simple mock)
========================= */
function loadCalendar() {
  const calendar = document.getElementById("calendar");

  for (let i = 1; i <= 14; i++) {
    const day = document.createElement("div");
    day.classList.add("day");
    day.innerText = i;
    calendar.appendChild(day);
  }
}

/* =========================
   WORKOUTS
========================= */
let draggedItem = null;

function loadWorkouts() {
  const container = document.getElementById("workoutList");

  const workouts = [
    { name: "Push Ups", reps: "3x12", done: false },
    { name: "Squats", reps: "4x10", done: false },
    { name: "Pull Ups", reps: "3x8", done: false },
    { name: "Plank", reps: "60 sec", done: false },
    { name: "Burpees", reps: "3x15", done: false }
  ];

  container.innerHTML = "";

  workouts.forEach((w, index) => {
    const card = document.createElement("div");
    card.classList.add("exercise-card");
    card.setAttribute("draggable", true);
    card.dataset.index = index;

    card.innerHTML = `
      <strong>${w.name}</strong>
      <span>${w.reps}</span>

      <span class="status ${w.done ? "done" : "pending"}">
        ${w.done ? "Done" : "Pending"}
      </span>

      <button onclick="toggleDone(this)">Complete</button>
    `;

    /* DRAG START */
    card.addEventListener("dragstart", () => {
      draggedItem = card;
      setTimeout(() => card.classList.add("dragging"), 0);
    });

    /* DRAG END */
    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      draggedItem = null;
    });

    container.appendChild(card);
  });

  enableDrag(container);
}

/* =========================
   PROGRESS
========================= */
function loadProgress() {
  const done = 3;
  document.getElementById("sessionsDone").innerText = done;

  document.getElementById("progressFill").style.width =
    (done / 7) * 100 + "%";
}

function enableDrag(container) {
  container.addEventListener("dragover", (e) => {
    e.preventDefault();

    const afterElement = getDragAfterElement(container, e.clientY);
    const draggable = document.querySelector(".dragging");

    if (!draggable) return;

    if (afterElement == null) {
      container.appendChild(draggable);
    } else {
      container.insertBefore(draggable, afterElement);
    }
  });
}

function getDragAfterElement(container, y) {
  const elements = [...container.querySelectorAll(".exercise-card:not(.dragging)")];

  return elements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;

    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

window.toggleDone = (btn) => {
  const card = btn.parentElement;
  const status = card.querySelector(".status");

  if (status.classList.contains("done")) {
    status.classList.remove("done");
    status.classList.add("pending");
    status.innerText = "Pending";
  } else {
    status.classList.remove("pending");
    status.classList.add("done");
    status.innerText = "Done";
  }
};

/* =========================
   ACTIONS
========================= */
window.completeWorkout = (name) => {
  alert(`${name} completed 💪`);
};

window.logout = () => {
  clearCurrentUser();
  window.location.href = "../index.html";
};