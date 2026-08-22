import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { initializeDatabase } from '../src/lib/database.js';
import { getPublicProducts } from '../src/lib/catalog.js';

function withDatabase(run) {
  const directory = mkdtempSync(path.join(tmpdir(), 'tierra-dulce-db-'));
  const databasePath = path.join(directory, 'catalog.sqlite');
  try {
    const db = initializeDatabase(databasePath);
    try { return run(db, databasePath); } finally { db.close(); }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

const now = '2026-08-20T00:00:00.000Z';
const insertProductSql = `
  INSERT INTO products (id, name, slug, description, category_id, image_path, image_alt, status, display_order, version, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
`;

test('creates a reproducible seeded database with stable UUIDs', () => withDatabase((db, databasePath) => {
  assert.equal(db.prepare('SELECT count(*) AS count FROM categories').get().count, 2);
  assert.equal(db.prepare('SELECT count(*) AS count FROM products').get().count, 11);
  assert.equal(db.prepare("SELECT id FROM products WHERE slug = 'dubai-cookie'").get().id, '34193c0c-4166-470f-96dc-e7497937448c');
  const reopened = initializeDatabase(databasePath);
  assert.equal(reopened.prepare('SELECT count(*) AS count FROM products').get().count, 11);
  reopened.close();
}));

test('only published and sold-out products are public', () => withDatabase((db, databasePath) => {
  const insert = db.prepare(insertProductSql);
  for (const [index, status] of ['draft', 'hidden', 'archived', 'sold_out'].entries()) {
    insert.run(`10000000-0000-4000-8000-00000000000${index}`, `Estado ${status}`, `estado-${status}`, 'Descripción suficientemente extensa', null, '/test.png', `Imagen de producto ${status}`, status, 20 + index, now, now);
  }
  const products = getPublicProducts(databasePath);
  assert.equal(products.some(({ slug }) => slug === 'estado-draft'), false);
  assert.equal(products.some(({ slug }) => slug === 'estado-hidden'), false);
  assert.equal(products.some(({ slug }) => slug === 'estado-archived'), false);
  assert.equal(products.some(({ slug }) => slug === 'estado-sold_out'), true);
}));

test('allows uncategorized products and category deletion keeps products', () => withDatabase((db) => {
  db.prepare(insertProductSql).run('20000000-0000-4000-8000-000000000000', 'Producto libre', 'producto-libre', 'Descripción suficientemente extensa', null, '/test.png', 'Imagen de producto libre', 'published', 20, now, now);
  assert.equal(db.prepare("SELECT category_id FROM products WHERE slug = 'producto-libre'").get().category_id, null);

  const categoryId = db.prepare("SELECT id FROM categories WHERE slug = 'rollos'").get().id;
  const before = db.prepare('SELECT count(*) AS count FROM products WHERE category_id = ?').get(categoryId).count;
  db.prepare('DELETE FROM categories WHERE id = ?').run(categoryId);
  assert.ok(before > 0);
  assert.equal(db.prepare('SELECT count(*) AS count FROM products WHERE id IS NOT NULL').get().count, 12);
  assert.equal(db.prepare("SELECT category_id FROM products WHERE slug = 'rollo-clasico'").get().category_id, null);
}));

test('rejects duplicate slugs', () => withDatabase((db) => {
  assert.throws(() => db.prepare(insertProductSql).run('30000000-0000-4000-8000-000000000000', 'Otro Dubai', 'dubai-cookie', 'Descripción suficientemente extensa', null, '/test.png', 'Imagen de otro producto', 'published', 20, now, now), /UNIQUE/);
  assert.throws(() => db.prepare("INSERT INTO categories (id, name, slug, status, display_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run('40000000-0000-4000-8000-000000000000', 'Cookies nuevas', 'cookies', 'active', 3, now, now), /UNIQUE/);
}));
