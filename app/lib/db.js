import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Auto-seed table on first connection
pool.query(`
  CREATE TABLE IF NOT EXISTS readings (
    id SERIAL PRIMARY KEY,
    card_name TEXT NOT NULL,
    arcana TEXT NOT NULL,
    interpretation TEXT NOT NULL,
    drawn_at TIMESTAMPTZ DEFAULT NOW()
  );
`).catch(console.error);

export default pool;