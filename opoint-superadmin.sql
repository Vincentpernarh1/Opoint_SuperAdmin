CREATE TABLE IF NOT EXISTS opoint_superadmin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_access_time TIMESTAMP WITH TIME ZONE NULL,
    logs TEXT
);



select * from opoint_companies


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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    admin_id UUID
);

-- Add admin columns if they don't exist (for existing tables)
ALTER TABLE opoint_companies ADD COLUMN IF NOT EXISTS admin_name VARCHAR(255);
ALTER TABLE opoint_companies ADD COLUMN IF NOT EXISTS admin_email VARCHAR(255);




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

select * from opoint_superadmin;
select * from opoint_companies;
select * from opoint_users;
select * from opoint_payroll_history;