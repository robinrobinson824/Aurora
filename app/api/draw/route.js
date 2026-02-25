import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { drawRandom } from '@/lib/tarot';

export async function POST() {
  try {
    const card = drawRandom();

    const result = await pool.query(
      `INSERT INTO readings (card_name, arcana, interpretation)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [card.name, card.arcana, card.interpretation]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to draw card' }, { status: 500 });
  }
}