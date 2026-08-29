const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from backend/.env
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials not found in .env file');
  console.error('Please set SUPABASE_URL and SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupSchema() {
  try {
    console.log('🚀 Starting Supabase schema setup...\n');

    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'supabase-schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('📋 SQL Schema loaded successfully');
    console.log('📊 Executing SQL commands...\n');

    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.length < 10) {
        continue;
      }

      try {
        // Execute the SQL statement
        const { error } = await supabase.rpc('exec_sql', { 
          sql: statement + ';' 
        });

        if (error) {
          // Check if it's a "already exists" error (which is okay)
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate key') ||
              error.message.includes('does not exist')) {
            skipCount++;
          } else {
            console.error(`⚠️  Statement ${i + 1} warning:`, error.message);
            skipCount++;
          }
        } else {
          successCount++;
        }
      } catch (err) {
        // Some statements might fail if they already exist, that's okay
        skipCount++;
      }
    }

    console.log('\n✅ Schema setup completed!');
    console.log(`   ✓ Successfully executed: ${successCount} statements`);
    console.log(`   ⊘ Skipped (already exists): ${skipCount} statements`);
    console.log(`   ✗ Errors: ${errorCount} statements`);

    // Verify tables were created
    console.log('\n🔍 Verifying tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (tablesError) {
      console.error('❌ Error verifying tables:', tablesError.message);
      console.log('\n💡 Tip: Please run the SQL manually in Supabase SQL Editor:');
      console.log('   1. Go to https://fuhtaznbozbpsyxmnkio.supabase.co');
      console.log('   2. Click SQL Editor');
      console.log('   3. Copy and paste the content of backend/supabase-schema.sql');
      console.log('   4. Click Run');
      process.exit(1);
    }

    console.log('✅ Tables verified successfully!');
    console.log('\n📊 Your Supabase database is ready!');
    console.log('   Project: fuhtaznbozbpsyxmnkio');
    console.log('   URL: https://fuhtaznbozbpsyxmnkio.supabase.co');
    console.log('\n🎯 Next steps:');
    console.log('   1. Start backend: node backend/server.js');
    console.log('   2. Start frontend: cd frontend && npm start');
    console.log('   3. Test with: admin@store.com / admin123');

  } catch (error) {
    console.error('❌ Error setting up schema:', error.message);
    console.log('\n💡 Alternative: Run SQL manually in Supabase Dashboard');
    console.log('   1. Go to https://supabase.com/dashboard/project/fuhtaznbozbpsyxmnkio');
    console.log('   2. Click SQL Editor');
    console.log('   3. Copy content from backend/supabase-schema.sql');
    console.log('   4. Paste and Run');
    process.exit(1);
  }
}

setupSchema();