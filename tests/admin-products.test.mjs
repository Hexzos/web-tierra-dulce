import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { initializeDatabase } from '../src/lib/database.js';
import { AdminProductRepository } from '../src/lib/admin/products.js';
import { AdminProductService } from '../src/lib/admin/productService.js';
import { filterAdminProducts } from '../src/lib/admin/productFilters.js';

const ids = {
  editor: 'a38d24e1-3bc4-4fa7-a195-89296bb83d17',
  admin: 'bbfd18ea-a47f-43ae-82d1-c731459e1884',
  developer: 'd45f457d-a6e5-472a-b258-c781aaca624a',
  category: '6cc0445b-87e4-4f36-9b83-f1d4d65d0927',
};
const validProduct = {
  name: 'Producto de prueba', description: 'Descripción válida del producto de prueba.', slug: 'producto-de-prueba',
  categoryId: ids.category, imageAlt: 'Imagen del producto de prueba', status: 'draft', displayOrder: 12,
};

function withService(run) {
  const directory = mkdtempSync(path.join(tmpdir(), 'tierra-dulce-products-'));
  const databasePath = path.join(directory, 'products.sqlite');
  const db = initializeDatabase(databasePath);
  const service = new AdminProductService(new AdminProductRepository(db));
  return Promise.resolve().then(() => run(service, db)).finally(() => { db.close(); rmSync(directory, { recursive: true, force: true }); });
}

test('lists products and reads a valid UUID while missing UUID returns 404', () => withService((service) => {
  const products = service.list(ids.editor);
  assert.equal(products.length, 11);
  assert.equal(service.get(products[0].id, ids.editor).id, products[0].id);
  assert.throws(() => service.get('00000000-0000-4000-8000-000000000000', ids.editor), (error) => error.status === 404);
}));

test('search trims input, ignores case and combines state/category filters', () => withService((service) => {
  const products = service.list(ids.editor);
  assert.deepEqual(filterAdminProducts(products, { search: '  DUBAI-COOKIE  ' }).map(({ slug }) => slug), ['dubai-cookie']);
  assert.equal(filterAdminProducts(products, { search: '  velvet LOVE ' })[0].slug, 'velvet-love');
  assert.equal(filterAdminProducts(products, { status: 'published', category: ids.category }).length, 8);
  assert.equal(filterAdminProducts(products, { category: 'uncategorized' }).length, 0);
}));

test('admin creates a valid categorized and uncategorized product with controlled metadata', () => withService((service) => {
  const created = service.create(validProduct, ids.admin);
  assert.match(created.id, /^[0-9a-f-]{36}$/);
  assert.equal(created.version, 1);
  assert.equal(created.createdBy, ids.admin);
  assert.equal(created.updatedBy, ids.admin);
  assert.equal(created.imagePath, null);
  const uncategorized = service.create({ ...validProduct, slug: 'producto-sin-categoria', categoryId: null }, ids.admin);
  assert.equal(uncategorized.categoryId, null);
}));

test('API-level domain validation rejects invalid product input', () => withService((service) => {
  const cases = [
    [{ ...validProduct, name: '  x ' }, 'name'],
    [{ ...validProduct, description: ' corta ' }, 'description'],
    [{ ...validProduct, slug: 'Slug inválido' }, 'slug'],
    [{ ...validProduct, status: 'available' }, 'status'],
    [{ ...validProduct, displayOrder: -1 }, 'displayOrder'],
  ];
  for (const [payload, field] of cases) {
    assert.throws(() => service.create(payload, ids.admin), (error) => error.code === 'VALIDATION_ERROR' && Boolean(error.fields[field]));
  }
}));

test('rejects duplicate slug, nonexistent category and client-controlled fields', () => withService((service) => {
  assert.throws(() => service.create({ ...validProduct, slug: 'dubai-cookie' }, ids.admin), (error) => error.status === 409 && error.code === 'SLUG_EXISTS');
  assert.throws(() => service.create({ ...validProduct, categoryId: '00000000-0000-4000-8000-000000000000' }, ids.admin), (error) => error.code === 'CATEGORY_NOT_FOUND');
  assert.throws(() => service.create({ ...validProduct, version: 99 }, ids.admin), (error) => error.code === 'VALIDATION_ERROR');
}));

test('update increments version, timestamp and API-controlled updater', async () => withService(async (service) => {
  const created = service.create(validProduct, ids.admin);
  await new Promise((resolve) => setTimeout(resolve, 5));
  const updated = service.update(created.id, { ...validProduct, name: 'Producto actualizado', slug: 'producto-actualizado' }, ids.developer);
  assert.equal(updated.version, 2);
  assert.ok(updated.updatedAt > created.updatedAt);
  assert.equal(updated.updatedBy, ids.developer);
  assert.equal(updated.createdBy, ids.admin);
  assert.throws(() => service.update(created.id, { ...validProduct, slug: 'dubai-cookie' }, ids.admin), (error) => error.status === 409);
}));

test('archive increments version and restore always returns to draft', () => withService((service) => {
  const created = service.create({ ...validProduct, status: 'published' }, ids.admin);
  const archived = service.archive(created.id, ids.admin);
  assert.equal(archived.status, 'archived');
  assert.equal(archived.version, 2);
  const restored = service.restore(created.id, ids.developer);
  assert.equal(restored.status, 'draft');
  assert.equal(restored.version, 3);
}));

test('admin and developer write; editor, inactive and unknown profiles cannot write', () => withService((service, db) => {
  assert.equal(service.create(validProduct, ids.admin).createdBy, ids.admin);
  assert.equal(service.create({ ...validProduct, slug: 'producto-developer' }, ids.developer).createdBy, ids.developer);
  assert.throws(() => service.create({ ...validProduct, slug: 'producto-editor' }, ids.editor), (error) => error.status === 403 && error.code === 'WRITE_FORBIDDEN');
  db.prepare('UPDATE profiles SET is_active = 0 WHERE id = ?').run(ids.admin);
  assert.throws(() => service.create({ ...validProduct, slug: 'producto-inactivo' }, ids.admin), (error) => error.status === 403);
  assert.throws(() => service.create({ ...validProduct, slug: 'producto-desconocido' }, '00000000-0000-4000-8000-000000000000'), (error) => error.status === 403);
}));
