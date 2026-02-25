import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT * FROM readings ORDER BY drawn_at DESC LIMIT 20`
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch readings' }, { status: 500 });
  }
}