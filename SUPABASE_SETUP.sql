-- ==========================================
-- SUPABASE SCHEMA SETUP FOR CAPITÃO EMBALAGENS
-- Copy and run this script in the Supabase SQL Editor
-- ==========================================

-- 1. Create the products table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    brand TEXT,
    price NUMERIC NOT NULL,
    promo_price NUMERIC,
    rating NUMERIC DEFAULT 5.0,
    stock INTEGER DEFAULT 0,
    category TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    image TEXT,
    reviews JSONB DEFAULT '[]'::jsonb,
    related_products JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create the orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pendente',
    payment_method TEXT,
    delivery_option TEXT,
    address JSONB NOT NULL DEFAULT '{}'::jsonb,
    tracking_code TEXT,
    status_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 3. Create the customers table
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    addresses JSONB DEFAULT '[]'::jsonb,
    cashback NUMERIC DEFAULT 0.0,
    loyalty_points INTEGER DEFAULT 0,
    photo TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create the admins table
CREATE TABLE IF NOT EXISTS public.admins (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create public access policies (Allow anyone to read products, and authenticated/anon to create orders)
CREATE POLICY "Allow public read on products" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Allow full access on products to service role / admin" ON public.products
    FOR ALL USING (true);

CREATE POLICY "Allow public read/write on orders" ON public.orders
    FOR ALL USING (true);

CREATE POLICY "Allow public read/write on customers" ON public.customers
    FOR ALL USING (true);

CREATE POLICY "Allow public read/write on admins" ON public.admins
    FOR ALL USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_code ON public.products(code);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);
