// READ-ONLY pre-migration check. Does NOT modify any data.
// Connects to Supabase and reports the current state of the users tables.
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Supabase URL:', supabaseUrl);

  // 1. Users table state
  const { data: users, error: uErr } = await supabase.from('users').select('*');
  if (uErr) {
    console.log('⚠️  Cannot read users:', uErr.message);
  } else {
    console.log('\n=== users table ===');
    console.log('Total rows:', users.length);
    const byRole = {};
    for (const u of users) {
      const r = u.role || '?';
      byRole[r] = (byRole[r] || 0) + 1;
    }
    console.log('By role:', JSON.stringify(byRole, null, 2));
    // Show sample ids so we know the numeric id range
    console.log('Sample ids:', users.slice(0, 20).map(u => `${u.id}:${u.role}:${u.email}`));
  }

  // 2. Do the new tables already exist?
  for (const t of ['clients', 'staff', 'admins', 'users_backup']) {
    const { data, error } = await supabase.from(t).select('*');
    if (error) {
      console.log(`\nTable \`${t}\`: NOT present (${error.message})`);
    } else {
      console.log(`\nTable \`${t}\`: EXISTS with ${data.length} rows`);
      console.log('   sample:', JSON.stringify(data.slice(0, 5)));
    }
  }

  // 3. Does exec_sql RPC exist? (only needed if we want to run DDL programmatically)
  const { error: rpcErr } = await supabase.rpc('exec_sql', { sql: 'SELECT 1' });
  console.log('\nexec_sql RPC callable?', rpcErr ? `NO (${rpcErr.message})` : 'YES');

  // 4. Check transactions FK references (read-only)
  const { data: tx, error: txErr } = await supabase.from('transactions').select('*');
  if (!txErr) {
    console.log('\ntransactions count:', tx.length);
    console.log('sample transactions:', JSON.stringify(tx.slice(0, 5)));
  }
}

check();