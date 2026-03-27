'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { detectCategory, categoryInterpretations } from './lib/tarot-categories';
import {
  getCurrentUser, loginUser, logoutUser,
  registerUser, saveSessionsForUser, getSessionsForUser,
} from './lib/auth';

const CATEGORY_LABELS = {
  love: '♥ Love', money: '✦ Money', health: '✦ Health',
  work: '✦ Work', relations: '✦ Relations', future: '✦ Future',
  choice: '✦ Choice', psychology: '✦ Psychology', general: '✦ General',
};

// ─── Auth Screen ──────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (mode === 'register') {
      const reg = registerUser(username.trim(), password);
      if (reg.error) { setError(reg.error); setLoading(false); return; }
    }
    const result = loginUser(username.trim(), password);
    if (result.error) { setError(result.error); setLoading(false); return; }
    onAuth(result.user);
    setLoading(false);
  }

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <div className="auth-glyph">✦</div>
        <h1 className="auth-heading">Aurora</h1>
        <p className="auth-sub">{mode === 'login' ? 'Enter the mystical realm' : 'Begin your journey'}</p>
        <div className="auth-tabs">
          <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}>Sign In</button>
          <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(''); }}>Register</button>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Username</label>
            <input className="auth-input" type="text" value={username}
              onChange={e => setUsername(e.target.value)} placeholder="your name…" autoFocus />
          </div>
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input className="auth-input" type="password" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? '…' : mode === 'login' ? 'Enter' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Infinite Deck ────────────────────────────────────────────────────────────
const TOTAL_CARDS = 20;
const CARD_W = 100;
const CARD_GAP = 18;
const CARD_STEP = CARD_W + CARD_GAP;
const ZONE = 0.22;

function InfiniteDeck({ onPick }) {
  const stageRef = useRef(null);
  const offsetRef = useRef(0);
  const speedRef = useRef(0);
  const rafRef = useRef(null);
  const cardRefs = useRef([]);
  const hoveredRef = useRef(null);
  const pickedRef = useRef(null);
  const [pickedIdx, setPickedIdx] = useState(null); // only for CSS class

  // Position cards directly via DOM — no React re-render per frame
  const positionCards = useCallback(() => {
    const totalW = TOTAL_CARDS * CARD_STEP;
    const centerOffset = -(totalW / 2);
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const raw = centerOffset + i * CARD_STEP + offsetRef.current;
      const x = ((raw % totalW) + totalW * 1.5) % totalW - totalW * 0.5;
      el.style.transform = `translateX(${x}px)`;
    });
  }, []);

  useEffect(() => {
    positionCards();
    function tick() {
      if (speedRef.current !== 0) {
        offsetRef.current += speedRef.current;
        positionCards();
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [positionCards]);

  const handleMouseMove = useCallback((e) => {
    if (pickedRef.current !== null || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const rel = (e.clientX - rect.left) / rect.width;
    if (rel < ZONE) {
      speedRef.current = ((ZONE - rel) / ZONE) * 6;
    } else if (rel > 1 - ZONE) {
      speedRef.current = -((rel - (1 - ZONE)) / ZONE) * 6;
    } else {
      speedRef.current = 0;
    }
  }, []);

  const handleMouseLeave = useCallback(() => { speedRef.current = 0; }, []);

  function handlePick(idx) {
    if (pickedRef.current !== null) return;
    pickedRef.current = idx;
    setPickedIdx(idx);
    speedRef.current = 0;
    setTimeout(() => {
      onPick();
    }, 300);
  }

  return (
    <div className="deck-wrap">
      <p className="deck-hint">← hover near the edges to scroll · click a card →</p>
      <div className="deck-clip">
        <div
          ref={stageRef}
          className="deck-stage"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="deck-cards-container">
            {Array.from({ length: TOTAL_CARDS }, (_, i) => (
              <div
                key={i}
                ref={el => cardRefs.current[i] = el}
                className={`icard ${pickedIdx === i ? 'icard-picked' : ''} ${pickedIdx !== null && pickedIdx !== i ? 'icard-fading' : ''}`}
                onMouseEnter={e => {
                  if (pickedRef.current !== null) return;
                  e.currentTarget.classList.add('icard-hovered');
                }}
                onMouseLeave={e => {
                  e.currentTarget.classList.remove('icard-hovered');
                }}
                onClick={() => handlePick(i)}
              >
                <div className="icard-face">
                  <div className="icard-back">
                    <span className="icard-symbol">✦</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [sessions, setSessions] = useState([[]]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDeck, setShowDeck] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const chat = sessions[activeIdx] ?? [];

  useEffect(() => {
    const u = getCurrentUser();
    if (u) {
      setUser(u);
      const saved = getSessionsForUser(u.username);
      setSessions(saved.length ? saved : [[]]);
    }
    setAuthReady(true);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, activeIdx, loading, showDeck]);

  useEffect(() => {
    if (user) saveSessionsForUser(user.username, sessions);
  }, [sessions, user]);

  function handleAuth(u) {
    setUser(u);
    const saved = getSessionsForUser(u.username);
    setSessions(saved.length ? saved : [[]]);
    setActiveIdx(0);
  }

  function handleLogout() {
    logoutUser(); setUser(null); setSessions([[]]); setActiveIdx(0); setShowUserMenu(false);
  }

  async function askQuestion() {
    if (loading || !question.trim() || showDeck) return;
    const q = question.trim();
    setQuestion('');
    // Add question bubble + show deck
    setSessions(prev => prev.map((s, i) =>
      i === activeIdx ? [...s, { question: q, card: null, interpretation: null, category: null, revealed: false }] : s
    ));
    setShowDeck(true);
  }

  async function handleCardPick() {
    // Fetch card NOW when user picks
    setShowDeck(false);
    setLoading(true);
    try {
      // get last turn's question
      const lastQ = sessions[activeIdx].at(-1)?.question ?? '';
      const res = await fetch('/api/draw', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: lastQ }) });
      if (!res.ok) throw new Error();
      const card = await res.json();
      const category = detectCategory(lastQ);
      const cardInterps = categoryInterpretations[card.card_name];
      const interpretation = cardInterps ? cardInterps[category] : card.interpretation;
      // Reveal into last turn
      setSessions(prev => prev.map((s, i) => {
        if (i !== activeIdx) return s;
        const updated = [...s];
        updated[updated.length - 1] = { ...updated[updated.length - 1], card, interpretation, category, revealed: true };
        return updated;
      }));
    } catch { alert('Something went wrong — the cards are silent.'); }
    finally { setLoading(false); setTimeout(() => inputRef.current?.focus(), 100); }
  }

  function newSession() {
    setSessions(prev => [...prev, []]);
    setActiveIdx(prev => prev + 1);
    setQuestion('');
    setShowDeck(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function deleteSession(i, e) {
    e.stopPropagation();
    setSessions(prev => {
      if (prev.length === 1) return [[]];
      const next = prev.filter((_, idx) => idx !== i);
      setActiveIdx(ai => {
        if (ai === i) return Math.max(0, i - 1);
        if (ai > i) return ai - 1;
        return ai;
      });
      return next;
    });
  }

  function handleKey(e) { if (e.key === 'Enter') askQuestion(); }

  function sessionLabel(session) {
    if (session.length === 0) return 'New reading';
    const q = session[0].question;
    return q.length > 34 ? q.slice(0, 34) + '…' : q;
  }

  if (!authReady) return null;
  if (!user) return <AuthScreen onAuth={handleAuth} />;

  return (
    <div className="app-layout" onClick={() => showUserMenu && setShowUserMenu(false)}>

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="sidebar-header">
          <span className="sidebar-title">✦ Aurora</span>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(o => !o)}>←</button>
        </div>
        <button className="new-session-btn" onClick={newSession}>+ New Question</button>
        <div className="sidebar-history">
          {[...sessions].reverse().map((s, ri) => {
            const i = sessions.length - 1 - ri;
            return (
              <div key={i}
                className={`history-item ${i === activeIdx ? 'history-item-active' : ''}`}
                onClick={() => setActiveIdx(i)}>
                <span className="history-label">{sessionLabel(s)}</span>
                <div className="history-right">
                  {s.length > 0 && <span className="history-count">{s.length}</span>}
                  <button className="history-delete" onClick={e => deleteSession(i, e)} title="Delete">×</button>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main-area">
        <div className="main-header">
          {!sidebarOpen && (
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(true)}>→</button>
          )}
          <h1>✦ Tarot Reader ✦</h1>
          <div className="user-menu-wrap" onClick={e => e.stopPropagation()}>
            <button className="user-pill" onClick={() => setShowUserMenu(m => !m)}>
              <span className="user-pill-avatar">{user.username[0].toUpperCase()}</span>
              <span className="user-pill-name">{user.username}</span>
              <span className="user-pill-chevron">{showUserMenu ? '▲' : '▼'}</span>
            </button>
            {showUserMenu && (
              <div className="user-dropdown">
                <p className="dropdown-name">{user.username}</p>
                <p className="dropdown-stats">
                  {sessions.reduce((n, s) => n + s.length, 0)} readings · {sessions.filter(s => s.length > 0).length} sessions
                </p>
                <hr className="dropdown-hr" />
                <button className="dropdown-logout" onClick={handleLogout}>Sign Out</button>
              </div>
            )}
          </div>
        </div>

        <div className="chat-log">
          {chat.length === 0 && !loading && !showDeck && (
            <div className="chat-empty-state">
              <p className="chat-empty-title">What do the cards hold for you?</p>
              <p className="chat-empty-sub">Ask about love, money, health, work or relationships</p>
            </div>
          )}

          {chat.map((turn, i) => (
            <div key={i} className="chat-turn">
              <div className="bubble-row user-row">
                <div className="user-bubble">{turn.question}</div>
              </div>
              {turn.revealed && turn.card && (
                <div className="bubble-row card-row">
                  <div className="card-bubble card-reveal-anim">
                    <img src={`/images/${turn.card.card_name.replace(/\s/g, '-')}.png`}
                      alt={turn.card.card_name} className="chat-card-img"
                      onError={e => { e.target.style.display = 'none'; }} />
                    <span className="chat-card-category">{CATEGORY_LABELS[turn.category]}</span>
                    <span className="chat-card-arcana">{turn.card.arcana} Arcana</span>
                    <h3 className="chat-card-name">{turn.card.card_name}</h3>
                    <hr className="chat-card-divider" />
                    <p className="chat-card-interp">{turn.interpretation}</p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {showDeck && <InfiniteDeck onPick={handleCardPick} />}

          {loading && (
            <div className="bubble-row card-row">
              <div className="card-bubble loading-bubble">
                <span className="dot"/><span className="dot"/><span className="dot"/>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input-row">
          <input ref={inputRef} className="question-input" type="text"
            placeholder="Ask the cards…" value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={handleKey} disabled={loading || showDeck} />
          <button className="send-btn" onClick={askQuestion} disabled={loading || !question.trim() || showDeck}>↑</button>
        </div>
      </main>
    </div>
  );
}