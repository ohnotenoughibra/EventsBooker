-- Run this after you've signed up with your admin account
-- Replace 'your-email@example.com' with your actual email address

-- Make a user admin by email
UPDATE public.profiles
SET is_admin = TRUE
WHERE email = 'your-email@example.com';

-- Or make a user admin by user ID (get from Supabase Auth dashboard)
-- UPDATE public.profiles
-- SET is_admin = TRUE
-- WHERE id = 'your-user-uuid-here';
