-- Seed students, profiles, roles, and attendance for Supabase SQL Editor.
-- All generated roles are "student".
-- Login password for every generated student: Student@123!

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

WITH seed_users (id, user_id, full_name, matric_number, email, security_phrase) AS (
  VALUES
    ('11111111-1111-4111-8111-111111111111'::uuid, 'student_ali',    'Ali Ahmad',        'U2024/1001', 'U2024/1001@university.edu', 'Blue pen'),
    ('22222222-2222-4222-8222-222222222222'::uuid, 'student_siti',   'Siti Nurhaliza',   'U2024/1002', 'U2024/1002@university.edu', 'Morning star'),
    ('33333333-3333-4333-8333-333333333333'::uuid, 'student_kumar',  'Kumar Raj',        'U2024/1003', 'U2024/1003@university.edu', 'Green campus'),
    ('44444444-4444-4444-8444-444444444444'::uuid, 'student_mei',    'Tan Mei Ling',     'U2024/1004', 'U2024/1004@university.edu', 'Silver moon'),
    ('55555555-5555-4555-8555-555555555555'::uuid, 'student_farhan', 'Farhan Hakimi',    'U2024/1005', 'U2024/1005@university.edu', 'Quiet library'),
    ('66666666-6666-4666-8666-666666666666'::uuid, 'student_aisha',  'Aisha Rahman',     'U2024/1006', 'U2024/1006@university.edu', 'Golden sunrise')
)
INSERT INTO auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
SELECT
  id,
  'authenticated',
  'authenticated',
  email,
  extensions.crypt('Student@123!', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object(
    'user_id', user_id,
    'full_name', full_name,
    'matric_number', matric_number,
    'security_phrase', security_phrase
  ),
  now(),
  now()
FROM seed_users
ON CONFLICT (id) DO UPDATE SET
  aud = EXCLUDED.aud,
  role = EXCLUDED.role,
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = COALESCE(auth.users.email_confirmed_at, EXCLUDED.email_confirmed_at),
  raw_app_meta_data = EXCLUDED.raw_app_meta_data,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  updated_at = now();

WITH seed_users (id, user_id, full_name, matric_number, email, security_phrase) AS (
  VALUES
    ('11111111-1111-4111-8111-111111111111'::uuid, 'student_ali',    'Ali Ahmad',        'U2024/1001', 'U2024/1001@university.edu', 'Blue pen'),
    ('22222222-2222-4222-8222-222222222222'::uuid, 'student_siti',   'Siti Nurhaliza',   'U2024/1002', 'U2024/1002@university.edu', 'Morning star'),
    ('33333333-3333-4333-8333-333333333333'::uuid, 'student_kumar',  'Kumar Raj',        'U2024/1003', 'U2024/1003@university.edu', 'Green campus'),
    ('44444444-4444-4444-8444-444444444444'::uuid, 'student_mei',    'Tan Mei Ling',     'U2024/1004', 'U2024/1004@university.edu', 'Silver moon'),
    ('55555555-5555-4555-8555-555555555555'::uuid, 'student_farhan', 'Farhan Hakimi',    'U2024/1005', 'U2024/1005@university.edu', 'Quiet library'),
    ('66666666-6666-4666-8666-666666666666'::uuid, 'student_aisha',  'Aisha Rahman',     'U2024/1006', 'U2024/1006@university.edu', 'Golden sunrise')
)
INSERT INTO auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT
  id::text,
  id,
  jsonb_build_object('sub', id::text, 'email', email),
  'email',
  now(),
  now(),
  now()
FROM seed_users
ON CONFLICT (provider_id, provider) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  identity_data = EXCLUDED.identity_data,
  updated_at = now();

WITH seed_users (id, user_id, full_name, matric_number, email, security_phrase) AS (
  VALUES
    ('11111111-1111-4111-8111-111111111111'::uuid, 'student_ali',    'Ali Ahmad',        'U2024/1001', 'U2024/1001@university.edu', 'Blue pen'),
    ('22222222-2222-4222-8222-222222222222'::uuid, 'student_siti',   'Siti Nurhaliza',   'U2024/1002', 'U2024/1002@university.edu', 'Morning star'),
    ('33333333-3333-4333-8333-333333333333'::uuid, 'student_kumar',  'Kumar Raj',        'U2024/1003', 'U2024/1003@university.edu', 'Green campus'),
    ('44444444-4444-4444-8444-444444444444'::uuid, 'student_mei',    'Tan Mei Ling',     'U2024/1004', 'U2024/1004@university.edu', 'Silver moon'),
    ('55555555-5555-4555-8555-555555555555'::uuid, 'student_farhan', 'Farhan Hakimi',    'U2024/1005', 'U2024/1005@university.edu', 'Quiet library'),
    ('66666666-6666-4666-8666-666666666666'::uuid, 'student_aisha',  'Aisha Rahman',     'U2024/1006', 'U2024/1006@university.edu', 'Golden sunrise')
)
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  matric_number,
  user_id,
  security_phrase
)
SELECT id, email, full_name, matric_number, user_id, security_phrase
FROM seed_users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  matric_number = EXCLUDED.matric_number,
  user_id = EXCLUDED.user_id,
  security_phrase = EXCLUDED.security_phrase;

WITH seed_user_ids (id) AS (
  VALUES
    ('11111111-1111-4111-8111-111111111111'::uuid),
    ('22222222-2222-4222-8222-222222222222'::uuid),
    ('33333333-3333-4333-8333-333333333333'::uuid),
    ('44444444-4444-4444-8444-444444444444'::uuid),
    ('55555555-5555-4555-8555-555555555555'::uuid),
    ('66666666-6666-4666-8666-666666666666'::uuid)
)
DELETE FROM public.user_roles
WHERE user_id IN (SELECT id FROM seed_user_ids)
  AND role <> 'student';

WITH seed_user_ids (id) AS (
  VALUES
    ('11111111-1111-4111-8111-111111111111'::uuid),
    ('22222222-2222-4222-8222-222222222222'::uuid),
    ('33333333-3333-4333-8333-333333333333'::uuid),
    ('44444444-4444-4444-8444-444444444444'::uuid),
    ('55555555-5555-4555-8555-555555555555'::uuid),
    ('66666666-6666-4666-8666-666666666666'::uuid)
)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'student'::public.app_role
FROM seed_user_ids
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.attendance (
  user_id,
  attendance_date,
  check_in_time,
  status
)
VALUES
  ('11111111-1111-4111-8111-111111111111'::uuid, '2026-06-09', '2026-06-09 08:05:00+08', 'present'),
  ('11111111-1111-4111-8111-111111111111'::uuid, '2026-06-10', '2026-06-10 08:18:00+08', 'present'),
  ('11111111-1111-4111-8111-111111111111'::uuid, '2026-06-11', '2026-06-11 09:12:00+08', 'late'),
  ('11111111-1111-4111-8111-111111111111'::uuid, '2026-06-12', '2026-06-12 08:22:00+08', 'present'),
  ('11111111-1111-4111-8111-111111111111'::uuid, '2026-06-13', '2026-06-13 08:10:00+08', 'present'),

  ('22222222-2222-4222-8222-222222222222'::uuid, '2026-06-09', '2026-06-09 08:11:00+08', 'present'),
  ('22222222-2222-4222-8222-222222222222'::uuid, '2026-06-10', '2026-06-10 09:25:00+08', 'late'),
  ('22222222-2222-4222-8222-222222222222'::uuid, '2026-06-11', '2026-06-11 08:07:00+08', 'present'),
  ('22222222-2222-4222-8222-222222222222'::uuid, '2026-06-12', '2026-06-12 08:42:00+08', 'present'),
  ('22222222-2222-4222-8222-222222222222'::uuid, '2026-06-13', '2026-06-13 09:02:00+08', 'late'),

  ('33333333-3333-4333-8333-333333333333'::uuid, '2026-06-09', '2026-06-09 09:03:00+08', 'late'),
  ('33333333-3333-4333-8333-333333333333'::uuid, '2026-06-10', '2026-06-10 08:13:00+08', 'present'),
  ('33333333-3333-4333-8333-333333333333'::uuid, '2026-06-11', '2026-06-11 08:33:00+08', 'present'),
  ('33333333-3333-4333-8333-333333333333'::uuid, '2026-06-12', '2026-06-12 09:17:00+08', 'late'),
  ('33333333-3333-4333-8333-333333333333'::uuid, '2026-06-13', '2026-06-13 08:29:00+08', 'present'),

  ('44444444-4444-4444-8444-444444444444'::uuid, '2026-06-09', '2026-06-09 08:16:00+08', 'present'),
  ('44444444-4444-4444-8444-444444444444'::uuid, '2026-06-10', '2026-06-10 08:20:00+08', 'present'),
  ('44444444-4444-4444-8444-444444444444'::uuid, '2026-06-11', '2026-06-11 08:19:00+08', 'present'),
  ('44444444-4444-4444-8444-444444444444'::uuid, '2026-06-12', '2026-06-12 08:31:00+08', 'present'),
  ('44444444-4444-4444-8444-444444444444'::uuid, '2026-06-13', '2026-06-13 08:27:00+08', 'present'),

  ('55555555-5555-4555-8555-555555555555'::uuid, '2026-06-09', '2026-06-09 08:54:00+08', 'present'),
  ('55555555-5555-4555-8555-555555555555'::uuid, '2026-06-10', '2026-06-10 09:11:00+08', 'late'),
  ('55555555-5555-4555-8555-555555555555'::uuid, '2026-06-11', '2026-06-11 09:21:00+08', 'late'),
  ('55555555-5555-4555-8555-555555555555'::uuid, '2026-06-12', '2026-06-12 08:37:00+08', 'present'),
  ('55555555-5555-4555-8555-555555555555'::uuid, '2026-06-13', '2026-06-13 08:45:00+08', 'present'),

  ('66666666-6666-4666-8666-666666666666'::uuid, '2026-06-09', '2026-06-09 08:09:00+08', 'present'),
  ('66666666-6666-4666-8666-666666666666'::uuid, '2026-06-10', '2026-06-10 08:14:00+08', 'present'),
  ('66666666-6666-4666-8666-666666666666'::uuid, '2026-06-11', '2026-06-11 08:58:00+08', 'present'),
  ('66666666-6666-4666-8666-666666666666'::uuid, '2026-06-12', '2026-06-12 09:04:00+08', 'late'),
  ('66666666-6666-4666-8666-666666666666'::uuid, '2026-06-13', '2026-06-13 08:23:00+08', 'present')
ON CONFLICT ON CONSTRAINT attendance_user_date_unique DO UPDATE SET
  check_in_time = EXCLUDED.check_in_time,
  status = EXCLUDED.status;
