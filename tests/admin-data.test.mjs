import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { initializeDatabase } from '../src/lib/database.js';
import { getCatalogDashboardStats, getDevelopmentProfileById, getDevelopmentProfiles } from '../src/lib/admin/adminData.js';

function withDatabase(run) {
  const directory = mkdtempSync(path.join(tmpdir(), 'tierra-dulce-admin-'));
  const databasePath = path.join(directory, 'admin.sqlite');
  try {
    const db = initializeDatabase(databasePath);
    try { return run(db, databasePath); } finally { db.close(); }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

const now = '2026-08-21T00:00:00.000Z';

test('dashboard statistics count every product state and uncategorized products', () => withDatabase((db, databasePath) => {
  const products = db.prepare('SELECT id FROM products ORDER BY display_order LIMIT 4').all();
  db.prepare("UPDATE products SET status = 'sold_out' WHERE id = ?").run(products[0].id);
  db.prepare("UPDATE products SET status = 'draft' WHERE id = ?").run(products[1].id);
  db.prepare("UPDATE products SET status = 'hidden' WHERE id = ?").run(products[2].id);
  db.prepare("UPDATE products SET status = 'archived', category_id = NULL WHERE id = ?").run(products[3].id);

  const stats = getCatalogDashboardStats(databasePath);
  assert.deepEqual(stats, {
    totalProducts: 11,
    published: 7,
    soldOut: 1,
    draft: 1,
    hidden: 1,
    archived: 1,
    uncategorized: 1,
    totalCategories: 2,
    pendingRevisions: 0,
  });
}));

test('development profiles expose all supported roles without passwords', () => withDatabase((_db, databasePath) => {
  const profiles = getDevelopmentProfiles(databasePath);
  assert.deepEqual(profiles.map(({ role }) => role), ['editor', 'admin', 'developer']);
  assert.equal(profiles.every((profile) => !Object.hasOwn(profile, 'password')), true);
  assert.deepEqual(profiles.map(({ publishingMode }) => publishingMode), ['review_required', 'direct_publish', 'direct_publish']);
}));

test('inactive profiles cannot become a valid development session', () => withDatabase((db, databasePath) => {
  const id = 'a38d24e1-3bc4-4fa7-a195-89296bb83d17';
  db.prepare('UPDATE profiles SET is_active = 0 WHERE id = ?').run(id);
  assert.equal(getDevelopmentProfileById(id, databasePath), null);
  assert.equal(getDevelopmentProfiles(databasePath).some((profile) => profile.id === id), false);
}));

test('profile constraints reject invalid roles and publishing modes', () => withDatabase((db) => {
  const insert = db.prepare(`
    INSERT INTO profiles (id, username, display_name, role, publishing_mode, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 1, ?, ?)
  `);
  assert.throws(() => insert.run('10000000-0000-4000-8000-000000000001', 'role_invalid', 'Rol inválido', 'owner', 'direct_publish', now, now), /CHECK/);
  assert.throws(() => insert.run('10000000-0000-4000-8000-000000000002', 'mode_invalid', 'Modo inválido', 'admin', 'instant', now, now), /CHECK/);
}));
