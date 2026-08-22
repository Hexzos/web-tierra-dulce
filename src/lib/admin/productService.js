import { AdminDataError } from './products.js';

const VALID_ROLES = new Set(['editor', 'admin', 'developer']);
const WRITE_ROLES = new Set(['admin', 'developer']);

export class AdminProductService {
  constructor(repository) {
    this.repository = repository;
  }

  requireProfile(profileId, { write = false } = {}) {
    if (typeof profileId !== 'string' || !profileId) throw new AdminDataError('DEV_PROFILE_REQUIRED', 'Falta el contexto de perfil de desarrollo.', 403);
    const profile = this.repository.getProfile(profileId);
    if (!profile || profile.is_active !== 1 || !VALID_ROLES.has(profile.role)) throw new AdminDataError('DEV_PROFILE_INVALID', 'El perfil de desarrollo no existe o está inactivo.', 403);
    if (write && !WRITE_ROLES.has(profile.role)) throw new AdminDataError('WRITE_FORBIDDEN', 'El rol Editor es de solo lectura hasta implementar el workflow editorial.', 403);
    return profile;
  }

  list(profileId) { this.requireProfile(profileId); return this.repository.listProducts(); }
  get(id, profileId) { this.requireProfile(profileId); const product = this.repository.getProduct(id); if (!product) throw new AdminDataError('PRODUCT_NOT_FOUND', 'Producto no encontrado.', 404); return product; }
  categories(profileId) { this.requireProfile(profileId); return this.repository.listCategories(); }
  stats(profileId) { this.requireProfile(profileId); return this.repository.getStats(); }
  create(input, profileId) { this.requireProfile(profileId, { write: true }); return this.repository.createProduct(input, profileId); }
  update(id, input, profileId) { this.requireProfile(profileId, { write: true }); return this.repository.updateProduct(id, input, profileId); }
  archive(id, profileId) { this.requireProfile(profileId, { write: true }); return this.repository.archiveProduct(id, profileId); }
  restore(id, profileId) { this.requireProfile(profileId, { write: true }); return this.repository.restoreProduct(id, profileId); }
}
