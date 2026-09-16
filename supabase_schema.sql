-- Nalathunai Healthcare Platform: Supabase Backend Schema
-- Defines tables for Hospitals (Organizations), Doctors, Patient Consents, and Access Logs
-- Direct Integration with Supabase Project: https://jcwnwrzfwwonxdatpxxf.supabase.co

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. HOSPITALS (ORGANIZATIONS) TABLE
CREATE TABLE IF NOT EXISTS public.hospitals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    license_no TEXT NOT NULL UNIQUE,
    hospital_type TEXT NOT NULL DEFAULT 'Multispecialty',
    city TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'Tamil Nadu',
    address TEXT,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    admin_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    supabase_table TEXT,
    bed_count INTEGER DEFAULT 350,
    accreditation TEXT DEFAULT 'NABH Certified',
    status TEXT NOT NULL DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DOCTORS TABLE
CREATE TABLE IF NOT EXISTS public.doctors (
    id TEXT PRIMARY KEY,
    hospital_id TEXT REFERENCES public.hospitals(id) ON DELETE SET NULL,
    hospital_name TEXT NOT NULL,
    name TEXT NOT NULL,
    reg_number TEXT NOT NULL UNIQUE, -- MCI / NMC / State Medical Council Registration No.
    specialization TEXT NOT NULL,
    department TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    experience_years INTEGER DEFAULT 5,
    qualification TEXT DEFAULT 'MBBS, MD',
    password_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active', -- 'Active', 'On Duty', 'On Leave'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DOCTOR PATIENT CONSENTS TABLE
-- Tracks granular consent requests initiated by doctors and approved/denied by patients
CREATE TABLE IF NOT EXISTS public.doctor_patient_consents (
    id TEXT PRIMARY KEY,
    doctor_id TEXT REFERENCES public.doctors(id) ON DELETE CASCADE,
    doctor_name TEXT NOT NULL,
    doctor_specialization TEXT,
    hospital_id TEXT REFERENCES public.hospitals(id) ON DELETE CASCADE,
    hospital_name TEXT NOT NULL,
    patient_id TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    patient_aadhaar TEXT NOT NULL,
    patient_abha TEXT,
    requested_records JSONB NOT NULL DEFAULT '["All Medical Records"]'::jsonb, -- e.g. ["Lab Reports", "Prescriptions", "Scans"]
    purpose TEXT NOT NULL,
    duration TEXT NOT NULL DEFAULT '30 Days',
    status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'Active', 'Denied', 'Revoked', 'Expired'
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    notes TEXT
);

-- 4. HOSPITAL ACCESS AUDIT LOGS TABLE
-- Records every time a doctor accesses or requests patient medical records
CREATE TABLE IF NOT EXISTS public.hospital_access_logs (
    id TEXT PRIMARY KEY,
    hospital_id TEXT REFERENCES public.hospitals(id) ON DELETE CASCADE,
    hospital_name TEXT NOT NULL,
    doctor_id TEXT REFERENCES public.doctors(id) ON DELETE SET NULL,
    doctor_name TEXT NOT NULL,
    patient_id TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    action TEXT NOT NULL, -- 'CONSENT_REQUESTED', 'RECORD_VIEWED', 'CONSENT_GRANTED', 'CONSENT_REVOKED', 'AI_SUMMARY_GENERATED'
    resource_type TEXT NOT NULL DEFAULT 'Medical Records',
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES for high-speed queries
CREATE INDEX IF NOT EXISTS idx_doctors_hospital_id ON public.doctors(hospital_id);
CREATE INDEX IF NOT EXISTS idx_doctors_reg_number ON public.doctors(reg_number);
CREATE INDEX IF NOT EXISTS idx_consents_doctor_id ON public.doctor_patient_consents(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consents_patient_aadhaar ON public.doctor_patient_consents(patient_aadhaar);
CREATE INDEX IF NOT EXISTS idx_consents_hospital_id ON public.doctor_patient_consents(hospital_id);
CREATE INDEX IF NOT EXISTS idx_consents_status ON public.doctor_patient_consents(status);
CREATE INDEX IF NOT EXISTS idx_access_logs_hospital ON public.hospital_access_logs(hospital_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_doctor ON public.hospital_access_logs(doctor_id);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_patient_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_access_logs ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ & WRITE POLICIES FOR THE ANON CLIENT (Allows REST API query & demo operations)
CREATE POLICY "Allow public read access to hospitals" ON public.hospitals FOR SELECT USING (true);
CREATE POLICY "Allow public insert to hospitals" ON public.hospitals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to hospitals" ON public.hospitals FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to doctors" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Allow public insert to doctors" ON public.doctors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to doctors" ON public.doctors FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to consents" ON public.doctor_patient_consents FOR SELECT USING (true);
CREATE POLICY "Allow public insert to consents" ON public.doctor_patient_consents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to consents" ON public.doctor_patient_consents FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to access logs" ON public.hospital_access_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert to access logs" ON public.hospital_access_logs FOR INSERT WITH CHECK (true);

-- SEED DATA: Baseline Hospitals in Coimbatore Region
INSERT INTO public.hospitals (id, name, license_no, hospital_type, city, state, email, phone, admin_name, password_hash, supabase_table, bed_count)
VALUES
('HOSP-001', 'Ganga Hospital', 'NABH-TN-CBE-041', 'Tertiary Care & Orthopedics', 'Coimbatore', 'Tamil Nadu', 'admin@gangahospital.com', '+91 422 2485000', 'Dr. S. Rajashekaran', 'Admin@123', 'ganga_hospital', 450),
('HOSP-002', 'KMCH Hospital', 'NABH-TN-CBE-088', 'Multispecialty & Cardiac', 'Coimbatore', 'Tamil Nadu', 'admin@kmch.org', '+91 422 4323800', 'Dr. Nalla G Palaniswami', 'Admin@123', 'kmch_hospital', 600),
('HOSP-003', 'Kongunad Hospital', 'NABH-TN-CBE-112', 'Multispecialty Hospital', 'Coimbatore', 'Tamil Nadu', 'admin@kongunadhospital.com', '+91 422 2499111', 'Dr. Raju M', 'Admin@123', 'kongunad_hospital', 250),
('HOSP-004', 'PSG Hospital', 'NABH-TN-CBE-029', 'Super Specialty Teaching Hospital', 'Coimbatore', 'Tamil Nadu', 'admin@psghospitals.com', '+91 422 2570170', 'Dr. J.S. Bhuvaneswaran', 'Admin@123', 'psg_hospital', 800),
('HOSP-005', 'Sri Ramakrishna Hospital', 'NABH-TN-CBE-065', 'Super Specialty Hospital', 'Coimbatore', 'Tamil Nadu', 'admin@sriramakrishnahospital.com', '+91 422 4500000', 'R. Sundar', 'Admin@123', 'sri_ramakrishna_hospital', 500)
ON CONFLICT (id) DO NOTHING;

-- SEED DATA: Baseline Specialists
INSERT INTO public.doctors (id, hospital_id, hospital_name, name, reg_number, specialization, department, email, phone, experience_years, qualification, password_hash, status)
VALUES
('DOC-101', 'HOSP-001', 'Ganga Hospital', 'Dr. Vikram Seth', 'NMC-TN-2015-8491', 'Cardiology', 'Department of Cardiology', 'dr.vikram@gangahospital.com', '+91 98421 11220', 12, 'MBBS, MD, DM (Cardiology)', 'Doctor@123', 'Active'),
('DOC-102', 'HOSP-001', 'Ganga Hospital', 'Dr. S. Malathi', 'NMC-TN-2018-4912', 'Internal Medicine', 'General Medicine & Pathology', 'dr.malathi@gangahospital.com', '+91 98421 33440', 8, 'MBBS, MD (Medicine)', 'Doctor@123', 'Active'),
('DOC-103', 'HOSP-002', 'KMCH Hospital', 'Dr. Rajesh V', 'NMC-TN-2012-1082', 'Interventional Cardiology', 'Department of Cardiology', 'dr.rajesh@kmch.org', '+91 98765 44321', 15, 'MBBS, MS, MCh', 'Doctor@123', 'Active'),
('DOC-104', 'HOSP-002', 'KMCH Hospital', 'Dr. Priya Nair', 'NMC-TN-2020-7731', 'Endocrinology & Diabetology', 'Endocrinology Care Unit', 'dr.priya@kmch.org', '+91 98765 88900', 6, 'MBBS, DNB (Endo)', 'Doctor@123', 'Active'),
('DOC-105', 'HOSP-004', 'PSG Hospital', 'Dr. Arun Kumar', 'NMC-TN-2016-3390', 'Cardiothoracic Surgery', 'Surgical Sciences', 'dr.arun@psghospitals.com', '+91 98422 66778', 10, 'MBBS, MS, MCh', 'Doctor@123', 'Active')
ON CONFLICT (id) DO NOTHING;
