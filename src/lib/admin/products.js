import { randomUUID } from 'node:crypto';
import { ProductValidationError, normalizeProductInput } from './productValidation.js';
import { diffFields, writeAudit } from './audit.js';

export class AdminDataError extends Error {
  constructor(code, message, status = 400, fields) {
    super(message);
    this.name = 'AdminDataError';
    this.code = code;
    this.status = status;
    this.fields = fields;
  }
}

const mapProduct = (row) => row ? ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description,
  categoryId: row.category_id,
  categoryName: row.category_name ?? null,
  imagePath: row.image_path,
  imageAlt: row.image_alt,
  status: row.status,
  displayOrder: row.display_order,
  version: row.version,
  createdBy: row.created_by,
  updatedBy: row.updated_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
}) : null;

export class AdminProductRepository {
  constructor(db) {
    this.db = db;
    this.selectProduct = `
      SELECT products.*, categories.name AS category_name
      FROM products LEFT JOIN categories ON categories.id = products.category_id
    `;
  }

  getProfile(id) {
    return this.db.prepare('SELECT id, role, publishing_mode, is_active FROM profiles WHERE id = ?').get(id) ?? null;
  }

  listProducts() {
    return this.db.prepare(`${this.selectProduct} ORDER BY products.display_order, products.name`).all().map(mapProduct);
  }

  getProduct(id) {
    return mapProduct(this.db.prepare(`${this.selectProduct} WHERE products.id = ?`).get(id));
  }

  listCategories() {
    return this.db.prepare('SELECT id, name, slug, status FROM categories ORDER BY display_order, name').all();
  }

  getStats() {
    const counts = this.db.prepare(`
      SELECT count(*) AS total,
        sum(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published,
        sum(CASE WHEN status = 'sold_out' THEN 1 ELSE 0 END) AS sold_out,
        sum(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS draft,
        sum(CASE WHEN status = 'hidden' THEN 1 ELSE 0 END) AS hidden,
        sum(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) AS archived,
        sum(CASE WHEN category_id IS NULL THEN 1 ELSE 0 END) AS uncategorized
      FROM products
    `).get();
    return {
      totalProducts: counts.total,
      published: counts.published ?? 0,
      soldOut: counts.sold_out ?? 0,
      draft: counts.draft ?? 0,
      hidden: counts.hidden ?? 0,
      archived: counts.archived ?? 0,
      uncategorized: counts.uncategorized ?? 0,
      totalCategories: this.db.prepare('SELECT count(*) AS total FROM categories').get().total,
      pendingRevisions: this.db.prepare("SELECT count(*) AS total FROM product_revisions WHERE status = 'pending'").get().total,
    };
  }

  assertCategory(categoryId) {
    if (categoryId === null) return;
    if (!this.db.prepare('SELECT 1 FROM categories WHERE id = ?').get(categoryId)) {
      throw new AdminDataError('CATEGORY_NOT_FOUND', 'La categoría seleccionada no existe.', 400, { categoryId: 'Selecciona una categoría existente.' });
    }
  }

  assertSlugAvailable(slug, excludedId = null) {
    const existing = excludedId
      ? this.db.prepare('SELECT id FROM products WHERE slug = ? AND id <> ?').get(slug, excludedId)
      : this.db.prepare('SELECT id FROM products WHERE slug = ?').get(slug);
    if (existing) throw new AdminDataError('SLUG_EXISTS', 'Ya existe un producto con ese slug.', 409, { slug: 'Este slug ya está en uso.' });
  }

  createProduct(input, profileId) {
    const values = validate(input);
    this.assertCategory(values.categoryId);
    this.assertSlugAvailable(values.slug);
    values.displayOrder = Math.min(values.displayOrder, this.db.prepare('SELECT count(*) total FROM products').get().total);
    const id = randomUUID();
    const now = new Date().toISOString();
    const insert = this.db.transaction(() => {
      this.db.prepare('UPDATE products SET display_order = display_order + 1 WHERE display_order >= ?').run(values.displayOrder);
      this.db.prepare(`
        INSERT INTO products (id, name, slug, description, category_id, image_path, image_alt, status, display_order, version, created_by, updated_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NULL, ?, ?, ?, 1, ?, ?, ?, ?)
      `).run(id, values.name, values.slug, values.description, values.categoryId, values.imageAlt, values.status, values.displayOrder, profileId, profileId, now, now);
      writeAudit(this.db,{userId:profileId,action:'product.created',entityType:'product',entityId:id,metadata:{snapshot:values}});
      return this.getProduct(id);
    });
    return insert();
  }

  updateProduct(id, input, profileId) {
    const before=this.getProduct(id);
    if (!before) throw new AdminDataError('PRODUCT_NOT_FOUND', 'Producto no encontrado.', 404);
    const values = validate(input);
    this.assertCategory(values.categoryId);
    this.assertSlugAvailable(values.slug, id);
    values.displayOrder = Math.min(values.displayOrder, Math.max(0, this.db.prepare('SELECT count(*) total FROM products').get().total - 1));
    const now = new Date().toISOString();
    const update = this.db.transaction(() => {
      if (values.displayOrder < before.displayOrder) this.db.prepare('UPDATE products SET display_order = display_order + 1 WHERE id <> ? AND display_order >= ? AND display_order < ?').run(id, values.displayOrder, before.displayOrder);
      if (values.displayOrder > before.displayOrder) this.db.prepare('UPDATE products SET display_order = display_order - 1 WHERE id <> ? AND display_order > ? AND display_order <= ?').run(id, before.displayOrder, values.displayOrder);
      this.db.prepare(`
        UPDATE products SET name = ?, slug = ?, description = ?, category_id = ?, image_alt = ?, status = ?,
          display_order = ?, version = version + 1, updated_by = ?, updated_at = ?
        WHERE id = ?
      `).run(values.name, values.slug, values.description, values.categoryId, values.imageAlt, values.status, values.displayOrder, profileId, now, id);
      const after=this.getProduct(id),changes=diffFields(before,after,['name','slug','description','categoryId','imageAlt','status','displayOrder']);
      writeAudit(this.db,{userId:profileId,action:changes.status?'product.status_changed':'product.updated',entityType:'product',entityId:id,metadata:{changes}});
      if (changes.displayOrder) writeAudit(this.db,{userId:profileId,action:'product.reordered',entityType:'product',entityId:id,metadata:{before:before.displayOrder,after:values.displayOrder}});
      return this.getProduct(id);
    });
    return update();
  }

  archiveProduct(id, profileId) {
    return this.changeStatus(id, 'archived', profileId, false);
  }

  restoreProduct(id, profileId) {
    return this.changeStatus(id, 'draft', profileId, true);
  }

  changeStatus(id, status, profileId, mustBeArchived) {
    const product = this.getProduct(id);
    if (!product) throw new AdminDataError('PRODUCT_NOT_FOUND', 'Producto no encontrado.', 404);
    if (mustBeArchived && product.status !== 'archived') throw new AdminDataError('PRODUCT_NOT_ARCHIVED', 'Sólo se pueden restaurar productos archivados.', 409);
    const now = new Date().toISOString();
    return this.db.transaction(() => {
      this.db.prepare('UPDATE products SET status = ?, version = version + 1, updated_by = ?, updated_at = ? WHERE id = ?').run(status, profileId, now, id);
      writeAudit(this.db,{userId:profileId,action:status==='archived'?'product.archived':'product.restored',entityType:'product',entityId:id,metadata:{changes:{status:{from:product.status,to:status}}}});
      return this.getProduct(id);
    })();
  }
}

function validate(input) {
  try {
    return normalizeProductInput(input);
  } catch (error) {
    if (error instanceof ProductValidationError) throw new AdminDataError('VALIDATION_ERROR', error.message, 400, error.fields);
    throw error;
  }
}
