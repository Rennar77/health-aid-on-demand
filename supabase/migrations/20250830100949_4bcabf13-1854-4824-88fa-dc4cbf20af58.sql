-- Fix security warning: Function Search Path Mutable
-- Update the trigger function to have proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.users (id, name)
    VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', new.email));
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;