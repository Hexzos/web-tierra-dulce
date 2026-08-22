PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL
);

CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE CHECK (length(trim(username)) BETWEEN 2 AND 50),
  display_name TEXT NOT NULL CHECK (length(trim(display_name)) BETWEEN 2 AND 80),
  role TEXT NOT NULL CHECK (role IN ('editor', 'admin', 'developer')),
  publishing_mode TEXT NOT NULL CHECK (publishing_mode IN ('review_required', 'direct_publish')),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 2 AND 50),
  slug TEXT NOT NULL UNIQUE CHECK (length(trim(slug)) BETWEEN 2 AND 80 AND slug = lower(trim(slug))),
  description TEXT CHECK (description IS NULL OR (length(trim(description)) > 0 AND length(description) <= 250)),
  status TEXT NOT NULL CHECK (status IN ('active', 'hidden', 'archived')),
  display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  created_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 3 AND 80),
  slug TEXT NOT NULL UNIQUE CHECK (length(trim(slug)) BETWEEN 2 AND 100 AND slug = lower(trim(slug))),
  description TEXT NOT NULL CHECK (length(trim(description)) BETWEEN 10 AND 500),
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  image_path TEXT,
  image_alt TEXT NOT NULL CHECK (length(trim(image_alt)) BETWEEN 5 AND 180),
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'sold_out', 'hidden', 'archived')),
  display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE product_revisions (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  submitted_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  changes TEXT NOT NULL CHECK (json_valid(changes)),
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  base_version INTEGER NOT NULL CHECK (base_version >= 1),
  review_comment TEXT,
  reviewed_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (length(trim(action)) > 0),
  entity_type TEXT NOT NULL CHECK (length(trim(entity_type)) > 0),
  entity_id TEXT,
  metadata TEXT CHECK (metadata IS NULL OR json_valid(metadata)),
  created_at TEXT NOT NULL,
  ip TEXT
);

CREATE TABLE site_settings (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE CHECK (length(trim(key)) > 0),
  value TEXT NOT NULL CHECK (json_valid(value)),
  description TEXT,
  updated_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX products_category_id_idx ON products(category_id);
CREATE INDEX products_public_order_idx ON products(status, display_order);
CREATE INDEX categories_public_order_idx ON categories(status, display_order);
CREATE INDEX product_revisions_product_id_idx ON product_revisions(product_id);
CREATE INDEX audit_log_entity_idx ON audit_log(entity_type, entity_id);
