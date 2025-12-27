-- Database initialization script for the Todo application

-- Create the database if it doesn't exist
CREATE DATABASE todo_db;

-- Connect to the database
\c todo_db;

-- Create the todo_user if it doesn't exist
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE rolname = 'todo_user') THEN

      CREATE ROLE todo_user LOGIN PASSWORD 'todo_password';
   END IF;
END
$do$;

-- Grant privileges to the todo_user
GRANT ALL PRIVILEGES ON DATABASE todo_db TO todo_user;

-- Set default permissions for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO todo_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO todo_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO todo_user;