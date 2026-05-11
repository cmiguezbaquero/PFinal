import { API } from "./shared/api.js";
import { setCurrentUser, getCurrentUser } from "./shared/session.js";

const authAPI = API.auth;

/* =========================
   AUTO CHECK (SOLO REDIRECT SI YA LOGUEADO)
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const user = getCurrentUser();

  // 🔥 SI NO HAY USER, QUEDARSE EN INDEX (LOGIN)
  if (!user) return;

  // 🔥 SI HAY USER, DECIDIR RUTA
  if (user.hasGoals) {
    window.location.href = "./home/home.html";
  } else {
    window.location.href = "./goals/goals.html";
  }
});

/* =========================
   LOGIN
========================= */
async function loginUser() {
  const res = await fetch(`${authAPI}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: loginEmail.value,
      password: loginPassword.value
    })
  });

  if (!res.ok) {
    alert("Login incorrecto");
    return;
  }

  const user = await res.json();
  setCurrentUser(user);

  console.log("LOGIN USER:", user);

  // 🔥 FLUJO CORRECTO
  if (user.hasGoals) {
    window.location.href = "./home/home.html";
  } else {
    window.location.href = "./goals/goals.html";
  }
}

/* =========================
   REGISTER
========================= */
async function createUser() {
  const res = await fetch(`${authAPI}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: registerName.value,
      email: registerEmail.value,
      password: registerPassword.value
    })
  });

  if (!res.ok) {
    alert("Error registro");
    return;
  }

  const user = await res.json();
  setCurrentUser(user);

  // 🔥 NUEVO USUARIO → SIEMPRE GOALS
  window.location.href = "./goals/goals.html";
}

/* =========================
   UI TOGGLE
========================= */
function showLogin() {
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
}

function showRegister() {
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
}

/* GLOBAL */
window.loginUser = loginUser;
window.createUser = createUser;
window.showLogin = showLogin;
window.showRegister = showRegister;