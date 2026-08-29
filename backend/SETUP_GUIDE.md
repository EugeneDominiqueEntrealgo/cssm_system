# Supabase Migration Setup Guide

This guide will help you migrate your Convenience Store Stock Management System from JSON file-based database to Supabase.

## Prerequisites

- Node.js installed
- A Supabase account (sign up at https://supabase.com)
- Your existing project files

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in your project details:
   - Name: `convenience-store` (or any name you prefer)
   - Database Password: Save this password securely
   - Region: Choose the closest region to you
4. Wait for the project to be created (1-2 minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** (gear icon)
2. Click on **API** in the left sidebar
3. You'll find two important values:
   - **Project URL** (e.g., `https://xyz123.supabase.co`)
   - **anon/public key** (a long string starting with `eyJ...`)

## Step 3: Set Up Environment Variables

1. Open `backend/.env` file
2. Replace the placeholder values with your actual Supabase credentials:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
PORT=5000
NODE_ENV=development
JWT_SECRET=your-jwt-secret-key-here
```

## Step 4: Create Database Schema in Supabase

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click **New query**
3. Open the file `backend/supabase-schema.sql`
4. Copy all the SQL code from that file
5. Paste it into the Supabase SQL Editor
6. Click **Run** to execute the schema creation
7. You should see "Success. No rows returned" message

This will create all 6 tables:
- users
- products
- promos
- transactions
- transaction_items
- pending_submissions

## Step 5: Install Dependencies

```bash
cd backend
npm install
```

The `@supabase/supabase-js` package should already be installed.

## Step 6: Migrate Your Data

### Option A: Fresh Start (No Existing Data)

If you don't have any existing data in your JSON files:

```bash
cd backend
node server.js
```

The application will automatically seed the database with default data:
- Admin account: admin@store.com / admin123
- Staff account: staff@store.com / staff123
- User account: juan@email.com / user123
- Sample products and promos

### Option B: Migrate Existing Data

If you have existing data in your JSON files:

1. First, make sure your Supabase database is set up (Step 4)
2. Run the migration script:

```bash
cd backend
node scripts/migrate-to-supabase.js
```

This script will:
- Seed initial data if database is empty
- Migrate all existing JSON data to Supabase
- Skip records that already exist (based on email for users, id for others)
- Show you a detailed migration log

## Step 7: Test the Application

1. Start the backend server:

```bash
cd backend
npm run dev
```

2. Start the frontend (in a new terminal):

```bash
cd frontend
npm start
```

3. Test the following features:
   - Login with default accounts
   - View products
   - Create new products (as staff)
   - Create transactions
   - Test promo functionality
   - Test user management (as admin)

## Step 8: Verify Data in Supabase

1. Go to your Supabase dashboard
2. Click on **Table Editor** in the left sidebar
3. You should see all 6 tables with your data
4. Click on each table to verify the data was migrated correctly

## Architecture Changes

### What Changed:

1. **Database Layer** (`config/db.js`):
   - Replaced `JSONDatabase` class with `SupabaseDatabase` class
   - All CRUD operations now use Supabase client
   - Same API interface maintained (no changes to models)

2. **Configuration** (`config/supabase.js`):
   - New file that initializes Supabase client
   - Loads credentials from environment variables

3. **Models** (all 5 models):
   - Updated to use async/await (Supabase is async)
   - Same method signatures (no changes to controllers/routes)
   - All database operations now return Promises

4. **Schema** (`supabase-schema.sql`):
   - Converted MySQL schema to PostgreSQL
   - Added Row Level Security (RLS) policies
   - Added triggers for automatic timestamp updates
   - Added additional indexes for performance

### What Stayed the Same:

- All controllers (no changes needed)
- All routes (no changes needed)
- All frontend code (no changes needed)
- API endpoints (same URLs and responses)
- Authentication logic (still uses bcrypt for passwords)

## Troubleshooting

### Error: "Supabase credentials not found"

- Make sure you've created the `.env` file (not just `.env.example`)
- Verify the credentials are correct
- Check for typos in the environment variable names

### Error: "relation 'users' does not exist"

- You haven't run the schema SQL in Supabase
- Go to Step 4 and execute the schema

### Error: "Failed to connect to Supabase"

- Check your internet connection
- Verify the SUPABASE_URL is correct
- Make sure your Supabase project is active

### Data not appearing in Supabase

- Check the migration logs for errors
- Verify RLS policies aren't blocking inserts
- Check Supabase logs in the dashboard

## Rollback Plan

If you need to rollback to JSON files:

1. Keep a backup of your original `config/db.js` file
2. Keep a backup of your JSON data files
3. Restore the original `config/db.js`
4. Your application will work exactly as before

## Next Steps

After successful migration:

1. **Backup your data**: Export data from Supabase dashboard
2. **Remove JSON files**: Once you're confident everything works, you can remove the `backend/data` folder
3. **Update README**: Document the new database setup
4. **Consider Supabase Auth**: You can optionally use Supabase's built-in authentication instead of bcrypt
5. **Enable Backups**: Set up automated backups in Supabase settings
6. **Monitor Usage**: Check Supabase dashboard for usage metrics

## Benefits of Supabase

- **Scalability**: PostgreSQL database that grows with your app
- **Real-time**: Built-in real-time subscriptions available
- **Reliability**: Automatic backups and high availability
- **Dashboard**: Web interface to manage your data
- **Auto-generated API**: REST API automatically generated from your schema
- **Security**: Row Level Security (RLS) for fine-grained access control
- **Free Tier**: Generous free tier for development and small projects

## Support

If you encounter issues:
1. Check the Supabase logs in your dashboard
2. Review the console output for error messages
3. Verify your schema matches the `supabase-schema.sql` file
4. Check that all environment variables are set correctly