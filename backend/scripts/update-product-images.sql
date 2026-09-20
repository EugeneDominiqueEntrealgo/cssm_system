-- Paste this entire file into Supabase SQL Editor and click Run.
-- Image files must be copied to frontend/public/product-images in the frontend project.

UPDATE products
SET image_url = '/product-images/coca-cola-1-5l.jpg'
WHERE name = 'Coca-Cola 1.5L';

UPDATE products
SET image_url = '/product-images/nescafe-3-in-1-30-packs.jpg'
WHERE name = 'Nescafe 3-in-1 (30 packs)';

UPDATE products
SET image_url = '/product-images/chips-ahoy-cookies.jpg'
WHERE name = 'Chips Ahoy Cookies';

UPDATE products
SET image_url = '/product-images/mega-sardines.webp'
WHERE name = 'Mega Sardines';

UPDATE products
SET image_url = '/product-images/skyflakes-crackers.webp'
WHERE name = 'Skyflakes Crackers';

UPDATE products
SET name = 'Lucky Me Spicy Labuyo Beef',
	description = 'Spicy Labuyo Beef flavor instant noodles',
	image_url = '/product-images/lucky-me-spicy-labuyo-beef.webp'
WHERE name IN ('Lucky Me Instant Noodles', 'Lucky Me Spicy Labuyo Beef');

UPDATE products
SET name = 'Bear Brand Adult Plus',
	description = 'Adult Plus powdered milk 300g',
	image_url = '/product-images/bear-brand-adult-plus.jpg'
WHERE name = 'Bear Brand Powdered Milk';

UPDATE products
SET image_url = '/product-images/pancit-canton-sweet-spicy.webp'
WHERE name = 'Pancit Canton (Sweet & Spicy)';

UPDATE products
SET image_url = '/product-images/safeguard-soap.webp'
WHERE name = 'Safeguard Soap';

-- Check the result after the updates.
SELECT id, name, description, price, stock, category, image_url, status
FROM products
ORDER BY id;