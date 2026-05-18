import { login, register, isValidRegistrationEmail } from "../shared/auth.js";
import { API } from "../shared/api.js";
import { getCurrentUser, setCurrentUser, clearCurrentUser } from "../shared/session.js";

const usersAPI = API.users;

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  const user = getCurrentUser();

  // ⚠️ IMPORTANTE: no redirigir si estás en users.html
  // solo si quieres proteger páginas internas
  if (user && window.location.pathname.includes("users.html")) {
    renderAuthState();
    loadUsers();
  } else {
    renderAuthState();
    loadUsers();
  }
});

/* =========================
   REGISTER
========================= */

async function createUser(event) {
  if (event) event.preventDefault();

  const nameInput = document.getElementById("registerName");
  const emailInput = document.getElementById("registerEmail");
  const passwordInput = document.getElementById("registerPassword");

  if (!nameInput || !emailInput || !passwordInput) {
    alert("Formulario de registro no disponible");
    return;
  }

  if (!isValidRegistrationEmail(emailInput.value.trim())) {
    alert("El correo debe incluir @");
    emailInput.focus();
    return;
  }

  try {
    const res = await register(
      nameInput.value.trim(),
      emailInput.value.trim(),
      passwordInput.value
    );

    if (!res.ok) {
      alert("Error al registrarse");
      return;
    }

    const user = await res.json();
    setCurrentUser(user);
    window.location.href = "../goals/goals.html";
  } catch (error) {
    console.error("Error de red en registro", error);
    alert("No se pudo conectar con el servidor");
  }
}

/* =========================
   LOGIN
========================= */

async function loginUser(event) {
  if (event) event.preventDefault();

  try {
    const res = await login(
      document.getElementById("loginEmail").value,
      document.getElementById("loginPassword").value
    );

    if (!res.ok) {
      alert("Email o contraseña incorrectos");
      return;
    }

    const user = await res.json();
    setCurrentUser(user);

    window.location.href = user.hasGoals
      ? "../home/home.html"
      : "../goals/goals.html";
  } catch (error) {
    console.error("Error de red en login", error);
    alert("No se pudo conectar con el servidor");
  }
}

/* =========================
   TOGGLE LOGIN / REGISTER
========================= */

function showLogin() {
  document.getElementById("loginForm")?.classList.remove("hidden");
  document.getElementById("registerForm")?.classList.add("hidden");
}

function showRegister() {
  document.getElementById("registerForm")?.classList.remove("hidden");
  document.getElementById("loginForm")?.classList.add("hidden");
}

/* botones */
document.getElementById("showLogin")?.addEventListener("click", showLogin);
document.getElementById("showRegister")?.addEventListener("click", showRegister);
document.getElementById("goLogin")?.addEventListener("click", showLogin);
document.getElementById("goRegister")?.addEventListener("click", showRegister);

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
  if (!container) return;

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
   SESSION UI
========================= */

function renderAuthState() {
  const currentUser = getCurrentUser();
  const authStatus = document.getElementById("auth-status");

  if (!authStatus) return;

  authStatus.textContent = currentUser
    ? `Conectado como ${currentUser.name}`
    : "No hay sesión activa";
}

/* =========================
   GLOBALS (HTML onclick)
========================= */

window.createUser = createUser;
window.loginUser = loginUser;
window.logoutUser = () => {
  clearCurrentUser();
  location.reload();
};
window.searchUser = async function () {
  const email = document.getElementById("searchEmail").value;

  const res = await fetch(`${usersAPI}/email/${email}`);
  if (!res.ok) return render([]);

  const user = await res.json();
  render([user]);
};