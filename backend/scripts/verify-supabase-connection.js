const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load environment variables from backend/.env
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials not found in .env file');
  console.error('Please set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY (or SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyConnection() {
  try {
    console.log('🔍 Verifying Supabase Connection...\n');
    console.log('📋 Project:', supabaseUrl);
    console.log('🔑 Key:', supabaseKey.substring(0, 20) + '...\n');

    // Try to connect by querying a non-existent table (will fail but prove connection works)
    console.log('1️⃣  Testing connection...');
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      if (error.message.includes('Could not find the table')) {
        console.log('⚠️  Connection successful, but tables not found yet');
        console.log('   This is expected if you haven\'t run the schema SQL yet.\n');
      } else {
        console.error('❌ Connection error:', error.message);
        process.exit(1);
      }
    } else {
      console.log('✅ Connection successful!');
      console.log('✅ Tables exist and are accessible!\n');
    }

    // Display project info
    console.log('📊 Supabase Project Details:');
    console.log('   URL:', supabaseUrl);
    console.log('   Status: Connected\n');

    console.log('🎯 Next Steps:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/fuhtaznbozbpsyxmnkio');
    console.log('   2. Click "SQL Editor" in the left sidebar');
    console.log('   3. Open file: backend/supabase-schema.sql');
    console.log('   4. Copy all SQL and paste into SQL Editor');
    console.log('   5. Click "Run" to create all tables');
    console.log('');
    console.log('   Or use the Supabase VS Code extension:');
    console.log('   - Press F1 → "Supabase: Open SQL Editor"');
    console.log('   - Copy and paste the SQL from supabase-schema.sql');
    console.log('   - Run it\n');

    console.log('✅ After running the schema, test with:');
    console.log('   node backend/server.js');
    console.log('   Then visit: http://localhost:5000/api/products\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyConnection();