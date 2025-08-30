-- Drop all existing tables first
DROP TABLE IF EXISTS advice_history CASCADE;
DROP TABLE IF EXISTS symptoms_log CASCADE;
DROP TABLE IF EXISTS clinics CASCADE;

-- Create users table
CREATE TABLE public.users (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name text,
    role text DEFAULT 'user',
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own profile
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create trigger function to auto-insert user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.users (id, name)
    VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', new.email));
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create clinics table
CREATE TABLE public.clinics (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    address text NOT NULL,
    latitude float8 NOT NULL,
    longitude float8 NOT NULL,
    contact_info text,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on clinics - all users can read
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view clinics" ON public.clinics
    FOR SELECT USING (true);

-- Create symptom_logs table
CREATE TABLE public.symptom_logs (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    symptom text NOT NULL,
    severity text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on symptom_logs - only owner can read/insert
ALTER TABLE public.symptom_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own symptom logs" ON public.symptom_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own symptom logs" ON public.symptom_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create health_records table
CREATE TABLE public.health_records (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    record text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on health_records - only owner can read/insert
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own health records" ON public.health_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health records" ON public.health_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create referrals table
CREATE TABLE public.referrals (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    clinic_id uuid NOT NULL REFERENCES public.clinics(id),
    notes text,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on referrals - only owner can read/insert
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referrals" ON public.referrals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own referrals" ON public.referrals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create alerts table
CREATE TABLE public.alerts (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on alerts - all users can read
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view alerts" ON public.alerts
    FOR SELECT USING (true);

-- Insert some sample clinics
INSERT INTO public.clinics (name, address, latitude, longitude, contact_info) VALUES
    ('General Hospital', '123 Main St, City Center', 40.7128, -74.0060, '+1-555-0123'),
    ('Community Health Center', '456 Oak Ave, Downtown', 40.7589, -73.9851, '+1-555-0456'),
    ('Family Medical Clinic', '789 Pine Rd, Suburb', 40.6782, -73.9442, '+1-555-0789'),
    ('Emergency Care Unit', '321 Elm St, Medical District', 40.7505, -73.9934, '+1-555-0321'),
    ('Wellness Center', '654 Maple Dr, North Side', 40.7831, -73.9712, '+1-555-0654');

-- Insert sample alerts
INSERT INTO public.alerts (title, message) VALUES
    ('Health Tip', 'Remember to stay hydrated and drink at least 8 glasses of water daily.'),
    ('Vaccination Reminder', 'Annual flu vaccination is now available at participating clinics.'),
    ('Mental Health', 'Take breaks and practice mindfulness for better mental well-being.');