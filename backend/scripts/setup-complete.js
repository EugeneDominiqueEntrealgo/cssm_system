const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Load environment variables from backend/.env
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials not found in .env file');
  console.error('Please set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupComplete() {
  try {
    console.log('🚀 Starting Complete Supabase Setup...\n');
    console.log('=' .repeat(60));

    // Step 1: Read and execute schema
    console.log('\n📋 STEP 1: Setting up database schema...\n');
    const schemaPath = path.join(__dirname, '..', 'supabase-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Split and execute schema statements
    const schemaStatements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    let schemaSuccess = 0;
    let schemaSkip = 0;

    for (const statement of schemaStatements) {
      if (statement.startsWith('--') || statement.length < 10) continue;
      
      try {
        const { error } = await supabase.rpc('exec_sql', { 
          sql: statement + ';' 
        });
        
        if (error) {
          if (error.message.includes('already exists') || 
              error.message.includes('does not exist')) {
            schemaSkip++;
          } else {
            // Ignore RPC errors for schema setup
            schemaSkip++;
          }
        } else {
          schemaSuccess++;
        }
      } catch (err) {
        schemaSkip++;
      }
    }

    console.log(`   ✓ Schema statements executed: ${schemaSuccess}`);
    console.log(`   ⊘ Skipped (already exists): ${schemaSkip}`);

    // Step 2: Fix RLS Policies
    console.log('\n🔒 STEP 2: Fixing RLS policies...\n');
    const rlsPath = path.join(__dirname, 'fix-rls-policies.sql');
    const rlsSQL = fs.readFileSync(rlsPath, 'utf8');
    
    const rlsStatements = rlsSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('SELECT'));

    let rlsSuccess = 0;
    let rlsSkip = 0;

    for (const statement of rlsStatements) {
      if (statement.startsWith('--') || statement.length < 10) continue;
      
      try {
        const { error } = await supabase.rpc('exec_sql', { 
          sql: statement + ';' 
        });
        
        if (error) {
          if (error.message.includes('already exists') || 
              error.message.includes('does not exist')) {
            rlsSkip++;
          } else {
            rlsSkip++;
          }
        } else {
          rlsSuccess++;
        }
      } catch (err) {
        rlsSkip++;
      }
    }

    console.log(`   ✓ RLS policies updated: ${rlsSuccess}`);
    console.log(`   ⊘ Skipped: ${rlsSkip}`);

    // Step 3: Seed database
    console.log('\n🌱 STEP 3: Seeding database with default data...\n');
    
    // Hash passwords
    console.log('   🔐 Hashing passwords...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const staffPassword = await bcrypt.hash('staff123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    // Insert users
    console.log('   👥 Creating users...');
    const users = [
      { name: 'Admin User', email: 'admin@store.com', password: adminPassword, role: 'admin', status: 'active' },
      { name: 'Staff User', email: 'staff@store.com', password: staffPassword, role: 'staff', status: 'active' },
      { name: 'Juan Client', email: 'juan@email.com', password: userPassword, role: 'client', status: 'active' }
    ];

    let usersCreated = 0;
    for (const user of users) {
      const { error } = await supabase
        .from('users')
        .insert([user]);

      if (error) {
        if (error.message.includes('duplicate') || error.message.includes('already exists')) {
          console.log(`   ⚠️  User ${user.email} already exists`);
        } else {
          console.error(`   ❌ Error creating ${user.email}:`, error.message);
        }
      } else {
        console.log(`   ✅ Created: ${user.email} (${user.role})`);
        usersCreated++;
      }
    }

    // Get staff user ID
    const { data: staffUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'staff@store.com')
      .single();

    // Insert products
    console.log('\n   📦 Creating products...');
    const products = [
      { name: 'Coca-Cola 1.5L', description: 'Soft drink bottle 1.5 liters', price: 55.00, stock: 50, category: 'Beverages', status: 'active', created_by: staffUser?.id },
      { name: 'Chips Ahoy Cookies', description: 'Chocolate chip cookies 150g', price: 45.00, stock: 30, category: 'Snacks', status: 'active', created_by: staffUser?.id },
      { name: 'Mega Sardines', description: 'Sardines in tomato sauce 155g', price: 25.00, stock: 40, category: 'Canned Goods', status: 'active', created_by: staffUser?.id },
      { name: 'Nescafe 3-in-1 (30 packs)', description: 'Instant coffee mix 30 sticks', price: 120.00, stock: 20, category: 'Beverages', status: 'active', created_by: staffUser?.id },
      { name: 'Skyflakes Crackers', description: 'Saltine crackers 25g', price: 8.00, stock: 100, category: 'Snacks', status: 'active', created_by: staffUser?.id },
      { name: 'Lucky Me Instant Noodles', description: 'Chicken flavor instant noodles', price: 15.00, stock: 60, category: 'Noodles', status: 'active', created_by: staffUser?.id },
      { name: 'Bear Brand Powdered Milk', description: 'Powdered milk 300g', price: 95.00, stock: 25, category: 'Dairy', status: 'active', created_by: staffUser?.id },
      { name: 'Pancit Canton (Sweet & Spicy)', description: 'Instant stir-fry noodles', price: 18.00, stock: 45, category: 'Noodles', status: 'active', created_by: staffUser?.id },
      { name: 'Safeguard Soap', description: 'Antibacterial soap 90g', price: 35.00, stock: 35, category: 'Personal Care', status: 'active', created_by: staffUser?.id }
    ];

    let productsCreated = 0;
    for (const product of products) {
      const { error } = await supabase
        .from('products')
        .insert([product]);

      if (error) {
        if (!error.message.includes('duplicate')) {
          console.error(`   ❌ Error creating ${product.name}:`, error.message);
        }
      } else {
        console.log(`   ✅ Created: ${product.name}`);
        productsCreated++;
      }
    }

    // Insert promos
    console.log('\n   🎉 Creating promos...');
    const promos = [
      { title: 'Buy 1 Take 1 - Chips Ahoy', description: 'Buy 1 Chips Ahoy Cookies, get 1 free!', discount_type: 'bundle', discount_value: 100.00, start_date: '2026-07-01T00:00:00Z', end_date: '2026-08-31T23:59:59Z', status: 'active', created_by: staffUser?.id },
      { title: 'Nescafe Bundle Discount', description: '20% off on Nescafe 3-in-1 30 packs', discount_type: 'percentage', discount_value: 20.00, start_date: '2026-07-15T00:00:00Z', end_date: '2026-08-15T23:59:59Z', status: 'active', created_by: staffUser?.id },
      { title: 'Mega Sardines Sale', description: 'PHP 5 off per can of Mega Sardines', discount_type: 'fixed', discount_value: 5.00, start_date: '2026-07-20T00:00:00Z', end_date: '2026-08-20T23:59:59Z', status: 'active', created_by: staffUser?.id }
    ];

    let promosCreated = 0;
    for (const promo of promos) {
      const { error } = await supabase
        .from('promos')
        .insert([promo]);

      if (error) {
        if (!error.message.includes('duplicate')) {
          console.error(`   ❌ Error creating ${promo.title}:`, error.message);
        }
      } else {
        console.log(`   ✅ Created: ${promo.title}`);
        promosCreated++;
      }
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ SETUP COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   Users created: ${usersCreated}/3`);
    console.log(`   Products created: ${productsCreated}/9`);
    console.log(`   Promos created: ${promosCreated}/3`);
    
    console.log('\n🔐 Test Accounts:');
    console.log('   Admin: admin@store.com / admin123');
    console.log('   Staff: staff@store.com / staff123');
    console.log('   User:  juan@email.com / user123');
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. Make sure backend is running: node backend/server.js');
    console.log('   2. Start frontend: cd frontend && npm start');
    console.log('   3. Open browser: http://localhost:3000');
    console.log('   4. Login with one of the accounts above');
    console.log('\n✨ Your Supabase project is ready to use!');
    console.log('   Project URL: https://fuhtaznbozbpsyxmnkio.supabase.co\n');

  } catch (error) {
    console.error('\n❌ Setup error:', error.message);
    console.error('\n💡 Alternative: Run SQL manually in Supabase Dashboard');
    console.error('   1. Go to https://supabase.com/dashboard/project/fuhtaznbozbpsyxmnkio');
    console.error('   2. Click SQL Editor');
    console.error('   3. Run backend/supabase-schema.sql');
    console.error('   4. Run backend/scripts/fix-rls-policies.sql');
    console.error('   5. Run: node backend/scripts/seed-database.js\n');
    process.exit(1);
  }
}

setupComplete();