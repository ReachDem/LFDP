-- Users
create table public.users (
  id uuid references auth.users primary key,
  email text not null unique,
  role text check (role in ('admin', 'cashier')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Products
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price decimal(10,2) not null,
  stock_quantity integer not null,
  alert_threshold integer not null,
  category_id uuid references public.categories,
  supplier_id uuid references public.suppliers,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Categories
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Customers
create table public.customers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text,
  phone text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Orders
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references public.customers,
  total_amount decimal(10,2) not null,
  status text check (status in ('pending', 'completed', 'cancelled')),
  created_by uuid references public.users,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  sync_status text check (status in ('pending', 'synced', 'error'))
);

-- Order Items
create table public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders,
  product_id uuid references public.products,
  quantity integer not null,
  unit_price decimal(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Reports
create table public.reports (
  id uuid primary key default uuid_generate_v4(),
  type text not null check (type in ('weekly', 'monthly')),
  generated_at timestamp with time zone default timezone('utc'::text, now()),
  data jsonb,
  file_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Stock Movements
create table public.stock_movements (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products not null,
  quantity integer not null,
  movement_type text not null check (movement_type in ('purchase', 'sale', 'adjustment', 'return')),
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

DROP TABLE IF EXISTS suppliers;
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_created_at ON suppliers(created_at);

CREATE TRIGGER update_suppliers_updated_at 
    BEFORE UPDATE ON suppliers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language 'plpgsql';

create trigger update_products_updated_at before update
on public.products for each row
execute procedure update_updated_at_column();
