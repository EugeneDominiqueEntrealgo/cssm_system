# Quick Start Guide - Products System Fixed

## What Was Fixed

Your products/goods system has been configured to work with Supabase. The main issues were:

1. ✅ **Fixed RLS policies** - Changed from incorrect `auth.role()` to `auth.uid() IS NOT NULL`
2. ✅ **Added missing policies** - INSERT and DELETE policies for products
3. ✅ **Configured credentials** - Backend and frontend now have your Supabase credentials
4. ✅ **Updated API configuration** - Frontend now uses environment variables

## Your Supabase Credentials (Already Configured)

**Backend** (`backend/.env`):
- SUPABASE_URL: `https://fuhtaznbozbpsyxmnkio.supabase.co`
- SUPABASE_ANON_KEY: `sb_publishable_q19709CYxvWBAiXV9gAMlg__oIwAPSZ`
- JWT_SECRET: `convenience_store_jwt_secret_key_2026`

**Frontend** (`frontend/.env`):
- REACT_APP_SUPABASE_URL: `https://fuhtaznbozbpsyxmnkio.supabase.co`
- REACT_APP_SUPABASE_KEY: `sb_publishable_q19709CYxvWBAiXV9gAMlg__oIwAPSZ`
- REACT_APP_API_URL: `http://localhost:5000/api`

## Setup Instructions

### 1. Set Up Supabase Database Schema

**Option A: Fresh Setup (Recommended)**
1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/fuhtaznbozbpsyxmnkio
2. Click on **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy and paste the entire contents of `backend/supabase-schema.sql`
5. Click **Run** (or press Ctrl+Enter)
6. Wait for "Success" message

**Option B: Fix Existing Database**
If you already have tables but products aren't working:
1. Go to Supabase SQL Editor
2. Copy and paste the contents of `backend/scripts/fix-rls-policies.sql`
3. Click **Run**

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Start Backend Server

```bash
npm run dev
```

You should see:
```
Server running on port 5000
Database connected successfully
Seed data created successfully!
Default accounts:
  Admin: admin@store.com / admin123
  Staff: staff@store.com / staff123
  User:  juan@email.com / user123
```

### 4. Start Frontend (New Terminal)

```bash
cd frontend
npm install
npm start
```

The frontend should open at `http://localhost:3000`

## Test the System

### Test 1: Login as Admin
1. Go to `http://localhost:3000/login`
2. Login with:
   - Email: `admin@store.com`
   - Password: `admin123`
3. You should see the Admin Dashboard

### Test 2: View Products (Admin)
1. Go to **Product Management** page
2. You should see 10 sample products already loaded:
   - Coca-Cola 1.5L
   - Chips Ahoy Cookies
   - Mega Sardines
   - Nescafe 3-in-1 (30 packs)
   - Skyflakes Crackers
   - Lucky Me Instant Noodles
   - Bear Brand Powdered Milk
   - Pancit Canton (Sweet & Spicy)
   - Safeguard Soap
   - Canned Tuna

### Test 3: Create a New Product (Admin)
1. Click **Add Product** or **New Product**
2. Fill in the form:
   ```
   Name: Test Product
   Description: Testing the system
   Price: 99.99
   Stock: 50
   Category: Snacks
   Image URL: https://example.com/image.jpg
   Status: active
   ```
3. Click **Create** or **Submit**
4. Product should appear in the list immediately

### Test 4: Test as Staff User
1. Logout and login as staff:
   - Email: `staff@store.com`
   - Password: `staff123`
2. Try to create a product
3. It should show "submitted for admin approval" message
4. The product won't appear in the active list until admin approves it

### Test 5: Test Public View
1. Open an incognito/private browser window
2. Go to `http://localhost:3000`
3. You should see products displayed (only active ones)
4. Try accessing `http://localhost:5000/api/public/products?active=true` in browser
5. You should see JSON list of active products

## Verify Database in Supabase

### Check Products Table
1. Go to Supabase Dashboard
2. Click **Table Editor**
3. Select **products** table
4. You should see your products with correct data

### Check RLS Policies
1. In Supabase, go to **Authentication** → **Policies**
2. Select **products** table
3. You should see these policies:
   - ✅ Allow public read access to active products
   - ✅ Allow anyone to insert products
   - ✅ Allow authenticated users to update products
   - ✅ Allow authenticated users to delete products

### Run Verification Query
In Supabase SQL Editor, run:
```sql
SELECT id, name, price, stock, status, category 
FROM products 
LIMIT 10;
```

You should see your products listed.

## Troubleshooting

### Problem: "Permission denied" error
**Solution:** Make sure you ran the SQL script in Supabase SQL Editor

### Problem: Products not showing up
**Solution:** Check that product status is 'active' (not 'pending')

### Problem: Can't login
**Solution:** 
- Make sure backend server is running on port 5000
- Check that seed data was created (look at console logs)
- Try the default accounts listed above

### Problem: Frontend can't connect to backend
**Solution:**
- Verify backend is running: `http://localhost:5000/api/health`
- Check browser console for CORS errors
- Make sure frontend .env file exists

### Problem: "Failed to fetch" or network errors
**Solution:**
- Check both frontend and backend are running
- Verify no firewall blocking ports 3000 or 5000
- Try restarting both servers

## What Each File Does

### Backend
- `backend/supabase-schema.sql` - Database schema with correct RLS policies
- `backend/scripts/fix-rls-policies.sql` - Script to fix existing databases
- `backend/.env` - Backend configuration (Supabase credentials)
- `backend/config/supabase.js` - Supabase client setup
- `backend/models/product.model.js` - Product database operations
- `backend/controllers/product.controller.js` - Product API logic
- `backend/routes/products.routes.js` - Product API routes

### Frontend
- `frontend/.env` - Frontend configuration
- `frontend/src/api/axios.js` - API client with authentication
- `frontend/src/pages/staff/ProductManagement.jsx` - Product management UI
- `frontend/src/pages/admin/Dashboard.jsx` - Admin dashboard

## Next Steps

1. ✅ Run the SQL schema in Supabase
2. ✅ Start backend server
3. ✅ Start frontend server
4. ✅ Test login with default accounts
5. ✅ Create/update/delete products
6. ✅ Test staff submission workflow
7. ✅ Verify products appear in frontend

## Support

If you encounter issues:
1. Check backend console for error messages
2. Check browser console (F12) for frontend errors
3. Verify Supabase credentials in .env files
4. Ensure SQL schema was executed successfully
5. Check that both servers are running

## Summary

Your products system is now fully configured and ready to use with Supabase. The RLS policies have been fixed, credentials are configured, and the system should work correctly for:
- Creating products (admin direct, staff via approval)
- Reading products (public sees active only, authenticated sees all)
- Updating products (authenticated users)
- Deleting products (authenticated users)
- Stock management
- Low stock alerts