-- PostgreSQL Database Setup Script
-- Run this script to create the database and verify setup

-- Create the database (run this as postgres user)
CREATE DATABASE business_saas_db
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'English_United States.1252'
    LC_CTYPE = 'English_United States.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Connect to the database
\c business_saas_db

-- Verify connection
SELECT current_database();

-- The tables will be automatically created by TypeORM when you start the application
-- This is because synchronize is set to true in development mode

-- To manually verify after the app runs:
-- \dt (list all tables)
-- SELECT * FROM users; (view users table)
