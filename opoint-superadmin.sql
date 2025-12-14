CREATE TABLE IF NOT EXISTS opoint_superadmin (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_access_time TIMESTAMP WITH TIME ZONE NULL,
    logs TEXT
);



select * from opoint_superadmin;