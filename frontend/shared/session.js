const KEY = "currentUser";

export function getCurrentUser() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setCurrentUser(user) {
  localStorage.setItem(KEY, JSON.stringify(user));
}

export function clearCurrentUser() {
  localStorage.removeItem(KEY);
}