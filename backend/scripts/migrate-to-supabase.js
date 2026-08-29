const fs = require('fs');
const path = require('path');
const { db, seedData } = require('../config/db');

async function migrateData() {
  console.log('Starting migration to Supabase...\n');

  try {
    // First, seed the database with initial data
    console.log('Seeding initial data...');
    await seedData();
    console.log('✓ Initial data seeded successfully\n');

    // Check if JSON data files exist
    const dataDir = path.join(__dirname, '..', 'data');
    const jsonFiles = {
      users: 'users.json',
      products: 'products.json',
      promos: 'promos.json',
      transactions: 'transactions.json',
      transaction_items: 'transaction_items.json',
      pending_submissions: 'pending_submissions.json'
    };

    let hasJsonData = false;
    for (const file of Object.values(jsonFiles)) {
      const filePath = path.join(dataDir, file);
      if (fs.existsSync(filePath)) {
        hasJsonData = true;
        break;
      }
    }

    if (!hasJsonData) {
      console.log('No JSON data files found. Migration complete with seed data only.');
      return;
    }

    console.log('JSON data files found. Migrating existing data...\n');

    // Migrate users (skip if already exists)
    console.log('Migrating users...');
    const usersData = JSON.parse(fs.readFileSync(path.join(dataDir, 'users.json'), 'utf8'));
    for (const user of usersData) {
      try {
        const existing = await db.users.findOne({ email: user.email });
        if (!existing) {
          await db.users.insert(user);
          console.log(`  ✓ Migrated user: ${user.email}`);
        } else {
          console.log(`  - Skipped user (exists): ${user.email}`);
        }
      } catch (error) {
        console.error(`  ✗ Error migrating user ${user.email}:`, error.message);
      }
    }

    // Migrate products
    console.log('\nMigrating products...');
    const productsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'products.json'), 'utf8'));
    for (const product of productsData) {
      try {
        const existing = await db.products.findOne({ id: product.id });
        if (!existing) {
          await db.products.insert(product);
          console.log(`  ✓ Migrated product: ${product.name}`);
        } else {
          console.log(`  - Skipped product (exists): ${product.name}`);
        }
      } catch (error) {
        console.error(`  ✗ Error migrating product ${product.name}:`, error.message);
      }
    }

    // Migrate promos
    console.log('\nMigrating promos...');
    const promosData = JSON.parse(fs.readFileSync(path.join(dataDir, 'promos.json'), 'utf8'));
    for (const promo of promosData) {
      try {
        const existing = await db.promos.findOne({ id: promo.id });
        if (!existing) {
          await db.promos.insert(promo);
          console.log(`  ✓ Migrated promo: ${promo.title}`);
        } else {
          console.log(`  - Skipped promo (exists): ${promo.title}`);
        }
      } catch (error) {
        console.error(`  ✗ Error migrating promo ${promo.title}:`, error.message);
      }
    }

    // Migrate transactions
    console.log('\nMigrating transactions...');
    const transactionsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'transactions.json'), 'utf8'));
    for (const transaction of transactionsData) {
      try {
        const existing = await db.transactions.findOne({ id: transaction.id });
        if (!existing) {
          await db.transactions.insert(transaction);
          console.log(`  ✓ Migrated transaction: ${transaction.receipt_number}`);
        } else {
          console.log(`  - Skipped transaction (exists): ${transaction.receipt_number}`);
        }
      } catch (error) {
        console.error(`  ✗ Error migrating transaction ${transaction.receipt_number}:`, error.message);
      }
    }

    // Migrate transaction items
    console.log('\nMigrating transaction items...');
    const transactionItemsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'transaction_items.json'), 'utf8'));
    for (const item of transactionItemsData) {
      try {
        const existing = await db.transaction_items.findOne({ id: item.id });
        if (!existing) {
          await db.transaction_items.insert(item);
          console.log(`  ✓ Migrated transaction item #${item.id}`);
        } else {
          console.log(`  - Skipped transaction item (exists): #${item.id}`);
        }
      } catch (error) {
        console.error(`  ✗ Error migrating transaction item #${item.id}:`, error.message);
      }
    }

    // Migrate pending submissions
    console.log('\nMigrating pending submissions...');
    const submissionsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'pending_submissions.json'), 'utf8'));
    for (const submission of submissionsData) {
      try {
        const existing = await db.pending_submissions.findOne({ id: submission.id });
        if (!existing) {
          await db.pending_submissions.insert(submission);
          console.log(`  ✓ Migrated submission #${submission.id}`);
        } else {
          console.log(`  - Skipped submission (exists): #${submission.id}`);
        }
      } catch (error) {
        console.error(`  ✗ Error migrating submission #${submission.id}:`, error.message);
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Verify your data in Supabase Dashboard');
    console.log('2. Update your .env file with Supabase credentials');
    console.log('3. Test the application');
    console.log('4. Backup and remove JSON data files when ready');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateData();