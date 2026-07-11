import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function cleanDatabase(): Promise<void> {
  await pool.query(`
    TRUNCATE TABLE "AlertChannel", "Check", "Monitor", "RefreshToken", "User"
    RESTART IDENTITY CASCADE
  `);
}

export async function closeDatabase(): Promise<void> {
  await pool.end();
}
