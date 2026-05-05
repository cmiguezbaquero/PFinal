import { API } from "../shared/api.js";
import { getCurrentUser, setCurrentUser, clearCurrentUser } from "../shared/session.js";

const usersAPI = API.users;
const authAPI = API.auth;

/* =========================
   USERS LIST
========================= */

async function loadUsers() {
  const res = await fetch(usersAPI);
  if (!res.ok) return;

  const users = await res.json();
  render(users);
}

function render(users) {
  const container = document.getElementById("users-container");
  container.innerHTML = "";

  users.forEach(u => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${u.name}</h3>
      <p>${u.email}</p>
    `;

    container.appendChild(card);
  });
}

/* =========================
   AUTH
========================= */
async function createUser() {
  const res = await fetch(`${authAPI}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: document.getElementById("registerName").value,
      email: document.getElementById("registerEmail").value,
      password: document.getElementById("registerPassword").value
    })
  });

  if (!res.ok) {
    alert(await res.text());
    return;
  }

  const user = await res.json();
  setCurrentUser(user);

  window.location.href = "../goals/goals.html";
}

async function loginUser() {
  const res = await fetch(`${authAPI}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: document.getElementById("loginEmail").value,
      password: document.getElementById("loginPassword").value
    })
  });

  if (!res.ok) {
    alert("Login failed");
    return;
  }

  const user = await res.json();
  setCurrentUser(user);

  window.location.href = user.hasGoals
    ? "../index.html"
    : "../goals/goals.html";
}

async function deleteUser(id) {
  await fetch(`${usersAPI}/${id}`, { method: "DELETE" });
  loadUsers();
}

async function searchUser() {
  const email = document.getElementById("searchEmail").value;

  const res = await fetch(`${usersAPI}/email/${email}`);

  if (!res.ok) {
    render([]);
    return;
  }

  const user = await res.json();
  render([user]);
}

/* =========================
   SESSION
========================= */

function logoutUser() {
  clearCurrentUser();
  renderAuthState();
}

function renderAuthState() {
  const currentUser = getCurrentUser();
  const authStatus = document.getElementById("auth-status");

  if (!authStatus) return;

  authStatus.textContent = currentUser
    ? `Logged in as ${currentUser.name} (${currentUser.email})`
    : "No active session";
}

/* =========================
   EXPORT TO HTML (LEGACY BRIDGE)
========================= */

window.createUser = createUser;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.searchUser = searchUser;
window.loadUsers = loadUsers;

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  renderAuthState();
  loadUsers();
});