-- Insert Admin User for ConstructOS
-- PostgreSQL/Supabase compatible
-- Run this script in Supabase SQL Editor after creating roles

-- IMPORTANT: Replace the password_hash with your own bcrypt hash!
-- To generate bcrypt hash, use Node.js:
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('your_password', 10);
-- console.log(hash);

-- Insert admin user (replace password_hash with your own!)
INSERT INTO users (
  id,
  name,
  email,
  phone,
  password_hash,
  role,
  status,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Admin User',
  'admin@constructos.com',
  '0900000000',
  '$2b$10$YOUR_BCRYPT_HASH_HERE', -- ⚠️ REPLACE THIS with your own bcrypt hash!
  '00000000-0000-0000-0000-000000000001', -- admin role ID
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Verify admin user was created
SELECT id, name, email, role, status FROM users WHERE email = 'admin@constructos.com';

