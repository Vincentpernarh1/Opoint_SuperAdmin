CREATE TABLE IF NOT EXISTS opoint_superadmin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_access_time TIMESTAMP WITH TIME ZONE NULL,
    logs TEXT
);



select * from opoint_companies;


select * from company_vpena_teck_users;

DROP TABLE IF EXISTS opoint_companies;



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
    table_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    admin_id UUID
);

-- Add admin columns if they don't exist (for existing tables)
ALTER TABLE opoint_companies ADD COLUMN IF NOT EXISTS admin_name VARCHAR(255);
ALTER TABLE opoint_companies ADD COLUMN IF NOT EXISTS admin_email VARCHAR(255);
ALTER TABLE opoint_companies ADD COLUMN IF NOT EXISTS login_url TEXT;
ALTER TABLE opoint_companies ADD COLUMN IF NOT EXISTS table_name VARCHAR(255);




CREATE TABLE IF NOT EXISTS opoint_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    avatar_url TEXT,
    company_id UUID,
    basic_salary DECIMAL(10,2) DEFAULT 0,
    hire_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS opoint_payroll_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id VARCHAR(255),
    user_id UUID,
    amount DECIMAL(10,2),
    reason TEXT,
    status VARCHAR(50),
    external_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to create company user table and insert admin user
CREATE OR REPLACE FUNCTION create_company_user_table(
    company_name TEXT,
    company_id UUID,
    admin_id UUID,
    admin_name TEXT,
    admin_email TEXT
)
RETURNS VOID AS $$
DECLARE
    table_name TEXT := 'company_' || lower(replace(company_name, ' ', '_')) || '_users';
BEGIN
    -- Create the table if it doesn't exist
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I (
        id UUID PRIMARY KEY,
        company_id UUID,
        name TEXT,
        email TEXT,
        password_hash TEXT,
        role TEXT,
        basic_salary NUMERIC,
        mobile_money_number TEXT,
        date_of_birth DATE,
        hire_date DATE,
        department TEXT,
        position TEXT,
        status TEXT,
        avatar_url TEXT,
        requires_password_change BOOLEAN,
        last_login TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN,
        created_at TIMESTAMP WITH TIME ZONE,
        updated_at TIMESTAMP WITH TIME ZONE,
        auth_user_id UUID,
        temporary_password TEXT,
        password_changed_at TIMESTAMP WITH TIME ZONE
    )', table_name);
    
    -- Insert the admin user
    EXECUTE format('INSERT INTO %I (id, company_id, name, email, role, status, is_active, requires_password_change, created_at, updated_at) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', table_name)
    USING admin_id, company_id, admin_name, admin_email, 'admin', 'active', true, true, NOW(), NOW();
END;
$$ LANGUAGE plpgsql;













-- Function to drop company user table
CREATE OR REPLACE FUNCTION drop_company_user_table(
    company_name TEXT
)
RETURNS VOID AS $$
DECLARE
    table_name TEXT := 'company_' || lower(replace(company_name, ' ', '_')) || '_users';
BEGIN
    -- Drop the table if it exists
    EXECUTE format('DROP TABLE IF EXISTS %I', table_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;





-- Function to create company user table and insert admin user
CREATE OR REPLACE FUNCTION create_company_user_table(
    company_name TEXT,
    company_id UUID,
    admin_id UUID,
    admin_name TEXT,
    admin_email TEXT
)
RETURNS VOID AS $$
DECLARE
    table_name TEXT := 'company_' || lower(replace(company_name, ' ', '_')) || '_users';
BEGIN
    -- Create the table if it doesn't exist
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I (
        id UUID PRIMARY KEY,
        company_id UUID,
        name TEXT,
        email TEXT,
        password_hash TEXT,
        role TEXT,
        basic_salary NUMERIC,
        mobile_money_number TEXT,
        date_of_birth DATE,
        hire_date DATE,
        department TEXT,
        position TEXT,
        status TEXT,
        avatar_url TEXT,
        requires_password_change BOOLEAN,
        last_login TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN,
        created_at TIMESTAMP WITH TIME ZONE,
        updated_at TIMESTAMP WITH TIME ZONE,
        auth_user_id UUID,
        temporary_password TEXT,
        password_changed_at TIMESTAMP WITH TIME ZONE
    )', table_name);
    
    -- Insert the admin user
    EXECUTE format('INSERT INTO %I (id, company_id, name, email, role, status, is_active, requires_password_change, temporary_password, created_at, updated_at) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)', table_name)
    USING admin_id, company_id, admin_name, admin_email, 'admin', 'active', true, true, '1234', NOW(), NOW();
END;
$$ LANGUAGE plpgsql;





GRANT CREATE ON SCHEMA public TO service_role;


select * from opoint_superadmin;
select * from opoint_companies;
select * from opoint_users;
select * from opoint_payroll_history;