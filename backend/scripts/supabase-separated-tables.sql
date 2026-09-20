-- ============================================================
-- ONE-TIME / IDEMPOTENT SETUP: seperate ang users into 3 tables
--                clients / staff / admins  (Supabase)
-- ============================================================
-- PASTE THIS WHOLE SCRIPT in Supabase SQL Editor and click RUN.
-- SAFE to run multiple times — it will NOT error & NOT duplicate data.
-- It is self-healing:
--   * If a legacy `users` table still exists  -> it migrates from there.
--   * Else if the 3 tables are empty but `users_backup` exists
--     -> it rebuilds the 3 tables from the backup.
--   * If the 3 tables already have data -> it only verifies/ensures
--     schema (RLS, triggers, email-uniqueness) and skips migration.
-- Old `users`/`users_backup` are kept at the end (safety), NOT dropped.
-- ============================================================

-- Helper: does a table exist?
-- (migration runs ONLY when needed, never duplicating data)
CREATE OR REPLACE FUNCTION _tbl_exists(tname text) RETURNS boolean AS $$
BEGIN
    RETURN to_regclass('public.' || tname) IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------
-- 1) SEQUENCES (offset ranges -> id never collides across tables)
-- ------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS clients_id_seq START 1000000 INCREMENT 1;
CREATE SEQUENCE IF NOT EXISTS staff_id_seq   START 2000000 INCREMENT 1;
CREATE SEQUENCE IF NOT EXISTS admins_id_seq  START 3000000 INCREMENT 1;

-- ------------------------------------------------------------
-- 2) THE THREE TABLES (blank / verify if needed)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
    id          INTEGER PRIMARY KEY DEFAULT nextval('admins_id_seq'),
    user_id     VARCHAR(10) UNIQUE,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at  timestamptz DEFAULT timezone('utc', now()) NOT NULL,
    updated_at  timestamptz DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS staff (
    id                   INTEGER PRIMARY KEY DEFAULT nextval('staff_id_seq'),
    user_id              VARCHAR(10) UNIQUE,
    name                 VARCHAR(100) NOT NULL,
    email                VARCHAR(100) NOT NULL UNIQUE,
    password             VARCHAR(255) NOT NULL,
    status               VARCHAR(20) NOT NULL DEFAULT 'pending',
    must_change_password boolean DEFAULT false,
    first_name           VARCHAR(100),
    middle_name          VARCHAR(100),
    last_name            VARCHAR(100),
    birthdate            VARCHAR(20),
    gender               VARCHAR(20),
    address              text,
    contract_details     text,
    phone                VARCHAR(50),
    created_by           integer,
    created_at           timestamptz DEFAULT timezone('utc', now()) NOT NULL,
    updated_at           timestamptz DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS clients (
    id                   INTEGER PRIMARY KEY DEFAULT nextval('clients_id_seq'),
    user_id              VARCHAR(10) UNIQUE,
    name                 VARCHAR(100) NOT NULL,
    email                VARCHAR(100) NOT NULL UNIQUE,
    password             VARCHAR(255) NOT NULL,
    status               VARCHAR(20) NOT NULL DEFAULT 'pending',
    must_change_password boolean DEFAULT false,
    first_name           VARCHAR(100),
    middle_name          VARCHAR(100),
    last_name            VARCHAR(100),
    birthdate            VARCHAR(20),
    gender               VARCHAR(20),
    address              text,
    contract_details     text,
    phone                VARCHAR(50),
    created_by           integer,
    created_at           timestamptz DEFAULT timezone('utc', now()) NOT NULL,
    updated_at           timestamptz DEFAULT timezone('utc', now()) NOT NULL
);
-- ------------------------------------------------------------
-- 3) IDEMPOTENT DATA MIGRATION (runs ONLY if the 3 tables are empty)
--    Source: `users` first, else `users_backup`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS _user_id_migration;
CREATE TABLE _user_id_migration (old_id integer PRIMARY KEY, new_id integer NOT NULL, role text NOT NULL);

DO $$
DECLARE
    src_table text;
    c_count  bigint;
    s_count  bigint;
    a_count  bigint;
    total    bigint;
BEGIN
    IF _tbl_exists('users') THEN
        src_table := 'users';
    ELSIF _tbl_exists('users_backup') THEN
        src_table := 'users_backup';
    ELSE
        src_table := NULL;
    END IF;

    SELECT count(*) INTO c_count FROM clients;
    SELECT count(*) INTO s_count FROM staff;
    SELECT count(*) INTO a_count FROM admins;
    total := c_count + s_count + a_count;

    IF total = 0 AND src_table IS NOT NULL THEN
        RAISE NOTICE 'Migrating from %', src_table;
        EXECUTE format('INSERT INTO admins (name,email,password,status,created_at,updated_at)
            SELECT name,email,password,status,created_at,updated_at FROM %I WHERE role=''admin''', src_table);
        EXECUTE format('INSERT INTO staff (name,email,password,status,must_change_password,
            first_name,middle_name,last_name,birthdate,gender,address,contract_details,phone,created_at,updated_at)
            SELECT name,email,password,status,must_change_password,
            first_name,middle_name,last_name,birthdate,gender,address,contract_details,phone,created_at,updated_at
            FROM %I WHERE role=''staff''', src_table);
        EXECUTE format('INSERT INTO clients (name,email,password,status,must_change_password,
            first_name,middle_name,last_name,birthdate,gender,address,contract_details,phone,created_at,updated_at)
            SELECT name,email,password,status,must_change_password,
            first_name,middle_name,last_name,birthdate,gender,address,contract_details,phone,created_at,updated_at
            FROM %I WHERE role=''client''', src_table);

        EXECUTE format('INSERT INTO _user_id_migration (old_id, new_id, role)
            SELECT u.id, a.id, ''admin'' FROM %I u JOIN admins a ON a.email = u.email WHERE u.role=''admin''', src_table);
        EXECUTE format('INSERT INTO _user_id_migration (old_id, new_id, role)
            SELECT u.id, s.id, ''staff'' FROM %I u JOIN staff s ON s.email = u.email WHERE u.role=''staff''', src_table);
        EXECUTE format('INSERT INTO _user_id_migration (old_id, new_id, role)
            SELECT u.id, c.id, ''client'' FROM %I u JOIN clients c ON c.email = u.email WHERE u.role=''client''', src_table);

        -- Repoint FK references to the new tables (only when we actually migrated)
        UPDATE transactions t SET user_id  = m.new_id FROM _user_id_migration m WHERE t.user_id  = m.old_id AND m.role='client';
        UPDATE transactions t SET staff_id = m.new_id FROM _user_id_migration m WHERE t.staff_id = m.old_id AND m.role='staff';
        UPDATE products            SET created_by = m.new_id FROM _user_id_migration m WHERE products.created_by  = m.old_id;
        UPDATE promos              SET created_by = m.new_id FROM _user_id_migration m WHERE promos.created_by    = m.old_id;
        UPDATE pending_submissions SET submitted_by = m.new_id FROM _user_id_migration m WHERE pending_submissions.submitted_by = m.old_id;
    ELSE
        RAISE NOTICE 'Tables already populated (clients=%, staff=%, admins=%) - skipping data migration.', c_count, s_count, a_count;
    END IF;

    -- Friendly user_ids regardless (C/S/A prefixes)
    UPDATE clients SET user_id = 'C'||lpad((id-1000000)::text,6,'0') WHERE user_id IS NULL;
    UPDATE staff   SET user_id = 'S'||lpad((id-2000000)::text,6,'0') WHERE user_id IS NULL;
    UPDATE admins  SET user_id = 'A'||lpad((id-3000000)::text,6,'0') WHERE user_id IS NULL;
END $$;

-- ------------------------------------------------------------
-- 4) RLS POLICIES (permissive app-key behaviour, like the app uses)
-- ------------------------------------------------------------
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff   ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow app read clients" ON clients;
DROP POLICY IF EXISTS "Allow app insert clients" ON clients;
DROP POLICY IF EXISTS "Allow app update clients" ON clients;
DROP POLICY IF EXISTS "Allow app delete clients" ON clients;
CREATE POLICY "Allow app read clients"   ON clients FOR SELECT USING (true);
CREATE POLICY "Allow app insert clients" ON clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow app update clients" ON clients FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow app delete clients" ON clients FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow app read staff" ON staff;
DROP POLICY IF EXISTS "Allow app insert staff" ON staff;
DROP POLICY IF EXISTS "Allow app update staff" ON staff;
DROP POLICY IF EXISTS "Allow app delete staff" ON staff;
CREATE POLICY "Allow app read staff"   ON staff  FOR SELECT USING (true);
CREATE POLICY "Allow app insert staff" ON staff  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow app update staff" ON staff  FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow app delete staff" ON staff  FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow app read admins" ON admins;
DROP POLICY IF EXISTS "Allow app insert admins" ON admins;
DROP POLICY IF EXISTS "Allow app update admins" ON admins;
DROP POLICY IF EXISTS "Allow app delete admins" ON admins;
CREATE POLICY "Allow app read admins"   ON admins FOR SELECT USING (true);
CREATE POLICY "Allow app insert admins" ON admins FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow app update admins" ON admins FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow app delete admins" ON admins FOR DELETE USING (true);

-- ------------------------------------------------------------
-- 5) GLOBAL EMAIL UNIQUENESS across the 3 tables
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION enforce_global_email_unique()
RETURNS trigger AS $$
BEGIN
    IF TG_TABLE_NAME = 'clients' THEN
        IF EXISTS (SELECT 1 FROM staff  WHERE email = NEW.email)
           OR EXISTS (SELECT 1 FROM admins WHERE email = NEW.email) THEN
            RAISE EXCEPTION 'Email already used by another account.';
        END IF;
    ELSIF TG_TABLE_NAME = 'staff' THEN
        IF EXISTS (SELECT 1 FROM clients WHERE email = NEW.email)
           OR EXISTS (SELECT 1 FROM admins WHERE email = NEW.email) THEN
            RAISE EXCEPTION 'Email already used by another account.';
        END IF;
    ELSE
        IF EXISTS (SELECT 1 FROM clients WHERE email = NEW.email)
           OR EXISTS (SELECT 1 FROM staff  WHERE email = NEW.email) THEN
            RAISE EXCEPTION 'Email already used by another account.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_clients_email_unique ON clients;
CREATE TRIGGER trg_clients_email_unique BEFORE INSERT OR UPDATE OF email ON clients
    FOR EACH ROW EXECUTE FUNCTION enforce_global_email_unique();
DROP TRIGGER IF EXISTS trg_staff_email_unique ON staff;
CREATE TRIGGER trg_staff_email_unique BEFORE INSERT OR UPDATE OF email ON staff
    FOR EACH ROW EXECUTE FUNCTION enforce_global_email_unique();
DROP TRIGGER IF EXISTS trg_admins_email_unique ON admins;
CREATE TRIGGER trg_admins_email_unique BEFORE INSERT OR UPDATE OF email ON admins
    FOR EACH ROW EXECUTE FUNCTION enforce_global_email_unique();

-- ------------------------------------------------------------
-- 6) updated_at triggers
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_staff_updated_at ON staff;
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------
-- 7) DROP the temporary helpers after use
-- ------------------------------------------------------------
DROP TABLE IF EXISTS _user_id_migration;
DROP FUNCTION IF EXISTS _tbl_exists(text);

-- ------------------------------------------------------------
-- 8) VERIFICATION
-- ------------------------------------------------------------
SELECT 'clients' AS table_name, count(*) AS rows FROM clients
UNION ALL SELECT 'staff', count(*) FROM staff
UNION ALL SELECT 'admins', count(*) FROM admins;