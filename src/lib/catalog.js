import { initializeDatabase } from './database.js';
import { productPresentation, categoryPresentation, editorialLandingCards } from '../data/products.js';

const PUBLIC_PRODUCT_STATUSES = ['published', 'sold_out'];

function mapProduct(row) {
  const presentation = productPresentation[row.slug] ?? {};
  return {
    id: row.slug,
    databaseId: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category_slug ?? undefined,
    categoryLabel: row.category_name ?? undefined,
    description: row.description,
    image: row.image_path,
    imageAlt: row.image_alt,
    status: row.status,
    imageWidth: presentation.imageWidth,
    imageHeight: presentation.imageHeight,
    isPlaceholder: presentation.isPlaceholder ?? false,
  };
}

export function getPublicProducts(databasePath) {
  const db = initializeDatabase(databasePath);
  try {
    const placeholders = PUBLIC_PRODUCT_STATUSES.map(() => '?').join(', ');
    const rows = db.prepare(`
      SELECT products.*, categories.slug AS category_slug, categories.name AS category_name
      FROM products
      LEFT JOIN categories ON categories.id = products.category_id
      WHERE products.status IN (${placeholders})
      ORDER BY products.display_order, products.name
    `).all(...PUBLIC_PRODUCT_STATUSES);
    return rows.map(mapProduct);
  } finally {
    db.close();
  }
}

export function getPublicCategories(databasePath) {
  const db = initializeDatabase(databasePath);
  try {
    return db.prepare(`
      SELECT id, name, slug, description, display_order, image_path, image_alt
      FROM categories
      WHERE status = 'active'
      ORDER BY display_order, name
    `).all();
  } finally {
    db.close();
  }
}

export function getLandingCategories(databasePath) {
  const categories = getPublicCategories(databasePath).map((category) => ({
    id: `categoria-${category.slug}`,
    name: category.name,
    categoryLabel: categoryPresentation[category.slug]?.categoryLabel,
    description: category.description,
    image: category.image_path ?? categoryPresentation[category.slug]?.image,
    imageAlt: category.image_alt ?? categoryPresentation[category.slug]?.imageAlt,
    imageWidth: categoryPresentation[category.slug]?.imageWidth,
    imageHeight: categoryPresentation[category.slug]?.imageHeight,
    ctaLabel: 'Ver variedades',
    ctaUrl: `/productos/?categoria=${category.slug}`,
  }));
  return [...categories, ...editorialLandingCards];
}
