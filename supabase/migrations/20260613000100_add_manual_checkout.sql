ALTER TABLE public.attendance
  ADD COLUMN IF NOT EXISTS check_out_time TIMESTAMP WITH TIME ZONE;

CREATE OR REPLACE FUNCTION public.checkout_attendance(
  _attendance_date DATE DEFAULT ((now() AT TIME ZONE 'Asia/Kuala_Lumpur')::date)
)
RETURNS public.attendance
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_record public.attendance;
BEGIN
  UPDATE public.attendance
  SET check_out_time = COALESCE(check_out_time, now())
  WHERE user_id = auth.uid()
    AND attendance_date = _attendance_date
  RETURNING * INTO updated_record;

  IF updated_record.id IS NULL THEN
    RAISE EXCEPTION 'No check-in record found for this date'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN updated_record;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.checkout_attendance(DATE) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.checkout_attendance(DATE) TO authenticated;
