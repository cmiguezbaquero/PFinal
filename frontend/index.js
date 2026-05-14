import { API } from "./shared/api.js";
import { setCurrentUser, getCurrentUser } from "./shared/session.js";

const authAPI = API.auth;

function isValidRegistrationEmail(email) {
  return typeof email === "string" && email.includes("@");
}

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
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");

  if (!emailInput || !passwordInput) {
    alert("Formulario de login no disponible");
    return;
  }

  try {
    const res = await fetch(`${authAPI}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailInput.value,
        password: passwordInput.value
      })
    });

    if (!res.ok) {
      alert("Login incorrecto");
      return;
    }

    const user = await res.json();
    setCurrentUser(user);

    if (user.hasGoals) {
      window.location.href = "./home/home.html";
    } else {
      window.location.href = "./goals/goals.html";
    }
  } catch (error) {
    console.error("Error de red en login", error);
    alert("No se pudo conectar con el servidor. Comprueba que el backend está en http://localhost:8080");
  }
}

/* =========================
   REGISTER
========================= */
async function createUser() {
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
    const res = await fetch(`${authAPI}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value
      })
    });

    if (!res.ok) {
      alert("Error registro");
      return;
    }

    const user = await res.json();
    setCurrentUser(user);

    window.location.href = "./goals/goals.html";
  } catch (error) {
    console.error("Error de red en registro", error);
    alert("No se pudo conectar con el servidor. Comprueba que el backend está en http://localhost:8080");
  }
}

/* =========================
   UI TOGGLE
========================= */
function showLogin() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  loginForm?.classList.remove('hidden');
  registerForm?.classList.add('hidden');
}

function showRegister() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  registerForm?.classList.remove('hidden');
  loginForm?.classList.add('hidden');
}

/* GLOBAL */
window.loginUser = loginUser;
window.createUser = createUser;
window.showLogin = showLogin;
window.showRegister = showRegister;