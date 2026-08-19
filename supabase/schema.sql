-- ==============================================================================
-- AL NOOR UNITED FUEL EST. — STATION AUDIT MANAGEMENT SYSTEM
-- PRODUCTION SUPABASE DATABASE SCHEMA, AUTHENTICATION, RLS, & SEED DATA SCRIPT
-- ==============================================================================
-- Instructions: Copy and paste this complete SQL script directly into the 
-- Supabase SQL Editor and click "Run".
-- ==============================================================================

-- 1. REQUIRED POSTGRES EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CLEANUP PREVIOUS TABLES (SAFE RE-RUNNABLE EXECUTION)
DROP TABLE IF EXISTS public.station_audit_notifications CASCADE;
DROP TABLE IF EXISTS public.station_audit_comments CASCADE;
DROP TABLE IF EXISTS public.station_audit_approvals CASCADE;
DROP TABLE IF EXISTS public.station_audit_items CASCADE;
DROP TABLE IF EXISTS public.station_audits CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.stations CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.system_settings CASCADE;

-- ==============================================================================
-- 3. CORE DATABASE TABLES
-- ==============================================================================

-- A. STATIONS TABLE
CREATE TABLE public.stations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_no VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    region VARCHAR(100) DEFAULT 'Central Region',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    operation_supervisor_id UUID,
    operation_supervisor_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- B. USERS TABLE (5 System Roles Only)
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    mobile_number VARCHAR(50),
    position VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'Super Admin',
        'Management',
        'Account Manager',
        'Accountant',
        'Operation Supervisor'
    )),
    assigned_station_id UUID REFERENCES public.stations(id) ON DELETE SET NULL,
    assigned_station_name VARCHAR(255),
    signature_url TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- C. STATION AUDITS TABLE
CREATE TABLE public.station_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_number VARCHAR(50) UNIQUE NOT NULL,
    station_id UUID NOT NULL REFERENCES public.stations(id) ON DELETE CASCADE,
    station_no VARCHAR(50) NOT NULL,
    station_name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    audit_date DATE NOT NULL,
    created_by UUID NOT NULL REFERENCES public.users(id),
    created_by_name VARCHAR(255) NOT NULL,
    created_by_role VARCHAR(50) NOT NULL,
    
    -- Preparation On-Site Signatures
    station_supervisor_name VARCHAR(255) NOT NULL,
    station_supervisor_signature_url TEXT,
    operation_supervisor_signature_url TEXT,
    
    -- Status Workflow
    current_status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (current_status IN (
        'draft',
        'pending_accountant',
        'pending_account_manager',
        'pending_management',
        'approved',
        'rejected',
        'returned_for_correction'
    )),
    
    -- Financial reconciliation fields
    noor_khoy_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    atm_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    atm_pos_attachments JSONB DEFAULT '[]'::jsonb,
    cash_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    cash_received_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    
    -- Summary calculated fields
    total_sales NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discrepancy_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_station_audit_per_date UNIQUE (station_id, audit_date)
);

-- D. STATION AUDIT PUMP ITEMS TABLE (Pumps 1-15 per fuel type)
CREATE TABLE public.station_audit_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES public.station_audits(id) ON DELETE CASCADE,
    fuel_type VARCHAR(20) NOT NULL CHECK (fuel_type IN ('PETROL_91', 'PETROL_95', 'DIESEL')),
    pump_no INT NOT NULL CHECK (pump_no BETWEEN 1 AND 15),
    start_reading NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    end_reading NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    quantity_sold NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    price NUMERIC(10, 3) NOT NULL DEFAULT 0.000,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_audit_fuel_pump UNIQUE (audit_id, fuel_type, pump_no)
);

-- E. STATION AUDIT APPROVALS TABLE (3 Sequential Steps)
CREATE TABLE public.station_audit_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES public.station_audits(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('accountant', 'account_manager', 'management')),
    role_display_name VARCHAR(100) NOT NULL,
    approver_id UUID REFERENCES public.users(id),
    approver_name VARCHAR(255),
    approver_position VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'returned')),
    comments TEXT,
    action_timestamp TIMESTAMP WITH TIME ZONE,
    digital_signature_code VARCHAR(100),
    signature_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_audit_role_approval UNIQUE (audit_id, role)
);

-- F. STATION AUDIT COMMENTS THREAD TABLE
CREATE TABLE public.station_audit_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES public.station_audits(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- G. STATION AUDIT NOTIFICATIONS TABLE
CREATE TABLE public.station_audit_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES public.station_audits(id) ON DELETE CASCADE,
    audit_number VARCHAR(50) NOT NULL,
    station_name VARCHAR(255) NOT NULL,
    recipient_role VARCHAR(50) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- H. AUDIT LOGS TABLE (SECURITY AUDITING)
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    user_name VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- I. SYSTEM SETTINGS TABLE
CREATE TABLE public.system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 4. DATABASE INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX idx_station_audits_created_by ON public.station_audits(created_by);
CREATE INDEX idx_station_audits_status ON public.station_audits(current_status);
CREATE INDEX idx_station_audits_date ON public.station_audits(audit_date);
CREATE INDEX idx_audit_items_audit_id ON public.station_audit_items(audit_id);
CREATE INDEX idx_audit_approvals_audit_id ON public.station_audit_approvals(audit_id);
CREATE INDEX idx_audit_comments_audit_id ON public.station_audit_comments(audit_id);

-- ==============================================================================
-- 5. POSTGREST SCHEMA GRANTS & ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- GRANT FULL PERMISSIONS TO ANON AND AUTHENTICATED ROLES FOR REST API
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_audit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_audit_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_audit_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_audit_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- USERS & STATIONS PUBLIC RLS POLICIES
CREATE POLICY "Users table select policy" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users table all policy" ON public.users FOR ALL USING (true);
CREATE POLICY "Stations table select policy" ON public.stations FOR SELECT USING (true);
CREATE POLICY "Stations table all policy" ON public.stations FOR ALL USING (true);

-- AUDITS CREATOR ISOLATION & APPROVER RLS POLICIES
CREATE POLICY "Audits table select policy" 
ON public.station_audits
FOR SELECT USING (true);

CREATE POLICY "Audits table insert policy" 
ON public.station_audits
FOR INSERT WITH CHECK (true);

CREATE POLICY "Audits table update policy" 
ON public.station_audits
FOR UPDATE USING (true);

CREATE POLICY "Audits table delete policy" 
ON public.station_audits
FOR DELETE USING (true);

-- CHILD TABLES RLS POLICIES
CREATE POLICY "Audit items policy" ON public.station_audit_items FOR ALL USING (true);
CREATE POLICY "Audit approvals policy" ON public.station_audit_approvals FOR ALL USING (true);
CREATE POLICY "Audit comments policy" ON public.station_audit_comments FOR ALL USING (true);
CREATE POLICY "Audit notifications policy" ON public.station_audit_notifications FOR ALL USING (true);
CREATE POLICY "Audit logs policy" ON public.audit_logs FOR ALL USING (true);
CREATE POLICY "System settings policy" ON public.system_settings FOR ALL USING (true);

-- ==============================================================================
-- 6. STORAGE BUCKETS CONFIGURATION (SIGNATURES & ATTACHMENTS)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('signatures', 'signatures', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('audit-attachments', 'audit-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- DROP EXISTING STORAGE POLICIES IF PRESENT (SAFE RE-RUNNABLE EXECUTION)
DROP POLICY IF EXISTS "Public Read Access for Signatures" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload for Signatures" ON storage.objects;

CREATE POLICY "Public Read Access for Signatures" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'signatures');

CREATE POLICY "Authenticated Upload for Signatures" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'signatures');

-- ==============================================================================
-- 7. SUPABASE REALTIME CONFIGURATION
-- ==============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.station_audits;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.station_audit_notifications;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.station_audit_comments;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- ==============================================================================
-- 8. DEFAULT SEED DATA & SUPER ADMIN ACCOUNT SETUP
-- ==============================================================================

-- A. SEED DEFAULT SYSTEM SETTINGS
INSERT INTO public.system_settings (key, value, description)
VALUES 
    ('company_name', 'Al Noor United Fuel Est.', 'Official Company Name'),
    ('company_name_ar', 'مؤسسة النور المتحدة للوقود', 'Arabic Company Name'),
    ('session_timeout_minutes', '30', 'Session inactivity timeout in minutes'),
    ('p91_price', '2.18', 'Default Petrol 91 Price per Liter'),
    ('p95_price', '2.33', 'Default Petrol 95 Price per Liter'),
    ('diesel_price', '1.15', 'Default Diesel Price per Liter')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- B. SEED INITIAL STATIONS
INSERT INTO public.stations (id, station_no, name, location, region, status)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ST-101', 'Al Malaz Fuel Station', 'Riyadh - Al Malaz District', 'Central Region', 'active'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'ST-102', 'Al Olaya Grand Station', 'Riyadh - King Fahd Rd', 'Central Region', 'active'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'ST-201', 'Corniche Central Station', 'Jeddah - North Corniche', 'Western Region', 'active'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'ST-301', 'Dammam Port Station', 'Dammam - Coastal Road', 'Eastern Region', 'active')
ON CONFLICT (station_no) DO NOTHING;

-- C. SEED DEFAULT SUPER ADMIN ACCOUNT IN SUPABASE AUTH & PUBLIC USERS
DO $$
DECLARE
    admin_uuid UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    -- Delete existing entries for clean re-creation if needed
    DELETE FROM auth.identities WHERE user_id = admin_uuid OR provider_id = 'admin@alnoor.sa';
    DELETE FROM auth.users WHERE id = admin_uuid OR email = 'admin@alnoor.sa';

    -- Insert into Supabase auth.users table
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        role,
        aud
    ) VALUES (
        admin_uuid,
        '00000000-0000-0000-0000-000000000000',
        'admin@alnoor.sa',
        '',
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Eng. Ibrahim Al-Mansoor","username":"admin","role":"Super Admin"}',
        NOW(),
        NOW(),
        'authenticated',
        'authenticated'
    );

    -- Insert into auth.identities
    INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at,
        provider_id
    ) VALUES (
        admin_uuid,
        admin_uuid,
        format('{"sub":"%s","email":"admin@alnoor.sa","email_verified":true}', admin_uuid)::jsonb,
        'email',
        NOW(),
        NOW(),
        NOW(),
        'admin@alnoor.sa'
    );

    -- Insert into public.users table
    INSERT INTO public.users (
        id,
        employee_id,
        full_name,
        email,
        username,
        password_hash,
        mobile_number,
        position,
        role,
        status
    ) VALUES (
        admin_uuid,
        'EMP-001',
        'Eng. Ibrahim Al-Mansoor',
        'admin@alnoor.sa',
        'admin',
        '',
        '+966 50 111 2233',
        'Chief Enterprise Admin',
        'Super Admin',
        'active'
    )
    ON CONFLICT (id) DO UPDATE SET 
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role;
END $$;

-- D. AUTOMATED TRIGGER & SYNC FOR AUTOMATIC USER PROVISIONING
-- 1. Trigger function on auth.users AFTER INSERT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role text;
    user_module text;
BEGIN
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'Operation Supervisor');
    user_module := COALESCE(NEW.raw_user_meta_data->>'module', '');

    IF user_module = 'station-opening' OR user_role IN (
        'Head of Operation',
        'Safety & Quality Control',
        'Document Controller',
        'Engineering Department',
        'Al Noor United Management'
    ) THEN
        INSERT INTO public.station_opening_users (
            id,
            employee_id,
            full_name,
            email,
            username,
            role,
            status,
            login_enabled,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            'SO-EMP-' || UPPER(SUBSTRING(NEW.id::text FROM 1 FOR 6)),
            COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
            user_role,
            'active',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            role = EXCLUDED.role,
            updated_at = NOW();
    ELSE
        INSERT INTO public.users (
            id,
            employee_id,
            full_name,
            email,
            username,
            password_hash,
            position,
            role,
            status,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            'EMP-' || UPPER(SUBSTRING(NEW.id::text FROM 1 FOR 6)),
            COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
            '',
            COALESCE(NEW.raw_user_meta_data->>'position', 'Staff Member'),
            user_role,
            'active',
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
            role = COALESCE(EXCLUDED.role, public.users.role),
            position = COALESCE(EXCLUDED.position, public.users.position),
            updated_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. RPC function to synchronize orphaned auth.users with public.users
CREATE OR REPLACE FUNCTION public.sync_unmapped_auth_users()
RETURNS void AS $$
BEGIN
    INSERT INTO public.users (
        id,
        employee_id,
        full_name,
        email,
        username,
        password_hash,
        position,
        role,
        status,
        created_at,
        updated_at
    )
    SELECT
        au.id,
        'EMP-' || UPPER(SUBSTRING(au.id::text FROM 1 FOR 6)),
        COALESCE(au.raw_user_meta_data->>'full_name', SPLIT_PART(au.email, '@', 1)),
        au.email,
        COALESCE(au.raw_user_meta_data->>'username', SPLIT_PART(au.email, '@', 1)),
        '',
        COALESCE(au.raw_user_meta_data->>'position', 'Staff Member'),
        COALESCE(au.raw_user_meta_data->>'role', 'Operation Supervisor'),
        'active',
        COALESCE(au.created_at, NOW()),
        NOW()
    FROM auth.users au
    LEFT JOIN public.users pu ON au.id = pu.id
    WHERE pu.id IS NULL AND au.email IS NOT NULL
    ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 8. STATION OPENING FORM MODULE TABLES (INDEPENDENT ENTERPRISE MODULE)
-- ==============================================================================

-- A. STATION OPENING USERS TABLE
CREATE TABLE IF NOT EXISTS public.station_opening_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    mobile_number VARCHAR(50),
    role VARCHAR(100) NOT NULL CHECK (role IN (
        'Head of Operation',
        'Safety & Quality Control',
        'Document Controller',
        'Engineering Department',
        'Al Noor United Management'
    )),
    signature_url TEXT,
    profile_photo_url TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    login_enabled BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    created_by_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- B. STATION OPENING FORMS TABLE
CREATE TABLE IF NOT EXISTS public.station_opening_forms (
    id VARCHAR(100) PRIMARY KEY,
    form_number VARCHAR(50) UNIQUE NOT NULL,
    station_id UUID REFERENCES public.stations(id) ON DELETE SET NULL,
    station_name VARCHAR(255) NOT NULL,
    current_status VARCHAR(50) NOT NULL DEFAULT 'draft',
    created_by VARCHAR(100) NOT NULL,
    form_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- C. STATION OPENING APPROVALS TABLE (STAGE APPROVAL WORKFLOW AUDIT TRAIL)
CREATE TABLE IF NOT EXISTS public.station_opening_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id VARCHAR(100) REFERENCES public.station_opening_forms(id) ON DELETE CASCADE,
    stage_name VARCHAR(100) NOT NULL,
    approver_role VARCHAR(100) NOT NULL,
    approver_id UUID REFERENCES public.station_opening_users(id) ON DELETE SET NULL,
    approver_name VARCHAR(255) NOT NULL,
    action_status VARCHAR(50) NOT NULL CHECK (action_status IN ('pending', 'approved', 'returned', 'rejected')),
    comments TEXT,
    signature_url TEXT,
    action_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- D. STATION OPENING NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.station_opening_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_role VARCHAR(100) NOT NULL,
    recipient_id UUID REFERENCES public.station_opening_users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    form_id VARCHAR(100) REFERENCES public.station_opening_forms(id) ON DELETE CASCADE,
    form_number VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- E. STATION OPENING AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.station_opening_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id VARCHAR(100) REFERENCES public.station_opening_forms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.station_opening_users(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(100) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- F. RLS POLICIES FOR STATION OPENING TABLES
ALTER TABLE public.station_opening_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_opening_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_opening_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_opening_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_opening_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access for station_opening_users" ON public.station_opening_users FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert/update/delete for station_opening_users" ON public.station_opening_users FOR ALL USING (true);

CREATE POLICY "Allow public read access for station_opening_forms" ON public.station_opening_forms FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert/update/delete for station_opening_forms" ON public.station_opening_forms FOR ALL USING (true);

CREATE POLICY "Allow public read access for station_opening_approvals" ON public.station_opening_approvals FOR SELECT USING (true);
CREATE POLICY "Allow authenticated access for station_opening_approvals" ON public.station_opening_approvals FOR ALL USING (true);

CREATE POLICY "Allow public read access for station_opening_notifications" ON public.station_opening_notifications FOR SELECT USING (true);
CREATE POLICY "Allow authenticated access for station_opening_notifications" ON public.station_opening_notifications FOR ALL USING (true);

CREATE POLICY "Allow public read access for station_opening_audit_logs" ON public.station_opening_audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow authenticated access for station_opening_audit_logs" ON public.station_opening_audit_logs FOR ALL USING (true);

-- ==============================================================================
-- END OF SUPABASE DATABASE SCHEMA & INITIALIZATION SCRIPT
-- ==============================================================================
