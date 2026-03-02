'use client';

import { useState, useEffect, useCallback } from 'react';

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' }) +
    '\n' + d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
}

export default function Home() {
  const [currentCard, setCurrentCard] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');

  const fetchReadings = useCallback(async () => {
    const res = await fetch('/api/readings');
    if (res.ok) setReadings(await res.json());
  }, []);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  async function drawCard() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/draw', { method: 'POST' });
      if (!res.ok) throw new Error();
      const card = await res.json();
      setCurrentCard({ ...card, question: question.trim() });
      setReadings(prev => [card, ...prev.slice(0, 19)]);
    } catch {
      alert('Something went wrong — the cards are silent.');
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter') drawCard();
  }

  return (
    <div className="container">
      <h1>✦ Tarot Reader ✦</h1>
      <p className="subtitle">Shuffle the deck and let the cards speak</p>

      <div className="question-box">
        <input
          className="question-input"
          type="text"
          placeholder="Ask the cards a question…"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading}
        />
        <button className="draw-btn" onClick={drawCard} disabled={loading}>
          {loading ? 'Drawing…' : 'Draw a Card'}
        </button>
      </div>

      {currentCard && (
        <div className="current-card">
          {currentCard.question && (
            <p className="card-question">"{currentCard.question}"</p>
          )}
          <p className="card-arcana">{currentCard.arcana} Arcana</p>
          <img
            src={`/images/${currentCard.card_name.replace(/\s/g, '-')}.png`}
            alt={currentCard.card_name}
            className="card-image"
          />
          <h2 className="card-name">{currentCard.card_name}</h2>
          <hr className="card-divider" />
          <p className="card-interpretation">{currentCard.interpretation}</p>
        </div>
      )}

      <h3 className="transcript-title">Reading Transcript</h3>

      {readings.length === 0 ? (
        <p className="empty-state">No readings yet — draw your first card above.</p>
      ) : (
        readings.map(r => (
          <div key={r.id} className="reading-item">
            <div className="reading-meta">{formatDate(r.drawn_at)}</div>
            <div className="reading-content">
              <p className="reading-card-name">{r.card_name}</p>
              <p className="reading-interp">{r.interpretation}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
