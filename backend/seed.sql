-- Seed data for Convenience Store
USE convenience_store;

-- Default admin account (password: admin123)
INSERT INTO users (user_id, name, email, password, role, status) VALUES
('U100000', 'Admin User', 'admin@store.com', '$2a$10$8KzQMGx5F5G5G5G5G5G5Gu5G5G5G5G5G5G5G5G5G5G5G5G5G5G5G', 'admin', 'active'),
('U100001', 'Staff User', 'staff@store.com', '$2a$10$8KzQMGx5F5G5G5G5G5G5Gu5G5G5G5G5G5G5G5G5G5G5G5G5G5G5G', 'staff', 'active'),
('U100002', 'Juan Customer', 'juan@email.com', '$2a$10$8KzQMGx5F5G5G5G5G5Gu5G5G5G5G5G5G5G5G5G5G5G5G5G5G5G', 'client', 'active');

INSERT INTO products (name, description, price, stock, category, status, created_by) VALUES
INSERT INTO products (name, description, price, stock, category, image_url, status, created_by) VALUES
('Coca-Cola 1.5L', 'Soft drink bottle 1.5 liters', 55.00, 50, 'Beverages', '/product-images/coca-cola-1-5l.jpg', 'active', 2),
('Chips Ahoy Cookies', 'Chocolate chip cookies 150g', 45.00, 30, 'Snacks', '/product-images/chips-ahoy-cookies.jpg', 'active', 2),
('Mega Sardines', 'Sardines in tomato sauce 155g', 25.00, 40, 'Canned Goods', '/product-images/mega-sardines.webp', 'active', 2),
('Nescafe 3-in-1 (30 packs)', 'Instant coffee mix 30 sticks', 120.00, 20, 'Beverages', '/product-images/nescafe-3-in-1-30-packs.jpg', 'active', 2),
('Skyflakes Crackers', 'Saltine crackers 25g', 8.00, 100, 'Snacks', '/product-images/skyflakes-crackers.webp', 'active', 2),
('Lucky Me Spicy Labuyo Beef', 'Spicy Labuyo Beef flavor instant noodles', 15.00, 60, 'Noodles', '/product-images/lucky-me-spicy-labuyo-beef.webp', 'active', 2),
('Coca-Cola 1.5L', 'Soft drink bottle 1.5L', 25.00, 80, 'Beverages', '/product-images/coca-cola-1-5l.jpg', 'active', 2),
('Bear Brand Adult Plus', 'Adult Plus powdered milk 300g', 95.00, 25, 'Dairy', '/product-images/bear-brand-adult-plus.jpg', 'active', 2),
('Pancit Canton (Sweet & Spicy)', 'Instant stir-fry noodles', 18.00, 45, 'Noodles', '/product-images/pancit-canton-sweet-spicy.webp', 'active', 2),
('Safeguard Soap', 'Antibacterial soap 90g', 35.00, 35, 'Personal Care', '/product-images/safeguard-soap.webp', 'active', 2);

-- Sample promos
INSERT INTO promos (title, description, discount_type, discount_value, start_date, end_date, status, created_by) VALUES
('Buy 1 Take 1 - Chips Ahoy', 'Buy 1 Chips Ahoy Cookies, get 1 free!', 'bundle', 100.00, '2026-07-01 00:00:00', '2026-08-31 23:59:59', 'active', 2),
('Nescafe Bundle Discount', '20% off on Nescafe 3-in-1 30 packs', 'percentage', 20.00, '2026-07-15 00:00:00', '2026-08-15 23:59:59', 'active', 2),
('Mega Sardines Sale', 'PHP 5 off per can of Mega Sardines', 'fixed', 5.00, '2026-07-20 00:00:00', '2026-08-20 23:59:59', 'active', 2);

-- Sample transactions
INSERT INTO transactions (receipt_number, user_id, staff_id, total_amount, payment_method, created_at) VALUES
('REC-20260731-001', 3, 2, 175.00, 'cash', '2026-07-31 10:30:00'),
('REC-20260731-002', 3, 2, 88.00, 'cash', '2026-07-31 11:15:00'),
('REC-20260731-003', NULL, 2, 45.00, 'pos', '2026-07-31 14:00:00');

INSERT INTO transaction_items (transaction_id, product_id, quantity, unit_price, subtotal) VALUES
(1, 1, 1, 55.00, 55.00),
(1, 4, 1, 120.00, 120.00),
(2, 6, 2, 15.00, 30.00),
(2, 5, 1, 8.00, 8.00),
(2, 3, 2, 25.00, 50.00),
(3, 2, 1, 45.00, 45.00);