import Database from 'better-sqlite3';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

// Astro bundles server/build modules into dist during prerendering; cwd remains
// the project root and therefore keeps migrations and the local DB resolvable.
const projectRoot = process.cwd();
export const defaultDatabasePath = path.join(projectRoot, 'db', 'local', 'tierra-dulce.sqlite');

export function openDatabase(databasePath = defaultDatabasePath) {
  mkdirSync(path.dirname(databasePath), { recursive: true });
  const db = new Database(databasePath);
  db.pragma('foreign_keys = ON');
  return db;
}

export function initializeDatabase(databasePath = defaultDatabasePath) {
  const db = openDatabase(databasePath);
  const migrationPath = path.join(projectRoot, 'db', 'migrations', '001_schema.sql');
  const seedPath = path.join(projectRoot, 'db', 'seed', '001_catalog.sql');
  const hasMigrationTable = db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'schema_migrations'").get();

  if (!hasMigrationTable) {
    const migrate = db.transaction(() => {
      db.exec(readFileSync(migrationPath, 'utf8'));
      db.prepare('INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)').run('001_schema', new Date().toISOString());
      db.exec(readFileSync(seedPath, 'utf8'));
    });
    migrate();
  }

  const hasDevelopmentProfiles = db.prepare("SELECT 1 FROM schema_migrations WHERE version = '002_admin_profiles'").get();
  if (!hasDevelopmentProfiles) {
    const seedProfilesPath = path.join(projectRoot, 'db', 'seed', '002_admin_profiles.sql');
    const seedProfiles = db.transaction(() => {
      db.exec(readFileSync(seedProfilesPath, 'utf8'));
      db.prepare('INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)').run('002_admin_profiles', new Date().toISOString());
    });
    seedProfiles();
  }

  const hasCategoryMedia = db.prepare("SELECT 1 FROM schema_migrations WHERE version = '002_category_media_audit'").get();
  if (!hasCategoryMedia) {
    const migration = readFileSync(path.join(projectRoot, 'db', 'migrations', '002_category_media_audit.sql'), 'utf8');
    db.transaction(() => {
      db.exec(migration);
      db.prepare('INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)').run('002_category_media_audit', new Date().toISOString());
    })();
  }

  const hasUserManagement = db.prepare("SELECT 1 FROM schema_migrations WHERE version = '003_user_management'").get();
  if (!hasUserManagement) {
    const migration = readFileSync(path.join(projectRoot, 'db', 'migrations', '003_user_management.sql'), 'utf8');
    db.transaction(() => {
      db.exec(migration);
      db.prepare('INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)').run('003_user_management', new Date().toISOString());
    })();
  }

  const hasEditorialWorkflow = db.prepare("SELECT 1 FROM schema_migrations WHERE version = '004_editorial_workflow'").get();
  if (!hasEditorialWorkflow) {
    const migration = readFileSync(path.join(projectRoot, 'db', 'migrations', '004_editorial_workflow.sql'), 'utf8');
    db.transaction(() => {
      db.exec(migration);
      db.prepare('INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)').run('004_editorial_workflow', new Date().toISOString());
    })();
  }

  return db;
}
