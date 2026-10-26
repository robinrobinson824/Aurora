// Errors are returned as i18n keys (see lib/i18n.js)
// ─── Auth helpers (localStorage) ─────────────────────────────────────────────
// Структура: tarot_users = { username: { username, passwordHash, sessions, createdAt } }
// Сессия:    tarot_session = username

export const START_RUBIES = 1000;

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
  if (!username || username.length < 2) return { error: 'errUserShort' };
  if (!password || password.length < 4) return { error: 'errPassShort' };
  const users = getAllUsers();
  if (users[username]) return { error: 'errTaken' };
  users[username] = {
    username,
    passwordHash: hashPassword(password),
    sessions: [],
    rubies: START_RUBIES,
    createdAt: new Date().toISOString(),
  };
  saveAllUsers(users);
  return { success: true };
}

export function loginUser(username, password) {
  const users = getAllUsers();
  const user = users[username];
  if (!user) return { error: 'errNoUser' };
  if (user.passwordHash !== hashPassword(password)) return { error: 'errWrongPass' };
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

// ─── Rubies ──────────────────────────────────────────────────────────────────
// Accounts created before rubies existed get START_RUBIES on first read.
export function getRubies(username) {
  const users = getAllUsers();
  const u = users[username];
  if (!u) return 0;
  return typeof u.rubies === 'number' ? u.rubies : START_RUBIES;
}

// Adds delta (can be negative). Returns the new balance, or null if it would go below 0.
export function addRubies(username, delta) {
  const users = getAllUsers();
  const u = users[username];
  if (!u) return null;
  const cur = typeof u.rubies === 'number' ? u.rubies : START_RUBIES;
  const next = cur + delta;
  if (next < 0) return null;
  u.rubies = next;
  saveAllUsers(users);
  return next;
}
