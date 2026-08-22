import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { once } from 'node:events';
import { createAdminApiServer } from '../src/lib/admin/apiServer.js';

const adminId = 'bbfd18ea-a47f-43ae-82d1-c731459e1884';
const validProduct = { name: 'Producto HTTP', description: 'Descripción válida para la prueba HTTP.', slug: 'producto-http', categoryId: null, imageAlt: 'Imagen del producto HTTP', status: 'draft', displayOrder: 30 };

async function withApi(run) {
  const directory = mkdtempSync(path.join(tmpdir(), 'tierra-dulce-api-'));
  const server = createAdminApiServer({ databasePath: path.join(directory, 'api.sqlite') });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const origin = `http://127.0.0.1:${server.address().port}`;
  try { await run(origin); } finally { server.close(); await once(server, 'close'); rmSync(directory, { recursive: true, force: true }); }
}

const request = (origin, route, options = {}) => fetch(`${origin}${route}`, {
  ...options,
  headers: { 'x-admin-profile-id': adminId, ...(options.body ? { 'content-type': 'application/json' } : {}), ...options.headers },
});

test('HTTP API lists, creates, reads and updates products with consistent envelopes', () => withApi(async (origin) => {
  const listResponse = await request(origin, '/api/admin/products');
  const list = await listResponse.json();
  assert.equal(listResponse.status, 200);
  assert.equal(list.ok, true);
  assert.equal(list.data.length, 11);

  const createResponse = await request(origin, '/api/admin/products', { method: 'POST', body: JSON.stringify(validProduct) });
  const created = await createResponse.json();
  assert.equal(createResponse.status, 201);
  assert.equal(created.ok, true);

  const read = await (await request(origin, `/api/admin/products/${created.data.id}`)).json();
  assert.equal(read.data.slug, validProduct.slug);
  const updated = await (await request(origin, `/api/admin/products/${created.data.id}`, { method: 'PUT', body: JSON.stringify({ ...validProduct, name: 'Producto HTTP editado' }) })).json();
  assert.equal(updated.data.version, 2);
}));

test('HTTP API returns 404, 400, 409 and 403 without stack traces', () => withApi(async (origin) => {
  const missing = await request(origin, '/api/admin/products/00000000-0000-4000-8000-000000000000');
  assert.equal(missing.status, 404);
  const invalid = await request(origin, '/api/admin/products', { method: 'POST', body: '{invalid' });
  assert.equal(invalid.status, 400);
  const duplicate = await request(origin, '/api/admin/products', { method: 'POST', body: JSON.stringify({ ...validProduct, slug: 'dubai-cookie' }) });
  assert.equal(duplicate.status, 409);
  const forbidden = await fetch(`${origin}/api/admin/products`, { headers: { 'x-admin-profile-id': '00000000-0000-4000-8000-000000000000' } });
  const body = await forbidden.json();
  assert.equal(forbidden.status, 403);
  assert.equal(body.ok, false);
  assert.equal(JSON.stringify(body).includes('stack'), false);
}));

test('CORS allows configured local origin and rejects unrelated origins', () => withApi(async (origin) => {
  const allowed = await request(origin, '/api/admin/products', { headers: { origin: 'http://localhost:4321' } });
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:4321');
  const blocked = await request(origin, '/api/admin/products', { headers: { origin: 'https://example.com' } });
  assert.equal(blocked.status, 403);
}));
