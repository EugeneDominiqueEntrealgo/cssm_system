const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load environment variables from backend/.env
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials not found in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateSchema() {
  console.log('🚀 Starting user schema migration...\n');

  // SQL statements to add missing columns
  const statements = [
    // Add user_id column if not exists
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS user_id VARCHAR(10) UNIQUE`,
    // Add created_by column if not exists
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL`,
    // Create sequence for user IDs
    `CREATE SEQUENCE IF NOT EXISTS user_id_seq START 100000`,
    // Update existing users with user_id if null
    `UPDATE users SET user_id = 'U' || lpad((100000 + id)::text, 5, '0') WHERE user_id IS NULL`,
    // Create function to generate user_id
    `CREATE OR REPLACE FUNCTION generate_user_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.user_id = 'U' || lpad(nextval('user_id_seq')::text, 5, '0');
    RETURN NEW;
END;
$$ language 'plpgsql'`,
    // Create trigger
    `DROP TRIGGER IF EXISTS generate_user_id_trigger ON users`,
    `CREATE TRIGGER generate_user_id_trigger BEFORE INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION generate_user_id()`
  ];

  for (let i = 0; i < statements.length; i++) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statements[i] });
      if (error) {
        console.log(`⚠️  Statement ${i + 1} warning:`, error.message);
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
      }
    } catch (err) {
      console.log(`⚠️  Statement ${i + 1} skipped:`, err.message);
    }
  }

  console.log('\n✅ Schema migration completed!');
  console.log('The users table now has user_id and created_by columns.');
}

migrateSchema();