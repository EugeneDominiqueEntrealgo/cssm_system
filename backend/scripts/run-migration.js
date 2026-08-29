const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Client } = require('pg');

async function run() {
  const sqlPath = path.join(__dirname, 'add-user-fields.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('Migration SQL not found:', sqlPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');
  const conn = process.env.DATABASE_URL || process.env.SUPABASE_URL;
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not found in backend/.env. Please set it to your Postgres connection string.');
    process.exit(1);
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    console.log('Connected to database. Running migration...');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Migration executed successfully. Verifying columns...');

    const cols = ['first_name','middle_name','last_name','birthdate','gender','address','contract_details','phone'];
    const res = await client.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = ANY($1::text[])`,
      [cols]
    );
    if (res.rows.length === 0) {
      console.warn('No new columns found. Migration may have failed or table name differs.');
    } else {
      console.log('Found columns:');
      res.rows.forEach(r => console.log(` - ${r.column_name} (${r.data_type})`));
    }
  } catch (err) {
    await client.query('ROLLBACK').catch(()=>{});
    console.error('Migration error:', err.message || err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
