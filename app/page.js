'use client';

import { useState, useRef, useEffect, useCallback, useId } from 'react';
import { detectCategory } from './lib/tarot-categories';
import { LANGS, DEFAULT_LANG, LANG_LABELS, CATEGORY_LABELS, t, cardName, arcanaLabel, interpretation, rubyWord, RUBY_PACKS, SPREADS, CURRENCY, discountPct } from './lib/i18n';
import {
  getCurrentUser, loginUser, logoutUser,
  registerUser, saveSessionsForUser, getSessionsForUser, getRubies, addRubies,
} from './lib/auth';


// ─── Language switcher ────────────────────────────────────────────────────────
function LangSwitch({ lang, setLang }) {
  return (
    <div className="lang-switch" role="group" aria-label={t(lang, 'language')}>
      {LANGS.map(l => (
        <button key={l} type="button"
          className={`lang-btn ${l === lang ? 'lang-btn-active' : ''}`}
          onClick={() => setLang(l)}>{LANG_LABELS[l]}</button>
      ))}
    </div>
  );
}

// ─── Ruby gem (faceted SVG) ───────────────────────────────────────────────────
function Ruby({ size = 24, sparkle = false, className = '' }) {
  const id = useId().replace(/:/g, '');
  const g = (n) => `url(#${id}${n})`;
  return (
    <svg className={`ruby ${sparkle ? 'ruby-sparkle' : ''} ${className}`} width={size} height={size}
      viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}a`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff9fb2" /><stop offset="1" stopColor="#e0244f" />
        </linearGradient>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffc2cf" /><stop offset="1" stopColor="#f0386b" />
        </linearGradient>
        <linearGradient id={`${id}c`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c4153f" /><stop offset="1" stopColor="#7d0a29" />
        </linearGradient>
        <linearGradient id={`${id}d`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e0244f" /><stop offset="1" stopColor="#5e0720" />
        </linearGradient>
        <linearGradient id={`${id}e`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a50f33" /><stop offset="1" stopColor="#4a0519" />
        </linearGradient>
        <radialGradient id={`${id}glow`} cx="0.5" cy="0.45" r="0.6">
          <stop offset="0" stopColor="#ff4d79" stopOpacity="0.55" /><stop offset="1" stopColor="#ff4d79" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="31" fill={g('glow')} />
      {/* crown */}
      <polygon points="4,24 18,8 18,24" fill={g('a')} />
      <polygon points="18,8 46,8 46,24 18,24" fill={g('b')} />
      <polygon points="46,8 60,24 46,24" fill={g('c')} />
      {/* pavilion */}
      <polygon points="4,24 18,24 32,58" fill={g('c')} />
      <polygon points="18,24 32,24 32,58" fill={g('a')} />
      <polygon points="32,24 46,24 32,58" fill={g('d')} />
      <polygon points="46,24 60,24 32,58" fill={g('e')} />
      {/* edges + highlights */}
      <g fill="none" stroke="#ffd9e1" strokeOpacity="0.55" strokeWidth="1" strokeLinejoin="round">
        <polygon points="18,8 46,8 60,24 32,58 4,24" />
        <polyline points="4,24 60,24" /><polyline points="18,8 18,24 32,58" /><polyline points="46,8 46,24 32,58" />
        <polyline points="32,24 32,58" />
      </g>
      <polygon points="22,11 30,11 27,21 20,21" fill="#fff" fillOpacity="0.38" />
      <path className="ruby-star" d="M50 6 L51.6 10.4 L56 12 L51.6 13.6 L50 18 L48.4 13.6 L44 12 L48.4 10.4Z" fill="#fff" />
    </svg>
  );
}

// ─── Ruby shop ────────────────────────────────────────────────────────────────
// How many gems to draw on each pack card
const PACK_GEMS = { 5: [38], 20: [34, 44, 34], 50: [28, 36, 46, 36, 28] };

function RubyShop({ lang, balance, onBuy, onClose, notice }) {
  return (
    <div className="shop-overlay" onClick={onClose}>
      <div className="shop-modal" onClick={e => e.stopPropagation()}>
        <button className="shop-close" onClick={onClose} aria-label={t(lang, 'close')}>×</button>
        <div className="shop-glyph"><Ruby size={56} sparkle /></div>
        <h2 className="shop-title">{t(lang, 'shopTitle')}</h2>
        <p className="shop-sub">{t(lang, 'shopSub')}</p>
        {notice && <p className="shop-notice">{notice}</p>}
        <p className="shop-balance">
          {t(lang, 'yourBalance')}: <b>{balance}</b> {rubyWord(lang, balance)}
        </p>
        <div className="shop-packs">
          {RUBY_PACKS.map(pack => {
            const pct = discountPct(pack);
            const per = Math.round(pack.price / pack.amount);
            return (
              <div key={pack.amount} className={`shop-pack ${pack.badge === 'badgeBest' ? 'shop-pack-best' : pack.badge ? 'shop-pack-pop' : ''}`}>
                {pack.badge && <span className="shop-badge">{t(lang, pack.badge)}</span>}
                <div className="shop-pack-gems">
                  {(PACK_GEMS[pack.amount] || [36]).map((sz, i) => <Ruby key={i} size={sz} sparkle={i === 0} />)}
                </div>
                <div className="shop-pack-info">
                  <div className="shop-pack-amount">{pack.amount}</div>
                  <div className="shop-pack-unit">{rubyWord(lang, pack.amount)}</div>
                  {pct > 0 && <div className="shop-pack-save">−{pct}%</div>}
                  <div className="shop-pack-per">≈ {per} {CURRENCY} {t(lang, 'perRuby')}</div>
                </div>
                <button className="shop-buy" onClick={() => onBuy(pack.amount)}>
                  {t(lang, 'buy')} · {pack.price} {CURRENCY}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Auth Screen ──────────────────────────────────────────────────────────────
function AuthScreen({ onAuth, lang, setLang }) {
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
      if (reg.error) { setError(t(lang, reg.error)); setLoading(false); return; }
    }
    const result = loginUser(username.trim(), password);
    if (result.error) { setError(t(lang, result.error)); setLoading(false); return; }
    onAuth(result.user);
    setLoading(false);
  }

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <LangSwitch lang={lang} setLang={setLang} />
        <div className="auth-glyph">✦</div>
        <h1 className="auth-heading">Aurora</h1>
        <p className="auth-sub">{mode === 'login' ? t(lang, 'authLogin') : t(lang, 'authRegister')}</p>
        <div className="auth-tabs">
          <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}>{t(lang, 'signIn')}</button>
          <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(''); }}>{t(lang, 'register')}</button>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">{t(lang, 'username')}</label>
            <input className="auth-input" type="text" value={username}
              onChange={e => setUsername(e.target.value)} placeholder={t(lang, 'usernamePh')} autoFocus />
          </div>
          <div className="auth-field">
            <label className="auth-label">{t(lang, 'password')}</label>
            <input className="auth-input" type="password" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? '…' : mode === 'login' ? t(lang, 'enter') : t(lang, 'createAccount')}
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

function InfiniteDeck({ onPick, lang, need = 1 }) {
  const stageRef = useRef(null);
  const offsetRef = useRef(0);
  const speedRef = useRef(0);
  const rafRef = useRef(null);
  const cardRefs = useRef([]);
  const hoveredRef = useRef(null);
  const pickedRef = useRef(null);
  const [chosen, setChosen] = useState([]); // indexes of picked cards (CSS only)
  const [done, setDone] = useState(false);


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

  const touchRef = useRef({ x: 0, moved: 0, active: false });

  // Touch: drag the deck with a finger; a tap (little movement) still picks a card
  const onTouchStart = useCallback((e) => {
    touchRef.current = { x: e.touches[0].clientX, moved: 0, active: true };
  }, []);
  const onTouchMove = useCallback((e) => {
    const t0 = touchRef.current;
    if (!t0.active || pickedRef.current !== null) return;
    const x = e.touches[0].clientX;
    const dx = x - t0.x;
    t0.x = x; t0.moved += Math.abs(dx);
    offsetRef.current += dx;
    positionCards();
  }, [positionCards]);
  const onTouchEnd = useCallback(() => { touchRef.current.active = false; }, []);

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
    if (pickedRef.current !== null || touchRef.current.moved > 8) { touchRef.current.moved = 0; return; }
    if (chosen.includes(idx)) return;
    const next = [...chosen, idx];
    setChosen(next);
    if (next.length >= need) {
      pickedRef.current = idx; // deck is finished: block further input
      setDone(true);
      speedRef.current = 0;
      setTimeout(() => { onPick(); }, 450);
    }
  }

  return (
    <div className="deck-wrap">
      <p className="deck-hint"><span className="hint-mouse">{t(lang, 'deckHint')}</span><span className="hint-touch">{t(lang, 'deckHintTouch')}</span></p>
      {need > 1 && <p className="deck-progress">{t(lang, 'pickProgress')(chosen.length, need)}</p>}
      <div className="deck-clip">
        <div
          ref={stageRef}
          className="deck-stage"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
        >
          <div className="deck-cards-container">
            {Array.from({ length: TOTAL_CARDS }, (_, i) => (
              <div
                key={i}
                ref={el => cardRefs.current[i] = el}
                className={`icard ${chosen.includes(i) ? (done ? 'icard-picked' : 'icard-chosen') : ''} ${done && !chosen.includes(i) ? 'icard-fading' : ''}`}
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
  const [lang, setLangState] = useState(DEFAULT_LANG);
  const [rubies, setRubies] = useState(0);
  const [showShop, setShowShop] = useState(false);
  const [spread, setSpread] = useState(1); // 1 or 3 cards
  const [shopNotice, setShopNotice] = useState('');

  function setLang(l) {
    setLangState(l);
    try { localStorage.setItem('tarot_lang', l); } catch {}
    document.documentElement.lang = l;
  }
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const chat = sessions[activeIdx] ?? [];

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tarot_lang');
      if (LANGS.includes(saved)) { setLangState(saved); document.documentElement.lang = saved; }
      else {
        const nav = (navigator.language || '').slice(0, 2);
        const guess = nav === 'ru' ? 'ru' : DEFAULT_LANG;
        setLangState(guess); document.documentElement.lang = guess;
      }
    } catch {}
    const u = getCurrentUser();
    if (u) {
      setUser(u);
      setRubies(getRubies(u.username));
      const saved = getSessionsForUser(u.username);
      setSessions(saved.length ? saved : [[]]);
    }
    // On phones the sidebar is an off-canvas drawer: start closed
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches) setSidebarOpen(false);
    setAuthReady(true);
  }, []);

  function closeSidebarOnMobile() {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches) setSidebarOpen(false);
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, activeIdx, loading, showDeck]);

  useEffect(() => {
    if (user) saveSessionsForUser(user.username, sessions);
  }, [sessions, user]);

  function handleAuth(u) {
    setUser(u);
    setRubies(getRubies(u.username));
    const saved = getSessionsForUser(u.username);
    setSessions(saved.length ? saved : [[]]);
    setActiveIdx(0);
  }

  function handleLogout() {
    logoutUser(); setUser(null); setRubies(0); setShowShop(false); setSessions([[]]); setActiveIdx(0); setShowUserMenu(false);
  }

  async function askQuestion() {
    if (loading || !question.trim() || showDeck) return;
    // Each question costs rubies; no rubies -> open the shop instead
    const cost = SPREADS[spread].cost;
    const left = addRubies(user.username, -cost);
    if (left === null) {
      openShop(rubies <= 0 ? t(lang, 'noRubies') : t(lang, 'notEnough')(cost, rubies, rubyWord(lang, cost)));
      return;
    }
    setRubies(left);
    const q = question.trim();
    setQuestion('');
    // Add question bubble + show deck
    setSessions(prev => prev.map((s, i) =>
      i === activeIdx ? [...s, { question: q, spread, cost, card: null, cards: null, interpretation: null, category: null, revealed: false }] : s
    ));
    setShowDeck(true);
  }

  function openShop(notice = '') { setShopNotice(notice); setShowShop(true); }

  function buyRubies(n) {
    // NOTE: demo purchase — rubies are credited instantly. Plug a real payment provider in here.
    const next = addRubies(user.username, n);
    if (next !== null) { setRubies(next); setShopNotice(`${t(lang, 'bought')}: +${n}`); }
  }

  async function handleCardPick() {
    // Fetch the cards NOW, after the user has picked them from the deck
    setShowDeck(false);
    setLoading(true);
    const lastTurn = sessions[activeIdx].at(-1);
    const lastQ = lastTurn?.question ?? '';
    const turnSpread = lastTurn?.spread === 3 ? 3 : 1;
    const turnCost = lastTurn?.cost ?? SPREADS[turnSpread].cost;
    try {
      const res = await fetch('/api/draw', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: lastQ, lang, count: turnSpread }) });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const cards = turnSpread === 3 ? data.cards : [data];
      if (!cards || cards.length !== turnSpread) throw new Error();
      const category = detectCategory(lastQ);
      // Reveal into last turn
      setSessions(prev => prev.map((s, i) => {
        if (i !== activeIdx) return s;
        const updated = [...s];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          card: cards[0], cards, interpretation: interpretation(lang, cards[0].card_name, category), category, revealed: true,
        };
        return updated;
      }));
    } catch {
      const back = addRubies(user.username, turnCost);
      if (back !== null) setRubies(back);
      // drop the unanswered question bubble
      setSessions(prev => prev.map((s, i) => i === activeIdx ? s.filter((x, k) => !(k === s.length - 1 && !x.revealed)) : s));
      alert(t(lang, 'error'));
    }
    finally { setLoading(false); setTimeout(() => inputRef.current?.focus(), 100); }
  }

  function newSession() {
    setSessions(prev => [...prev, []]);
    setActiveIdx(prev => prev + 1);
    setQuestion('');
    setShowDeck(false);
    closeSidebarOnMobile();
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
    if (session.length === 0) return t(lang, 'newReading');
    const q = session[0].question;
    return q.length > 34 ? q.slice(0, 34) + '…' : q;
  }

  if (!authReady) return null;
  if (!user) return <AuthScreen onAuth={handleAuth} lang={lang} setLang={setLang} />;

  return (
    <div className="app-layout" onClick={() => showUserMenu && setShowUserMenu(false)}>

      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="sidebar-header">
          <span className="sidebar-title">✦ Aurora</span>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(o => !o)}>←</button>
        </div>
        <div className="sidebar-lang"><LangSwitch lang={lang} setLang={setLang} /></div>
        <button className="new-session-btn" onClick={newSession}>{t(lang, 'newQuestion')}</button>
        <div className="sidebar-history">
          {[...sessions].reverse().map((s, ri) => {
            const i = sessions.length - 1 - ri;
            return (
              <div key={i}
                className={`history-item ${i === activeIdx ? 'history-item-active' : ''}`}
                onClick={() => { setActiveIdx(i); closeSidebarOnMobile(); }}>
                <span className="history-label">{sessionLabel(s)}</span>
                <div className="history-right">
                  {s.length > 0 && <span className="history-count">{s.length}</span>}
                  <button className="history-delete" onClick={e => deleteSession(i, e)} title={t(lang, 'del')}>×</button>
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
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(true)} aria-label={t(lang, 'menu')}>☰</button>
          )}
          <h1>{t(lang, 'title')}</h1>
          <LangSwitch lang={lang} setLang={setLang} />
          <button className="ruby-pill" onClick={() => openShop()} title={t(lang, 'buyRubies')}>
            <Ruby size={20} /><b>{rubies}</b><span className="ruby-plus">+</span>
          </button>
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
                  {sessions.reduce((n, s) => n + s.length, 0)} {t(lang, 'readings')} · {sessions.filter(s => s.length > 0).length} {t(lang, 'sessions')}
                </p>
                <hr className="dropdown-hr" />
                <button className="dropdown-logout" onClick={handleLogout}>{t(lang, 'signOut')}</button>
              </div>
            )}
          </div>
        </div>

        <div className="chat-log">
          {chat.length === 0 && !loading && !showDeck && (
            <div className="chat-empty-state">
              <p className="chat-empty-title">{t(lang, 'emptyTitle')}</p>
              <p className="chat-empty-sub">{t(lang, 'emptySub')}</p>
              <p className="spread-guide-title">{t(lang, 'bestFor')}</p>
              <div className="spread-guide">
                {[1, 3].map(n => (
                  <button key={n} type="button"
                    className={`spread-option ${spread === n ? 'spread-option-active' : ''}`}
                    onClick={() => setSpread(n)}>
                    <span className="spread-option-head">
                      <span className="spread-option-title">{t(lang, `spread${n}Title`)}</span>
                      <span className="spread-option-cost"><Ruby size={14} />{SPREADS[n].cost}</span>
                    </span>
                    <span className="spread-option-desc">{t(lang, `spread${n}Desc`)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {chat.map((turn, i) => (
            <div key={i} className="chat-turn">
              <div className="bubble-row user-row">
                <div className="user-bubble">{turn.question}</div>
              </div>
              {turn.revealed && (turn.cards || (turn.card ? [turn.card] : [])).length > 0 && (() => {
                const cards = turn.cards || [turn.card];
                const multi = cards.length > 1;
                return (
                  <div className={multi ? 'spread-row' : 'bubble-row card-row'}>
                    {cards.map((c, k) => (
                      <div key={k} className="card-bubble card-reveal-anim" style={multi ? { animationDelay: `${k * 0.25}s` } : undefined}>
                        {multi && <span className="chat-card-position">{t(lang, `pos${k + 1}`)}</span>}
                        <img src={`/images/${c.card_name.replace(/\s/g, '-')}.png`}
                          alt={cardName(lang, c.card_name)} className="chat-card-img"
                          onError={e => { e.target.style.display = 'none'; }} />
                        {!multi && <span className="chat-card-category">{CATEGORY_LABELS[lang][turn.category]}</span>}
                        <span className="chat-card-arcana">{arcanaLabel(lang, c.arcana)}</span>
                        <h3 className="chat-card-name">{cardName(lang, c.card_name)}</h3>
                        <hr className="chat-card-divider" />
                        <p className="chat-card-interp">{interpretation(lang, c.card_name, turn.category) || c.interpretation}</p>
                      </div>
                    ))}
                    {multi && <span className="chat-card-category spread-category">{CATEGORY_LABELS[lang][turn.category]}</span>}
                  </div>
                );
              })()}
            </div>
          ))}

          {showDeck && <InfiniteDeck key={chat.length} onPick={handleCardPick} lang={lang} need={chat.at(-1)?.spread === 3 ? 3 : 1} />}

          {loading && (
            <div className="bubble-row card-row">
              <div className="card-bubble loading-bubble">
                <span className="dot"/><span className="dot"/><span className="dot"/>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="spread-bar">
          <div className="spread-chips" role="group" aria-label={t(lang, 'spreadLabel')}>
            {[1, 3].map(n => (
              <button key={n} type="button" disabled={loading || showDeck}
                className={`spread-chip ${spread === n ? 'spread-chip-active' : ''}`}
                onClick={() => setSpread(n)}>
                {t(lang, `spread${n}`)}
                <span className="spread-chip-cost"><Ruby size={12} />{SPREADS[n].cost}</span>
              </button>
            ))}
          </div>
          <span className="spread-short">{t(lang, `spread${spread}Short`)}</span>
        </div>
        <div className="chat-input-row">
          <input ref={inputRef} className="question-input" type="text"
            placeholder={t(lang, 'inputPh')} value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={handleKey} disabled={loading || showDeck} />
          <button className="send-btn" onClick={askQuestion} disabled={loading || !question.trim() || showDeck}>↑</button>
        </div>
      </main>
      {showShop && (
        <RubyShop lang={lang} balance={rubies} notice={shopNotice}
          onBuy={buyRubies} onClose={() => setShowShop(false)} />
      )}
    </div>
  );
}