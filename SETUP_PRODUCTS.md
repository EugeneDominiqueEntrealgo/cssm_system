# Setup Guide: Products/Goods in Supabase Database

## Overview
This guide will help you set up and fix the products/goods system in your Supabase database.

## Issues Fixed
1. **Incorrect RLS policies**: Changed from `auth.role() = 'authenticated'` to `auth.uid() IS NOT NULL`
2. **Missing INSERT policy**: Added INSERT policy for products table
3. **Missing DELETE policy**: Added DELETE policy for products and promos tables
4. **Authentication checks**: Updated all RLS policies to use correct Supabase authentication functions

## Step-by-Step Setup

### Step 1: Set Up Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project or use your existing project
3. Note down your project URL and anon/public key

### Step 2: Configure Backend Environment
1. Open `backend/.env` file
2. Update the following variables:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   JWT_SECRET=your_jwt_secret_key_here
   PORT=5000
   ```

### Step 3: Create Database Schema
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `backend/supabase-schema.sql`
4. Click **Run** to execute the SQL script
5. This will create all tables with correct RLS policies

**OR** if you already have the tables and just need to fix the policies:
1. Open `backend/scripts/fix-rls-policies.sql`
2. Copy and paste it into the Supabase SQL Editor
3. Click **Run** to fix all RLS policies

### Step 4: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 5: Start the Backend Server
```bash
npm run dev
```
The server should start on `http://localhost:5000`

### Step 6: Seed Initial Data (Optional)
The database will automatically seed initial data (admin user, staff user, sample products) when you first start the server if the database is empty.

**Default accounts:**
- Admin: `admin@store.com` / `admin123`
- Staff: `staff@store.com` / `staff123`
- User: `juan@email.com` / `user123`

## How Products Work

### Product Creation Flow
1. **Staff users** submit products for approval → Creates a `pending_submissions` record
2. **Admin users** review submissions → Can approve/reject with notes
3. **Admin users** can create products directly → Immediately active

### Product Status Values
- `pending` - Awaiting admin approval (for staff submissions)
- `active` - Available for sale/display
- `inactive` - Hidden from public but data retained

### RLS Policy Summary for Products

| Operation | Who Can Do It |
|-----------|---------------|
| **SELECT (Read)** | Public can read active products; Authenticated users can read all |
| **INSERT (Create)** | Anyone (backend validates via JWT) |
| **UPDATE** | Authenticated users only |
| **DELETE** | Authenticated users only |

## Testing the Products API

### 1. Login to Get Token
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@store.com",
  "password": "admin123"
}
```

Save the `token` from the response.

### 2. Get All Products (Admin/Staff only)
```bash
GET http://localhost:5000/api/products
Authorization: Bearer YOUR_TOKEN_HERE
```

### 3. Get Active Products Only (Public)
```bash
GET http://localhost:5000/api/public/products?active=true
```

### 4. Create a Product (Admin only - direct creation)
```bash
POST http://localhost:5000/api/products
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "stock": 50,
  "category": "Snacks",
  "image_url": "https://example.com/image.jpg",
  "status": "active"
}
```

### 5. Create a Product (Staff - goes to approval)
```bash
POST http://localhost:5000/api/products
Authorization: Bearer STAFF_TOKEN_HERE
Content-Type: application/json

{
  "name": "Staff Product",
  "description": "Needs approval",
  "price": 50.00,
  "stock": 20,
  "category": "Beverages"
}
```

### 6. Update a Product
```bash
PUT http://localhost:5000/api/products/1
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "price": 89.99,
  "stock": 45
}
```

### 7. Delete a Product (Admin only)
```bash
DELETE http://localhost:5000/api/products/1
Authorization: Bearer YOUR_TOKEN_HERE
```

### 8. Get Low Stock Products
```bash
GET http://localhost:5000/api/products/low-stock?threshold=10
Authorization: Bearer YOUR_TOKEN_HERE
```

## Common Issues and Solutions

### Issue 1: "Permission denied" error when inserting products
**Solution:** Make sure you've run the `fix-rls-policies.sql` script in Supabase SQL Editor.

### Issue 2: Products not showing up for public users
**Solution:** Ensure product status is set to `'active'`. Only active products are visible to the public.

### Issue 3: Staff can't create products
**Solution:** Staff submissions go through approval. Check the `pending_submissions` table and use the admin approval system.

### Issue 4: "Invalid token" error
**Solution:** 
- Verify JWT_SECRET is set in `.env`
- Make sure you're sending the token in the correct format: `Authorization: Bearer <token>`

## Database Schema for Products

```sql
products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  category VARCHAR(100) NOT NULL,
  image_url VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
```

## Verification Steps

1. **Check tables exist:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('products', 'users', 'promos', 'transactions');
   ```

2. **Check RLS policies:**
   ```sql
   SELECT tablename, policyname, cmd 
   FROM pg_policies 
   WHERE tablename = 'products';
   ```

3. **Check products data:**
   ```sql
   SELECT id, name, price, stock, status, category 
   FROM products 
   LIMIT 10;
   ```

## Next Steps
- Test creating products through the API
- Test the approval workflow (staff submit → admin approves)
- Verify products appear correctly in the frontend
- Check that stock updates work properly during transactions

## Support
If you encounter issues:
1. Check the backend console logs for errors
2. Verify Supabase credentials in `.env`
3. Ensure all SQL scripts have been executed
4. Check RLS policies in Supabase dashboard → Table Editor → Products → Policies