CREATE TABLE IF NOT EXISTS opoint_superadmin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_access_time TIMESTAMP WITH TIME ZONE NULL,
    logs TEXT
);



CREATE TABLE IF NOT EXISTS opoint_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    license_count INTEGER NOT NULL,
    used_licenses INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Active',
    modules JSONB,
    description TEXT,
    registration_id VARCHAR(255),
    address TEXT,
    admin_name VARCHAR(255),
    admin_email VARCHAR(255),
    login_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    admin_id UUID
);





CREATE TABLE IF NOT EXISTS opoint_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    avatar_url TEXT,
    company_id UUID,
    tenant_id UUID REFERENCES opoint_companies(id),
    company_name VARCHAR(255),
    basic_salary DECIMAL(10,2) DEFAULT 0,
   mobile_money_number TEXT,
    hire_date DATE,
    temporary_password VARCHAR(255),
    password_hash VARCHAR(255),
    requires_password_change BOOLEAN DEFAULT false,
    password_changed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS opoint_payroll_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES opoint_companies(id),
    company_name VARCHAR(255),
    transaction_id VARCHAR(255),
    user_id UUID,
    amount DECIMAL(10,2),
    reason TEXT,
    status VARCHAR(50),
    external_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS opoint_employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES opoint_companies(id),
    company_name VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(50),
    department VARCHAR(100),
    position VARCHAR(100),
    basic_salary DECIMAL(10,2) DEFAULT 0,
    hire_date DATE,
    status VARCHAR(50) DEFAULT 'Active',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS opoint_clock_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES opoint_companies(id),
    company_name VARCHAR(255),
    employee_id UUID,
    employee_name VARCHAR(255),
    clock_in TIMESTAMP WITH TIME ZONE,
    clock_out TIMESTAMP WITH TIME ZONE,
    location TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS opoint_leave_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES opoint_companies(id),
    company_name VARCHAR(255),
    employee_id UUID,
     employee_name VARCHAR(255),
    leave_type VARCHAR(50),
    start_date DATE,
    end_date DATE,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS opoint_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES opoint_companies(id),
    company_name VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    author_id UUID,
    author_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);




-- Notifications table
CREATE TABLE IF NOT EXISTS opoint_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    announcement_id UUID REFERENCES opoint_announcements(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'announcement', -- 'announcement', 'system', 'reminder'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_id ON opoint_notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON opoint_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON opoint_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON opoint_notifications(created_at);



-- Indexes for performance on tenant_id
CREATE INDEX IF NOT EXISTS idx_opoint_users_tenant_id ON opoint_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_opoint_payroll_history_tenant_id ON opoint_payroll_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_opoint_employees_tenant_id ON opoint_employees(tenant_id);
CREATE INDEX IF NOT EXISTS idx_opoint_clock_logs_tenant_id ON opoint_clock_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_opoint_leave_logs_tenant_id ON opoint_leave_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_opoint_announcements_tenant_id ON opoint_announcements(tenant_id);





ALTER TABLE opoint_notifications
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE opoint_leave_logs
ADD COLUMN IF NOT EXISTS employee_name VARCHAR(255);



-- Create leave_balances table
CREATE TABLE IF NOT EXISTS opoint_leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES opoint_companies(id),
    employee_id UUID,
    leave_type VARCHAR(50) NOT NULL,
    total_days DECIMAL(5,2) DEFAULT 0,
    used_days DECIMAL(5,2) DEFAULT 0,
    remaining_days DECIMAL(5,2) DEFAULT 0,
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, employee_id, leave_type, year)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_opoint_leave_balances_tenant_employee ON opoint_leave_balances(tenant_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_opoint_leave_balances_year ON opoint_leave_balances(year);


-- =====================================================
-- Migration: Create Expense Claims Table
-- =====================================================

-- Create expense claims table
CREATE TABLE IF NOT EXISTS opoint_expense_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES opoint_companies(id),
    employee_id UUID,
    employee_name VARCHAR(255),
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    expense_date DATE NOT NULL,
    receipt_url TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_opoint_expense_claims_tenant_id ON opoint_expense_claims(tenant_id);
CREATE INDEX IF NOT EXISTS idx_opoint_expense_claims_employee_id ON opoint_expense_claims(employee_id);
CREATE INDEX IF NOT EXISTS idx_opoint_expense_claims_status ON opoint_expense_claims(status);
CREATE INDEX IF NOT EXISTS idx_opoint_expense_claims_submitted_at ON opoint_expense_claims(submitted_at);





-- Migration: Create profile_update_requests table
-- This table stores requests for profile updates that require approval

CREATE TABLE IF NOT EXISTS opoint_profile_update_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES opoint_companies(id),
    user_id UUID NOT NULL,
    employee_name TEXT NOT NULL,
    field_name TEXT NOT NULL, -- e.g., 'mobile_money_number'
    current_value TEXT,
    requested_value TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
    requested_by UUID NOT NULL,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_profile_update_requests_tenant_user ON opoint_profile_update_requests(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_profile_update_requests_status ON opoint_profile_update_requests(status);

-- Add comment for documentation
COMMENT ON TABLE opoint_profile_update_requests IS 'Stores profile update requests that require approval before being applied';
COMMENT ON COLUMN opoint_profile_update_requests.field_name IS 'The field being requested for update (e.g., mobile_money_number)';
COMMENT ON COLUMN opoint_profile_update_requests.current_value IS 'The current value of the field';
COMMENT ON COLUMN opoint_profile_update_requests.requested_value IS 'The new value requested for the field';



GRANT CREATE ON SCHEMA public TO service_role;


select * from opoint_superadmin;
select * from opoint_companies;
select * from opoint_users;
select * from opoint_payroll_history;
select * from opoint_employees;
select * from opoint_clock_logs;
select * from opoint_leave_logs;
select * from opoint_announcements;




drop table opoint_users;
drop table opoint_payroll_history;
drop table opoint_employees;
drop table opoint_clock_logs;
drop table opoint_leave_logs;
drop table opoint_announcements;


commit;


select* from opoint_users
where email = 'pernarhv30@gmail.com';


select * from opoint_companies;