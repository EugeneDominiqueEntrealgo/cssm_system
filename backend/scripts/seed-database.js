const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
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

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Hash passwords
    console.log('🔐 Hashing passwords...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const staffPassword = await bcrypt.hash('staff123', 10);
    const userPassword = await bcrypt.hash('user123', 10);
    console.log('✅ Passwords hashed\n');

    // Insert default users
    console.log('👥 Creating default users...');
    
    const users = [
      {
        user_id: 'U100000',
        name: 'Admin User',
        email: 'admin@store.com',
        password: adminPassword,
        role: 'admin',
        status: 'active'
      },
      {
        user_id: 'U100001',
        name: 'Staff User',
        email: 'staff@store.com',
        password: staffPassword,
        role: 'staff',
        status: 'active'
      },
      {
        user_id: 'U100002',
        name: 'Juan Client',
        email: 'juan@email.com',
        password: userPassword,
        role: 'client',
        status: 'active'
      }
    ];

    for (const user of users) {
      const { data, error } = await supabase
        .from('users')
        .insert([user])
        .select();

      if (error) {
        if (error.message.includes('duplicate key') || error.message.includes('already exists')) {
          console.log(`⚠️  User ${user.email} already exists, skipping...`);
        } else {
          console.error(`❌ Error creating user ${user.email}:`, error.message);
        }
      } else {
        console.log(`✅ Created user: ${user.email} (${user.role})`);
      }
    }

    // Get the staff user ID for products
    const { data: staffUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'staff@store.com')
      .single();

    // Insert sample products
    console.log('\n📦 Creating sample products...');
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

    for (const product of products) {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select();

      if (error) {
        console.error(`❌ Error creating product ${product.name}:`, error.message);
      } else {
        console.log(`✅ Created product: ${product.name}`);
      }
    }

    // Insert sample promos
    console.log('\n🎉 Creating sample promos...');
    const promos = [
      {
        title: 'Buy 1 Take 1 - Chips Ahoy',
        description: 'Buy 1 Chips Ahoy Cookies, get 1 free!',
        discount_type: 'bundle',
        discount_value: 100.00,
        start_date: '2026-07-01T00:00:00Z',
        end_date: '2026-08-31T23:59:59Z',
        status: 'active',
        created_by: staffUser?.id
      },
      {
        title: 'Nescafe Bundle Discount',
        description: '20% off on Nescafe 3-in-1 30 packs',
        discount_type: 'percentage',
        discount_value: 20.00,
        start_date: '2026-07-15T00:00:00Z',
        end_date: '2026-08-15T23:59:59Z',
        status: 'active',
        created_by: staffUser?.id
      },
      {
        title: 'Mega Sardines Sale',
        description: 'PHP 5 off per can of Mega Sardines',
        discount_type: 'fixed',
        discount_value: 5.00,
        start_date: '2026-07-20T00:00:00Z',
        end_date: '2026-08-20T23:59:59Z',
        status: 'active',
        created_by: staffUser?.id
      }
    ];

    for (const promo of promos) {
      const { data, error } = await supabase
        .from('promos')
        .insert([promo])
        .select();

      if (error) {
        console.error(`❌ Error creating promo ${promo.title}:`, error.message);
      } else {
        console.log(`✅ Created promo: ${promo.title}`);
      }
    }

    console.log('\n✅ Database seeding completed!');
    console.log('\n📊 Default Accounts:');
    console.log('   Admin: admin@store.com / admin123');
    console.log('   Staff: staff@store.com / staff123');
    console.log('   User:  juan@email.com / user123');
    console.log('\n🎯 Next steps:');
    console.log('   1. Go to http://localhost:3000');
    console.log('   2. Login with one of the accounts above');
    console.log('   3. Start using the application!');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

seedDatabase();