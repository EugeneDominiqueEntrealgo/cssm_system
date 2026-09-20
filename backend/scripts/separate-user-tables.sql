-- ============================================================
-- MIGRATION: Separate the single `users` table into three tables
--            clients / staff / admins  (TRUE physical separation)
--
-- Run this ENTIRE script in the Supabase SQL Editor (NEW QUERY).
-- It is SAFE: the old `users` table is RENAMED to `users_backup`,
--            it is NOT dropped, so you can always roll back.
--
-- Key design decisions:
--   * Each table uses an OFFSET id range so numeric `id` values are
--     globally unique across all three tables (clients 1,000,000+,
--     staff 2,000,000+, admins 3,000,000+). This keeps req.user.id
--     (used everywhere in the JWT / controllers) unique & unambiguous.
--   * Existing rows keep their email/password/etc. New auto ids are
--     mapped so transactions/products/promos/submissions still point
--     at the right person.
--   * transactions.user_id -> clients(id), staff_id -> staff(id).
--   * The `users` table is preserved as `users_backup` at the very end.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1) SEQUENCES (offset ranges so `id` never collides across tables)
-- ------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS clients_id_seq START 1000000 INCREMENT 1;
CREATE SEQUENCE IF NOT EXISTS staff_id_seq   START 2000000 INCREMENT 1;
CREATE SEQUENCE IF NOT EXISTS admins_id_seq  START 3000000 INCREMENT 1;

-- ------------------------------------------------------------
-- 2) NEW TABLES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
    id          INTEGER PRIMARY KEY DEFAULT nextval('admins_id_seq'),
    user_id     VARCHAR(10) UNIQUE,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at  TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS staff (
    id                   INTEGER PRIMARY KEY DEFAULT nextval('staff_id_seq'),
    user_id              VARCHAR(10) UNIQUE,
    name                 VARCHAR(100) NOT NULL,
    email                VARCHAR(100) NOT NULL UNIQUE,
    password             VARCHAR(255) NOT NULL,
    status               VARCHAR(20) NOT NULL DEFAULT 'pending',
    must_change_password BOOLEAN DEFAULT false,
    first_name           VARCHAR(100),
    middle_name          VARCHAR(100),
    last_name            VARCHAR(100),
    birthdate            VARCHAR(20),
    gender               VARCHAR(20),
    address              TEXT,
    contract_details     TEXT,
    phone                VARCHAR(50),
    created_by           INTEGER,
    created_at           TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at           TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS clients (
    id                   INTEGER PRIMARY KEY DEFAULT nextval('clients_id_seq'),
    user_id              VARCHAR(10) UNIQUE,
    name                 VARCHAR(100) NOT NULL,
    email                VARCHAR(100) NOT NULL UNIQUE,
    password             VARCHAR(255) NOT NULL,
    status               VARCHAR(20) NOT NULL DEFAULT 'pending',
    must_change_password BOOLEAN DEFAULT false,
    first_name           VARCHAR(100),
    middle_name          VARCHAR(100),
    last_name            VARCHAR(100),
    birthdate            VARCHAR(20),
    gender               VARCHAR(20),
    address              TEXT,
    contract_details     TEXT,
    phone                VARCHAR(50),
    created_by           INTEGER,
    created_at           TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at           TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------
-- 3) TEMP MAPPING TABLE (old users.id -> new id)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS _user_id_migration;
CREATE TABLE _user_id_migration (
    old_id  INTEGER PRIMARY KEY,
    new_id  INTEGER NOT NULL,
    role    VARCHAR(20) NOT NULL
);

-- ------------------------------------------------------------
-- 4) COPY DATA FROM `users` (preserving credentials AND profile fields, remapping ids)
-- ----------------------------------------------------------------------
-- admins table has no profile columns, so only auth fields are copied.
WITH ins AS (
    INSERT INTO admins (name, email, password, status, created_at, updated_at)
    SELECT name, email, password, status, created_at, updated_at
    FROM users WHERE role = 'admin'
    RETURNING id, email
)
INSERT INTO _user_id_migration (old_id, new_id, role)
SELECT u.id, ins.id, 'admin'
FROM users u JOIN ins ON ins.email = u.email
WHERE u.role = 'admin';

-- staff keeps all its profile fields
WITH ins AS (
    INSERT INTO staff (name, email, password, status,
                       must_change_password,
                       first_name, middle_name, last_name, birthdate, gender,
                       address, contract_details, phone,
                       created_at, updated_at)
    SELECT name, email, password, status,
           must_change_password,
           first_name, middle_name, last_name, birthdate, gender,
           address, contract_details, phone,
           created_at, updated_at
    FROM users WHERE role = 'staff'
    RETURNING id, email
)
INSERT INTO _user_id_migration (old_id, new_id, role)
SELECT u.id, ins.id, 'staff'
FROM users u JOIN ins ON ins.email = u.email
WHERE u.role = 'staff';

-- clients keeps all its profile fields
WITH ins AS (
    INSERT INTO clients (name, email, password, status,
                         must_change_password,
                         first_name, middle_name, last_name, birthdate, gender,
                         address, contract_details, phone,
                         created_at, updated_at)
    SELECT name, email, password, status,
           must_change_password,
           first_name, middle_name, last_name, birthdate, gender,
           address, contract_details, phone,
           created_at, updated_at
    FROM users WHERE role = 'client'
    RETURNING id, email
)
INSERT INTO _user_id_migration (old_id, new_id, role)
SELECT u.id, ins.id, 'client'
FROM users u JOIN ins ON ins.email = u.email
WHERE u.role = 'client';

-- ------------------------------------------------------------
-- 5) ASSIGN FRIENDLY USER_IDS (C/S/A prefixes for easy verification)
-- ------------------------------------------------------------
UPDATE clients SET user_id = 'C' || lpad((id - 1000000)::text, 6, '0') WHERE user_id IS NULL;
UPDATE staff   SET user_id = 'S' || lpad((id - 2000000)::text, 6, '0') WHERE user_id IS NULL;
UPDATE admins  SET user_id = 'A' || lpad((id - 3000000)::text, 6, '0') WHERE user_id IS NULL;

-- ------------------------------------------------------------
-- 6) DROP OLD FK CONSTRAINTS that pointed at `users`
--    (MUST happen BEFORE re-pointing the data, otherwise the
--     old FK would reject the new offset ids like 1000001)
-- ------------------------------------------------------------
ALTER TABLE transactions        DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;
ALTER TABLE transactions        DROP CONSTRAINT IF EXISTS transactions_staff_id_fkey;
ALTER TABLE products            DROP CONSTRAINT IF EXISTS products_created_by_fkey;
ALTER TABLE promos              DROP CONSTRAINT IF EXISTS promos_created_by_fkey;
ALTER TABLE pending_submissions DROP CONSTRAINT IF EXISTS pending_submissions_submitted_by_fkey;

-- ------------------------------------------------------------
-- 7) REPOINT EXISTING FOREIGN-KEY DATA to the new tables
-- ------------------------------------------------------------
-- Transactions
UPDATE transactions t SET user_id  = m.new_id
FROM _user_id_migration m WHERE t.user_id  = m.old_id AND m.role = 'client';
UPDATE transactions t SET staff_id = m.new_id
FROM _user_id_migration m WHERE t.staff_id = m.old_id AND m.role = 'staff';

-- Products / promos / submissions created_by (may reference staff OR admin)
UPDATE products            SET created_by = m.new_id
FROM _user_id_migration m   WHERE products.created_by  = m.old_id;
UPDATE promos               SET created_by = m.new_id
FROM _user_id_migration m   WHERE promos.created_by    = m.old_id;
UPDATE pending_submissions  SET submitted_by = m.new_id
FROM _user_id_migration m   WHERE pending_submissions.submitted_by = m.old_id;

-- ------------------------------------------------------------
-- 8) ADD NEW FK CONSTRAINTS (transaction links now target the right tables)
-- ------------------------------------------------------------
ALTER TABLE transactions
    ADD CONSTRAINT transactions_user_id_fkey  FOREIGN KEY (user_id)  REFERENCES clients(id) ON DELETE SET NULL;
ALTER TABLE transactions
    ADD CONSTRAINT transactions_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES staff(id)   ON DELETE CASCADE;
-- products/promos/submissions `created_by`/`submitted_by` stay plain
-- integers because they may reference staff OR admin.

-- ------------------------------------------------------------
-- 9) GLOBAL EMAIL UNIQUENESS across all three tables
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION enforce_global_email_unique()
RETURNS TRIGGER AS $$
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
-- 10) RLS POLICIES (match the permissive app-key behaviour used today)
-- ------------------------------------------------------------
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff   ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow app to read clients" ON clients;
DROP POLICY IF EXISTS "Allow app to insert clients" ON clients;
DROP POLICY IF EXISTS "Allow app to update clients" ON clients;
DROP POLICY IF EXISTS "Allow app to delete clients" ON clients;
CREATE POLICY "Allow app to read clients"   ON clients FOR SELECT USING (true);
CREATE POLICY "Allow app to insert clients" ON clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow app to update clients" ON clients FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow app to delete clients" ON clients FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow app to read staff" ON staff;
DROP POLICY IF EXISTS "Allow app to insert staff" ON staff;
DROP POLICY IF EXISTS "Allow app to update staff" ON staff;
DROP POLICY IF EXISTS "Allow app to delete staff" ON staff;
CREATE POLICY "Allow app to read staff"   ON staff  FOR SELECT USING (true);
CREATE POLICY "Allow app to insert staff" ON staff  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow app to update staff" ON staff  FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow app to delete staff" ON staff  FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow app to read admins" ON admins;
DROP POLICY IF EXISTS "Allow app to insert admins" ON admins;
DROP POLICY IF EXISTS "Allow app to update admins" ON admins;
DROP POLICY IF EXISTS "Allow app to delete admins" ON admins;
CREATE POLICY "Allow app to read admins"   ON admins FOR SELECT USING (true);
CREATE POLICY "Allow app to insert admins" ON admins FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow app to update admins" ON admins FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow app to delete admins" ON admins FOR DELETE USING (true);

-- ------------------------------------------------------------
-- 11) updated_at triggers
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
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
-- 12) SAFETY: keep the old users table as users_backup (NOT dropped)
-- ------------------------------------------------------------
ALTER TABLE users RENAME TO users_backup;

-- ------------------------------------------------------------
-- 13) VERIFICATION
-- ------------------------------------------------------------
SELECT 'clients' AS table_name, COUNT(*) AS rows FROM clients
UNION ALL SELECT 'staff', COUNT(*) FROM staff
UNION ALL SELECT 'admins', COUNT(*) FROM admins
UNION ALL SELECT 'users_backup', COUNT(*) FROM users_backup;

COMMIT;

-- After confirming everything works, you may remove the backup with:
--   DROP TABLE users_backup;