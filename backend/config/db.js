const supabase = require('./supabase');

class SupabaseDatabase {
  constructor(tableName) {
    this.tableName = tableName;
  }

  // Find all records matching optional filter
  async find(filter = {}) {
    let query = supabase.from(this.tableName).select('*');
    
    // Apply filters
    Object.entries(filter).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    const { data, error } = await query;
    if (error) {
      console.error(`Error finding from ${this.tableName}:`, error);
      return [];
    }
    return data || [];
  }

  // Find one record matching filter
  async findOne(filter) {
    const results = await this.find(filter);
    return results[0] || null;
  }

  // Find by ID
  async findById(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return null;
    }
    return data;
  }

  // Insert a new record
  async insert(record) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert([record])
      .select()
      .single();
    
    if (error) {
      console.error(`Error inserting into ${this.tableName}:`, error);
      throw error;
    }
    return data;
  }

  // Update a record by ID
  async update(id, updates) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      return null;
    }
    return data;
  }

  // Delete a record by ID
  async delete(id) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting from ${this.tableName}:`, error);
      return false;
    }
    return true;
  }

  // Count all records
  async count() {
    const { count, error } = await supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error(`Error counting ${this.tableName}:`, error);
      return 0;
    }
    return count || 0;
  }

  // Get all records
  async getAll() {
    return await this.find();
  }

  // Clear all records (use with caution!)
  async clear() {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .neq('id', 0);
    
    if (error) {
      console.error(`Error clearing ${this.tableName}:`, error);
    }
  }
}

// Initialize databases
const db = {
  clients: new SupabaseDatabase('clients'),
  staff:   new SupabaseDatabase('staff'),
  admins:  new SupabaseDatabase('admins'),
  products: new SupabaseDatabase('products'),
  promos: new SupabaseDatabase('promos'),
  transactions: new SupabaseDatabase('transactions'),
  transaction_items: new SupabaseDatabase('transaction_items'),
  pending_submissions: new SupabaseDatabase('pending_submissions'),
};

// Seed initial data if empty
async function seedData() {
  try {
    const [clientCount, staffCount, adminCount] = await Promise.all([
      db.clients.count(),
      db.staff.count(),
      db.admins.count()
    ]);
    const userCount = (clientCount || 0) + (staffCount || 0) + (adminCount || 0);
    if (userCount === 0) {
      console.log('Seeding initial data...');
      
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const adminPass = await bcrypt.hash('admin123', salt);
      const staffPass = await bcrypt.hash('staff123', salt);
      const userPass = await bcrypt.hash('user123', salt);

      // Create users (separate tables)
      const admin = await db.admins.insert({
        name: 'Admin User',
        email: 'admin@store.com',
        password: adminPass,
        status: 'active'
      });
      
      const staff = await db.staff.insert({
        name: 'Staff User',
        email: 'staff@store.com',
        password: staffPass,
        status: 'active'
      });
      
      const client = await db.clients.insert({
        name: 'Juan Client',
        email: 'juan@email.com',
        password: userPass,
        status: 'active'
      });

      // Create products
      const products = [
        { name: 'Coca-Cola 1.5L', description: 'Soft drink bottle 1.5 liters', price: 55.00, stock: 50, category: 'Beverages', status: 'active', created_by: staff.id },
        { name: 'Chips Ahoy Cookies', description: 'Chocolate chip cookies 150g', price: 45.00, stock: 30, category: 'Snacks', status: 'active', created_by: staff.id },
        { name: 'Mega Sardines', description: 'Sardines in tomato sauce 155g', price: 25.00, stock: 40, category: 'Canned Goods', status: 'active', created_by: staff.id },
        { name: 'Nescafe 3-in-1 (30 packs)', description: 'Instant coffee mix 30 sticks', price: 120.00, stock: 20, category: 'Beverages', status: 'active', created_by: staff.id },
        { name: 'Skyflakes Crackers', description: 'Saltine crackers 25g', price: 8.00, stock: 100, category: 'Snacks', status: 'active', created_by: staff.id },
        { name: 'Lucky Me Instant Noodles', description: 'Chicken flavor instant noodles', price: 15.00, stock: 60, category: 'Noodles', status: 'active', created_by: staff.id },
        { name: 'Bear Brand Powdered Milk', description: 'Powdered milk 300g', price: 95.00, stock: 25, category: 'Dairy', status: 'active', created_by: staff.id },
        { name: 'Pancit Canton (Sweet & Spicy)', description: 'Instant stir-fry noodles', price: 18.00, stock: 45, category: 'Noodles', status: 'active', created_by: staff.id },
        { name: 'Safeguard Soap', description: 'Antibacterial soap 90g', price: 35.00, stock: 35, category: 'Personal Care', status: 'active', created_by: staff.id },
        { name: 'Canned Tuna', description: 'Canned tuna in oil 155g', price: 28.00, stock: 50, category: 'Canned Goods', status: 'active', created_by: staff.id },
      ];
      
      const productRecords = [];
      for (const product of products) {
        const inserted = await db.products.insert(product);
        productRecords.push(inserted);
      }

      // Create promos
      await db.promos.insert({ 
        title: 'Buy 1 Take 1 - Chips Ahoy', 
        description: 'Buy 1 Chips Ahoy Cookies, get 1 free!', 
        discount_type: 'bundle', 
        discount_value: 100.00, 
        start_date: '2026-07-01T00:00:00.000Z', 
        end_date: '2026-08-31T23:59:59.000Z', 
        status: 'active', 
        created_by: staff.id 
      });
      
      await db.promos.insert({ 
        title: 'Nescafe Bundle Discount', 
        description: '20% off on Nescafe 3-in-1 30 packs', 
        discount_type: 'percentage', 
        discount_value: 20.00, 
        start_date: '2026-07-15T00:00:00.000Z', 
        end_date: '2026-08-15T23:59:59.000Z', 
        status: 'active', 
        created_by: staff.id 
      });
      
      await db.promos.insert({ 
        title: 'Mega Sardines Sale', 
        description: 'PHP 5 off per can of Mega Sardines', 
        discount_type: 'fixed', 
        discount_value: 5.00, 
        start_date: '2026-07-20T00:00:00.000Z', 
        end_date: '2026-08-20T23:59:59.000Z', 
        status: 'active', 
        created_by: staff.id 
      });

      // Create transactions
      const t1 = await db.transactions.insert({ 
        receipt_number: 'REC-20260731-001', 
        user_id: client.id, 
        staff_id: staff.id, 
        total_amount: 175.00, 
        payment_method: 'cash', 
        created_at: '2026-07-31T10:30:00.000Z' 
      });
      
      const t2 = await db.transactions.insert({ 
        receipt_number: 'REC-20260731-002', 
        user_id: client.id, 
        staff_id: staff.id, 
        total_amount: 88.00, 
        payment_method: 'cash', 
        created_at: '2026-07-31T11:15:00.000Z' 
      });
      
      const t3 = await db.transactions.insert({ 
        receipt_number: 'REC-20260731-003', 
        user_id: null, 
        staff_id: staff.id, 
        total_amount: 45.00, 
        payment_method: 'pos', 
        created_at: '2026-07-31T14:00:00.000Z' 
      });

      // Create transaction items
      await db.transaction_items.insert({ transaction_id: t1.id, product_id: productRecords[0].id, quantity: 1, unit_price: 55.00, subtotal: 55.00 });
      await db.transaction_items.insert({ transaction_id: t1.id, product_id: productRecords[3].id, quantity: 1, unit_price: 120.00, subtotal: 120.00 });
      await db.transaction_items.insert({ transaction_id: t2.id, product_id: productRecords[5].id, quantity: 2, unit_price: 15.00, subtotal: 30.00 });
      await db.transaction_items.insert({ transaction_id: t2.id, product_id: productRecords[4].id, quantity: 1, unit_price: 8.00, subtotal: 8.00 });
      await db.transaction_items.insert({ transaction_id: t2.id, product_id: productRecords[2].id, quantity: 2, unit_price: 25.00, subtotal: 50.00 });
      await db.transaction_items.insert({ transaction_id: t3.id, product_id: productRecords[1].id, quantity: 1, unit_price: 45.00, subtotal: 45.00 });

      console.log('Seed data created successfully!');
      console.log('Default accounts:');
      console.log('  Admin: admin@store.com / admin123');
      console.log('  Staff: staff@store.com / staff123');
      console.log('  Client: juan@email.com / user123');
    }
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

module.exports = { db, seedData };