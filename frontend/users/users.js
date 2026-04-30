
const usersAPI = API.users;
const authAPI = API.auth;

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
      <button onclick="deleteUser(${u.id})">Delete</button>
    `;

    container.appendChild(card);
  });
}

async function createUser() {
  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  const res = await fetch(`${authAPI}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  });

  if (!res.ok) {
    const message = await res.text();
    alert(`Register failed: ${message}`);
    return;
  }

  const user = await res.json();
  setCurrentUser(user);

  // 🔥 siempre primera vez → goals
  window.location.href = "/goals/goals.html";
}

async function loginUser() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const res = await fetch(`${authAPI}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    alert("Login failed");
    return;
  }

  const user = await res.json();
  setCurrentUser(user);

  if (!user.hasGoals) {
    window.location.href = "/goals/goals.html";
  } else {
    window.location.href = "index.html";
  }
}

async function deleteUser(id) {
  await fetch(`${usersAPI}/${id}`, { method: "DELETE" });
  loadUsers();
}

async function searchUser() {
  const email = document.getElementById("searchEmail").value;

  const res = await fetch(`${API_URL}/users/email/${email}`);
  if (!res.ok) {
    render([]);
    return;
  }

  const user = await res.json();
  render([user]);
}

function logoutUser() {
  clearCurrentUser();
  renderAuthState();
}

function renderAuthState() {
  const currentUser = getCurrentUser();
  const authStatus = document.getElementById("auth-status");

  authStatus.textContent = currentUser
    ? `Logged in as ${currentUser.name} (${currentUser.email})`
    : "No active session";
}

function registerUser() {
  return createUser();
}

renderAuthState();
loadUsers();