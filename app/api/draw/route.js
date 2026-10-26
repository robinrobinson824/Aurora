import { NextResponse } from 'next/server';
import { drawRandom, drawMany } from '@/lib/tarot';

const GEMINI_KEY = process.env.GEMINI_API_KEY;

const LANG_NAMES = { uk: 'Ukrainian', ru: 'Russian', en: 'English' };

async function getGeminiInterpretation(cardName, arcana, question, fallback, lang) {
  if (!GEMINI_KEY) return fallback;
  try {
    const prompt = `You are a mystical tarot reader. The user asked: "${question}". They drew the card "${cardName}" (${arcana} Arcana). Give a single sentence interpretation connecting this card directly to their question. Be poetic and mystical. No more than 25 words. Answer strictly in ${LANG_NAMES[lang] || 'English'}, addressing the user informally and in a gender-neutral way.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 60, temperature: 0.9 },
        }),
      }
    );
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return text || fallback;
  } catch {
    return fallback;
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const question = body.question || '';
    const lang = ['uk', 'ru', 'en'].includes(body.lang) ? body.lang : 'en';

    const count = Number(body.count) === 3 ? 3 : 1;

    // 3-card spread: distinct cards, past / present / future
    if (count === 3) {
      const cards = drawMany(3).map(card => ({
        id: Date.now(),
        card_name: card.name,
        arcana: card.arcana,
        interpretation: card.interpretation,
        drawn_at: new Date().toISOString(),
      }));
      return NextResponse.json({ cards });
    }

    const card = drawRandom();

    const interpretation = await getGeminiInterpretation(
      card.name, card.arcana, question, card.interpretation, lang
    );

    return NextResponse.json({
      id: Date.now(),
      card_name: card.name,
      arcana: card.arcana,
      interpretation,
      drawn_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to draw card' }, { status: 500 });
  }
}