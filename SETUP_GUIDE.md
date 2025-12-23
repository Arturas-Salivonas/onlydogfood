# 🚀 OnlyDogFood.com Setup Guide

## Step 1: Get Supabase API Keys

### Find Your Keys:

1. Go to: https://app.supabase.com
2. Select your project (hjdxainmdvzqsybznywj)
3. Click **Settings** (⚙️ icon in sidebar)
4. Click **API** in the settings menu
5. Find and copy these two keys:

   **a) `anon` `public` key**
   ```
   This starts with: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Copy this to: NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

   **b) `service_role` `secret` key**
   ```
   This also starts with: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Copy this to: SUPABASE_SERVICE_ROLE_KEY
   ⚠️ NEVER commit this to GitHub - it's already in .gitignore
   ```

### Update .env.local:

Open `.env.local` and fill in lines 3 and 4:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://hjdxainmdvzqsybznywj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp...  👈 Paste here
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX...    👈 Paste here
```

You can **delete** these lines (we don't need them):
```env
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable__rAB1pRPICAjghz7u2Vpgw_czysVAA9
DATABASE_URL=postgresql://postgres:u7DCY*!Wehs&Eug*@db.hjdxainmdvzqsybznywj.supabase.co:5432/postgres
```

---

## Step 2: Run Database Migration

### Option A: Using Supabase Dashboard (Recommended)

1. Go to: https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query** button
5. Open file: `supabase/migrations/001_initial_schema.sql`
6. Copy ALL the content (Ctrl+A, Ctrl+C)
7. Paste into SQL Editor (Ctrl+V)
8. Click **Run** (or press Ctrl+Enter)
9. Wait for success message: ✓ Success. No rows returned

### Option B: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref hjdxainmdvzqsybznywj

# Run migration
supabase db push
```

### Verify Migration Success:

1. In Supabase Dashboard, go to **Table Editor**
2. You should see these tables:
   - ✓ brands
   - ✓ products
   - ✓ articles
   - ✓ comparisons
   - ✓ exchange_rates
   - ✓ scrape_logs
   - ✓ admin_users

---

## Step 3: Seed Test Data

Once your .env.local is configured and migration is complete:

```bash
# Make sure you're in the project directory
cd C:\Users\Arturas\Desktop\onlydogfood

# Run the seed script
npm run seed
```

**Expected output:**
```
🌱 Starting database seeding...

📦 Inserting brands...
✓ Created brand: Premium Paws
✓ Created brand: Healthy Hound
✓ Created brand: Nature's Feast
✓ Created brand: Paw Perfect
✓ Created brand: Canine Choice

✅ Inserted 5 brands

🐕 Inserting products...
✓ Created product: Adult Chicken & Rice (Score: 78.5)
✓ Created product: Puppy Formula (Score: 82.3)
✓ Created product: Performance Lamb & Potato (Score: 85.7)
... (10 total products)

✅ Inserted 10 products

🎉 Database seeding completed successfully!
```

### Verify Data in Supabase:

1. Go to **Table Editor** in Supabase
2. Click on **brands** table → you should see 5 brands
3. Click on **products** table → you should see 10 products

---

## Step 4: Start Development

```bash
# Start the dev server (if not already running)
npm run dev
```

Open: http://localhost:3000

You should see the homepage with the hero section!

---

## Step 5: Next Development Steps

### A. Create API Endpoints

We'll create REST API routes for:
- `/api/products` - List products with filters
- `/api/products/[slug]` - Get single product
- `/api/brands` - List brands
- `/api/brands/[slug]` - Get brand with products

### B. Create Core Pages

1. **Dog Food Directory** (`/app/dog-food/page.tsx`)
   - Product grid with filters
   - Pagination
   - Search

2. **Product Detail** (`/app/dog-food/[slug]/page.tsx`)
   - Full product info
   - Score breakdown
   - Related products

3. **Brand Pages** (`/app/brands/[slug]/page.tsx`)
   - Brand info
   - List of all products

4. **Compare Page** (`/app/compare/page.tsx`)
   - Select up to 4 products
   - Side-by-side comparison

### C. Build Scraper

Create scripts to scrape:
- https://www.allaboutdogfood.co.uk/brands
- https://www.allaboutdogfood.co.uk/the-dog-food-directory

### D. Admin Dashboard

Protected admin area at `/admin` for:
- Managing products
- Managing brands
- Running scrapers
- Viewing analytics

---

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Make sure `.env.local` has all three Supabase variables
- Restart your dev server: `Ctrl+C` then `npm run dev`

### Error: "relation 'brands' does not exist"
- You need to run the database migration first (Step 2)

### Error during seeding: "null value in column 'brand_id'"
- The brands weren't created successfully
- Check your SUPABASE_SERVICE_ROLE_KEY is correct

### Can't find API keys in Supabase
- Make sure you're in the right project
- Go to Settings → API (not Settings → Database)
- Look for "Project API keys" section

---

## Quick Checklist

Before moving forward, make sure:

- ✅ `.env.local` has both Supabase keys (anon and service_role)
- ✅ Database migration ran successfully (7 tables created)
- ✅ Seed script ran successfully (5 brands, 10 products)
- ✅ Dev server is running at http://localhost:3000
- ✅ Homepage loads without errors

---

**Need help?** Double-check each step above or ask me specific questions!
