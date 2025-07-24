-- Fix security warnings for function search paths

-- Update the update_updated_at_column function with proper search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update the set_responded_at function with proper search path
CREATE OR REPLACE FUNCTION public.set_responded_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- If RSVP status changed from pending to something else, set responded_at
  IF OLD.rsvp_status = 'pending' AND NEW.rsvp_status != 'pending' THEN
    NEW.responded_at = now();
  END IF;
  -- If status changed back to pending, clear responded_at
  IF NEW.rsvp_status = 'pending' THEN
    NEW.responded_at = NULL;
  END IF;
  RETURN NEW;
END;
$$;