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

  const fetchReadings = useCallback(async () => {
    const res = await fetch('/api/readings');
    if (res.ok) setReadings(await res.json());
  }, []);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  async function drawCard() {
    setLoading(true);
    try {
      const res = await fetch('/api/draw', { method: 'POST' });
      if (!res.ok) throw new Error();
      const card = await res.json();
      setCurrentCard(card);
      setReadings(prev => [card, ...prev.slice(0, 19)]);
    } catch {
      alert('Something went wrong — the cards are silent.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <h1>✦ Tarot Reader ✦</h1>
      <p className="subtitle">Shuffle the deck and let the cards speak</p>

      <button className="draw-btn" onClick={drawCard} disabled={loading}>
        {loading ? 'Drawing…' : 'Draw a Card'}
      </button>

      {currentCard && (
        <div className="current-card">
          <p className="card-arcana">{currentCard.arcana} Arcana</p>
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

//comment2