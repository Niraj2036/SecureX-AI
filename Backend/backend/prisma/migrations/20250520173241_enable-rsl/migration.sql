SELECT set_config('app.tenant_id', '1', TRUE);
-- create a new user to access the database
-- CREATE USER testuser WITH PASSWORD 'pass@123';

-- Allow the user to create databases
-- ALTER USER testuser CREATEDB;

-- Grant usage and creation privileges on the public schema to the user
-- GRANT USAGE ON SCHEMA public TO testuser;
-- GRANT CREATE ON SCHEMA public TO testuser;

-- Grant all privileges on existing tables, sequences, and functions in the public schema to the user
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO testuser;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO testuser;
-- GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO testuser;

-- Alter default privileges in the public schema to grant all privileges on tables to the user
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO testuser;

-- Re-grant all table privileges for redundancy to ensure no issues
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO testuser;

-- Enable Row Level Security
ALTER TABLE "company" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "feedbackViewer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ownership" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "keysResultsUpdates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "feedback" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "keysResults" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "team" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "otp" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "adminAccess" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "passwordResetToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "likes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "topic" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "objective" ENABLE ROW LEVEL SECURITY;

-- Force Row Level Security
ALTER TABLE "company" FORCE ROW LEVEL SECURITY;
ALTER TABLE "user" FORCE ROW LEVEL SECURITY;
ALTER TABLE "feedbackViewer" FORCE ROW LEVEL SECURITY;
ALTER TABLE "session" FORCE ROW LEVEL SECURITY;
ALTER TABLE "ownership" FORCE ROW LEVEL SECURITY;
ALTER TABLE "keysResultsUpdates" FORCE ROW LEVEL SECURITY;
ALTER TABLE "comments" FORCE ROW LEVEL SECURITY;
ALTER TABLE "feedback" FORCE ROW LEVEL SECURITY;
ALTER TABLE "keysResults" FORCE ROW LEVEL SECURITY;
ALTER TABLE "team" FORCE ROW LEVEL SECURITY;
ALTER TABLE "otp" FORCE ROW LEVEL SECURITY;
ALTER TABLE "adminAccess" FORCE ROW LEVEL SECURITY;
ALTER TABLE "passwordResetToken" FORCE ROW LEVEL SECURITY;
ALTER TABLE "likes" FORCE ROW LEVEL SECURITY;
ALTER TABLE "notification" FORCE ROW LEVEL SECURITY;
ALTER TABLE "topic" FORCE ROW LEVEL SECURITY;
ALTER TABLE "objective" FORCE ROW LEVEL SECURITY;

-- Create row security policies for each table
CREATE POLICY tenant_isolation_policy ON "company" USING ("id" = current_setting('app.tenant_id')::text);
CREATE POLICY tenant_isolation_policy ON "user" USING ("tenantId" = current_setting('app.tenant_id')::text);
CREATE POLICY tenant_isolation_policy ON "feedbackViewer" USING ("tenantId" = current_setting('app.tenant_id')::text);
CREATE POLICY tenant_isolation_policy ON "session" USING ("tenantId" = current_setting('app.tenant_id')::text);
CREATE POLICY tenant_isolation_policy ON "ownership" USING ("tenantId" = current_setting('app.tenant_id')::text);
CREATE POLICY tenant_isolation_policy ON "keysResultsUpdates" USING ("tenantId" = current_setting('app.tenant_id')::text);
CREATE POLICY tenant_isolation_policy ON "comments" USING ("tenantId" = current_setting('app.tenant_id')::text);
CREATE POLICY tenant_isolation_policy ON "feedback" USING ("tenantId" = current_setting('app.tenant_id')::text);
CREATE POLICY tenant_isolation_policy ON "keysResults" USING ("tenantId" = current_setting('app.tenant_id')::text);
CREATE POLICY tenant_isolation_policy ON "team" USING ("tenantId" = current_setting('app.tenant_id')::text);
CREATE POLICY tenant_isolation_policy ON "otp" USING ("tenantId" = current_setting('app.tenant_id')::text);
CREATE POLICY tenant_isolation_policy ON "adminAccess" USING ("tenantId" = current_setting('app.tenant_id')::text);
CREATE POLICY tenant_isolation_policy ON "passwordResetToken" USING ("tenantId" = current_setting('app.tenant_id')::text);
CREATE POLICY tenant_isolation_policy ON "likes" USING ("tenantId" = current_setting('app.tenant_id')::text);
CREATE POLICY tenant_isolation_policy ON "notification" USING ("tenantId" = current_setting('app.tenant_id')::text);
CREATE POLICY tenant_isolation_policy ON "topic" USING ("tenantId" = current_setting('app.tenant_id')::text);
CREATE POLICY tenant_isolation_policy ON "objective" USING ("tenantId" = current_setting('app.tenant_id')::text);

-- Create policies to bypass RLS (optional)
CREATE POLICY bypass_rls_policy ON "company" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "user" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "feedbackViewer" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "session" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "ownership" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "keysResultsUpdates" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "comments" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "feedback" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "keysResults" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "team" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "otp" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "adminAccess" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "passwordResetToken" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "likes" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "notification" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "topic" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "objective" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

SELECT set_config('app.bypass_rls', 'on', TRUE);