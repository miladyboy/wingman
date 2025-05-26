BEGIN;

-- Remove constraints related to username first (if they exist)
ALTER TABLE public.profiles
    DROP CONSTRAINT IF EXISTS profiles_username_key,
    DROP CONSTRAINT IF EXISTS username_length;

-- Drop the username column itself
ALTER TABLE public.profiles
    DROP COLUMN IF EXISTS username;

-- Drop the function with CASCADE to automatically drop dependent trigger
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create the updated function without username reference
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMIT; 