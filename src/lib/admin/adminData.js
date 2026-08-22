import { initializeDatabase } from '../database.js';

const VALID_ROLES = new Set(['editor', 'admin', 'developer']);
const VALID_PUBLISHING_MODES = new Set(['review_required', 'direct_publish']);

function mapProfile(row) {
  if (!row || !VALID_ROLES.has(row.role) || !VALID_PUBLISHING_MODES.has(row.publishing_mode)) return null;
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    role: row.role,
    publishingMode: row.publishing_mode,
    isActive: row.is_active === 1,
  };
}

export function getDevelopmentProfiles(databasePath) {
  const db = initializeDatabase(databasePath);
  try {
    return db.prepare(`
      SELECT id, username, display_name, role, publishing_mode, is_active
      FROM profiles
      WHERE is_active = 1
      ORDER BY CASE role WHEN 'editor' THEN 1 WHEN 'admin' THEN 2 ELSE 3 END
    `).all().map(mapProfile).filter(Boolean);
  } finally {
    db.close();
  }
}

export function getDevelopmentProfileById(id, databasePath) {
  if (typeof id !== 'string' || !id) return null;
  const db = initializeDatabase(databasePath);
  try {
    const profile = mapProfile(db.prepare(`
      SELECT id, username, display_name, role, publishing_mode, is_active
      FROM profiles WHERE id = ?
    `).get(id));
    return profile?.isActive ? profile : null;
  } finally {
    db.close();
  }
}

export function getCatalogDashboardStats(databasePath) {
  const db = initializeDatabase(databasePath);
  try {
    const productCounts = db.prepare(`
      SELECT
        count(*) AS total,
        sum(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published,
        sum(CASE WHEN status = 'sold_out' THEN 1 ELSE 0 END) AS sold_out,
        sum(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS draft,
        sum(CASE WHEN status = 'hidden' THEN 1 ELSE 0 END) AS hidden,
        sum(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) AS archived,
        sum(CASE WHEN category_id IS NULL THEN 1 ELSE 0 END) AS uncategorized
      FROM products
    `).get();
    const categories = db.prepare('SELECT count(*) AS total FROM categories').get().total;
    const pendingRevisions = db.prepare("SELECT count(*) AS total FROM product_revisions WHERE status = 'pending'").get().total;
    return {
      totalProducts: productCounts.total,
      published: productCounts.published,
      soldOut: productCounts.sold_out,
      draft: productCounts.draft,
      hidden: productCounts.hidden,
      archived: productCounts.archived,
      uncategorized: productCounts.uncategorized,
      totalCategories: categories,
      pendingRevisions,
    };
  } finally {
    db.close();
  }
}
