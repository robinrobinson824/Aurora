'use client';

import { useState, useRef, useEffect } from 'react';
import { detectCategory, categoryInterpretations } from './lib/tarot-categories';

const CATEGORY_LABELS = {
  love:       '♥ Love',
  money:      '✦ Money',
  health:     '✦ Health',
  work:       '✦ Work',
  relations:  '✦ Relations',
  future:     '✦ Future',
  choice:     '✦ Choice',
  psychology: '✦ Psychology',
  general:    '✦ General',
};

export default function Home() {
  const [sessions, setSessions] = useState([[]]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const chat = sessions[activeIdx] ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, activeIdx, loading]);

  async function drawCard() {
    if (loading || !question.trim()) return;
    const q = question.trim();
    setQuestion('');
    setLoading(true);
    try {
      const res = await fetch('/api/draw', { method: 'POST' });
      if (!res.ok) throw new Error();
      const card = await res.json();

      // Detect category and pick interpretation
      const category = detectCategory(q);
      const cardInterps = categoryInterpretations[card.card_name];
      const interpretation = cardInterps
        ? cardInterps[category]
        : card.interpretation;

      setSessions(prev => prev.map((s, i) =>
        i === activeIdx
          ? [...s, { question: q, card, interpretation, category }]
          : s
      ));
    } catch {
      alert('Something went wrong — the cards are silent.');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function newSession() {
    setSessions(prev => [...prev, []]);
    setActiveIdx(prev => prev + 1);
    setQuestion('');
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleKey(e) {
    if (e.key === 'Enter') drawCard();
  }

  function sessionLabel(session) {
    if (session.length === 0) return 'New reading';
    const q = session[0].question;
    return q.length > 34 ? q.slice(0, 34) + '…' : q;
  }

  return (
    <div className="app-layout">

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
              <button
                key={i}
                className={`history-item ${i === activeIdx ? 'history-item-active' : ''}`}
                onClick={() => setActiveIdx(i)}
              >
                <span className="history-label">{sessionLabel(s)}</span>
                {s.length > 0 && <span className="history-count">{s.length}</span>}
              </button>
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
          <button className="new-q-btn" onClick={newSession}>New Question</button>
        </div>

        <div className="chat-log">
          {chat.length === 0 && !loading && (
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
              <div className="bubble-row card-row">
                <div className="card-bubble">
                  <img
                    src={`/images/${turn.card.card_name.replace(/\s/g, '-')}.png`}
                    alt={turn.card.card_name}
                    className="chat-card-img"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <span className="chat-card-category">{CATEGORY_LABELS[turn.category]}</span>
                  <span className="chat-card-arcana">{turn.card.arcana} Arcana</span>
                  <h3 className="chat-card-name">{turn.card.card_name}</h3>
                  <hr className="chat-card-divider" />
                  <p className="chat-card-interp">{turn.interpretation}</p>
                </div>
              </div>
            </div>
          ))}

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
          <input
            ref={inputRef}
            className="question-input"
            type="text"
            placeholder="Ask the cards…"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
          />
          <button className="send-btn" onClick={drawCard} disabled={loading || !question.trim()}>↑</button>
        </div>
      </main>
    </div>
  );
}