// ─── Auth helpers (localStorage) ─────────────────────────────────────────────
// Структура: tarot_users = { username: { username, passwordHash, sessions, createdAt } }
// Сессия:    tarot_session = username

function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

function getAllUsers() {
  try { return JSON.parse(localStorage.getItem('tarot_users') || '{}'); }
  catch { return {}; }
}

function saveAllUsers(users) {
  localStorage.setItem('tarot_users', JSON.stringify(users));
}

export function registerUser(username, password) {
  if (!username || username.length < 2) return { error: 'Username must be at least 2 characters.' };
  if (!password || password.length < 4) return { error: 'Password must be at least 4 characters.' };
  const users = getAllUsers();
  if (users[username]) return { error: 'Username already taken.' };
  users[username] = {
    username,
    passwordHash: hashPassword(password),
    sessions: [],
    createdAt: new Date().toISOString(),
  };
  saveAllUsers(users);
  return { success: true };
}

export function loginUser(username, password) {
  const users = getAllUsers();
  const user = users[username];
  if (!user) return { error: 'User not found.' };
  if (user.passwordHash !== hashPassword(password)) return { error: 'Incorrect password.' };
  localStorage.setItem('tarot_session', username);
  return { success: true, user };
}

export function logoutUser() {
  localStorage.removeItem('tarot_session');
}

export function getCurrentUser() {
  const username = localStorage.getItem('tarot_session');
  if (!username) return null;
  const users = getAllUsers();
  return users[username] || null;
}

export function saveSessionsForUser(username, sessions) {
  const users = getAllUsers();
  if (!users[username]) return;
  users[username].sessions = sessions;
  saveAllUsers(users);
}

export function getSessionsForUser(username) {
  const users = getAllUsers();
  return users[username]?.sessions || [[]];
}
