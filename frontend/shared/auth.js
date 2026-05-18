import { API } from "./api.js";

const authAPI = API.auth;

export function isValidRegistrationEmail(email) {
  return typeof email === "string" && email.includes("@");
}

export async function login(email, password) {
  return fetch(`${authAPI}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
}

export async function register(name, email, password) {
  return fetch(`${authAPI}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  });
}

