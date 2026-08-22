export const PRODUCT_STATUSES = ['draft', 'published', 'sold_out', 'hidden', 'archived'];
export const PRODUCT_INPUT_FIELDS = ['name', 'description', 'slug', 'categoryId', 'imageAlt', 'status', 'displayOrder'];

export class ProductValidationError extends Error {
  constructor(fields, message = 'Revisa los campos del producto.') {
    super(message);
    this.name = 'ProductValidationError';
    this.fields = fields;
  }
}

export function normalizeProductInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new ProductValidationError({ form: 'El cuerpo debe ser un objeto JSON.' });
  }

  const unknownFields = Object.keys(input).filter((field) => !PRODUCT_INPUT_FIELDS.includes(field));
  if (unknownFields.length) {
    throw new ProductValidationError({ form: `Campos no permitidos: ${unknownFields.join(', ')}.` });
  }

  const values = {
    name: typeof input.name === 'string' ? input.name.trim() : '',
    description: typeof input.description === 'string' ? input.description.trim() : '',
    slug: typeof input.slug === 'string' ? input.slug.trim().toLowerCase() : '',
    categoryId: input.categoryId === null || input.categoryId === '' ? null : input.categoryId,
    imageAlt: typeof input.imageAlt === 'string' ? input.imageAlt.trim() : '',
    status: input.status,
    displayOrder: typeof input.displayOrder === 'number' ? input.displayOrder : Number(input.displayOrder),
  };
  const fields = {};
  if (values.name.length < 3 || values.name.length > 80) fields.name = 'Debe tener entre 3 y 80 caracteres.';
  if (values.description.length < 10 || values.description.length > 500) fields.description = 'Debe tener entre 10 y 500 caracteres.';
  if (values.slug.length < 2 || values.slug.length > 100 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) fields.slug = 'Usa 2–100 caracteres URL-safe: minúsculas, números y guiones.';
  if (values.imageAlt.length < 5 || values.imageAlt.length > 180) fields.imageAlt = 'Debe tener entre 5 y 180 caracteres.';
  if (!PRODUCT_STATUSES.includes(values.status)) fields.status = 'Selecciona un estado válido.';
  if (!Number.isInteger(values.displayOrder) || values.displayOrder < 0) fields.displayOrder = 'Debe ser un entero mayor o igual a 0.';
  if (values.categoryId !== null && typeof values.categoryId !== 'string') fields.categoryId = 'Selecciona una categoría válida.';
  if (Object.keys(fields).length) throw new ProductValidationError(fields);
  return values;
}
