ALTER TABLE public.attendance
  ADD CONSTRAINT attendance_user_date_unique UNIQUE (user_id, attendance_date);