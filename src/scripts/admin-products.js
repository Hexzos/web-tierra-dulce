import { adminApi, getCurrentProfile } from './admin-api-client.js';
import { filterAdminProducts } from '../lib/admin/productFilters.js';
import { confirmPermanentDelete } from './admin-delete-dialog.js';

const root = document.querySelector('[data-admin-products]');
const statusLabels = { draft: 'Borrador', published: 'Publicado', sold_out: 'Agotado', hidden: 'Oculto', archived: 'Archivado' };

if (root instanceof HTMLElement) {
  const list = root.querySelector('[data-product-list]');
  const statusNode = root.querySelector('[data-products-status]');
  const search = root.querySelector('[data-product-search]');
  const statusFilter = root.querySelector('[data-status-filter]');
  const categoryFilter = root.querySelector('[data-category-filter]');
  const profile = getCurrentProfile();
  const canWrite = profile?.role === 'admin' || profile?.role === 'developer';
  let products = [];

  if (!canWrite) {
    root.querySelectorAll('[data-write-action]').forEach((node) => { node.hidden = true; });
    const notice = root.querySelector('[data-readonly-notice]');
    if (notice instanceof HTMLElement) notice.hidden = false;
  }

  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const renderProduct = (product) => {
    const article = element('article', 'admin-product-row');
    article.dataset.productId = product.id;
    const identity = element('div', 'admin-product-identity');
    identity.append(element('strong', '', product.name), element('code', '', product.slug));
    const category = element('span', 'admin-product-category', product.categoryName ?? 'Sin categoría');
    category.dataset.label = 'Categoría';
    const badge = element('span', `admin-status admin-status--${product.status}`, statusLabels[product.status] ?? product.status);
    badge.dataset.label = 'Estado';
    const order = element('span', 'admin-product-order', String(product.displayOrder));
    order.dataset.label = 'Orden';
    const actions = element('div', 'admin-product-actions');
    const edit = element('a', 'admin-row-action', canWrite ? 'Editar' : 'Ver');
    edit.href = `/admin/productos/editar/?id=${encodeURIComponent(product.id)}`;
    actions.append(edit);
    if (canWrite) {
      const action = element('button', 'admin-row-action', product.status === 'archived' ? 'Restaurar' : 'Archivar');
      action.type = 'button';
      action.dataset.productAction = product.status === 'archived' ? 'restore' : 'archive';
      action.dataset.productId = product.id;
      action.dataset.productName = product.name;
      actions.append(action);
      if(product.status==='archived'){const remove=element('button','admin-row-action admin-row-action--danger','Eliminar permanentemente');remove.type='button';remove.addEventListener('click',async()=>{const body=await confirmPermanentDelete({name:product.name});if(body){await adminApi(`/api/admin/products/${product.id}/delete`,{method:'POST',body:JSON.stringify(body)});products=await adminApi('/api/admin/products');applyFilters()}});actions.append(remove)}
    }
    article.append(identity, category, badge, order, actions);
    return article;
  };

  const applyFilters = () => {
    const term = search instanceof HTMLInputElement ? search.value : '';
    const wantedStatus = statusFilter instanceof HTMLSelectElement ? statusFilter.value : '';
    const wantedCategory = categoryFilter instanceof HTMLSelectElement ? categoryFilter.value : '';
    const visible = filterAdminProducts(products, { search: term, status: wantedStatus, category: wantedCategory });
    list?.replaceChildren(...visible.map(renderProduct));
    if (statusNode instanceof HTMLElement) statusNode.textContent = `${visible.length} de ${products.length} productos`;
  };

  const load = async () => {
    try {
      const [loadedProducts, categories] = await Promise.all([adminApi('/api/admin/products'), adminApi('/api/admin/categories')]);
      products = loadedProducts;
      if (categoryFilter instanceof HTMLSelectElement) {
        categories.forEach((category) => categoryFilter.add(new Option(category.name, category.id)));
      }
      applyFilters();
    } catch (error) {
      if (statusNode instanceof HTMLElement) statusNode.textContent = error.message;
    }
  };

  [search, statusFilter, categoryFilter].forEach((control) => control?.addEventListener('input', applyFilters));
  list?.addEventListener('click', async (event) => {
    const button = event.target instanceof Element ? event.target.closest('[data-product-action]') : null;
    if (!(button instanceof HTMLButtonElement)) return;
    const action = button.dataset.productAction;
    const verb = action === 'restore' ? 'restaurar como borrador' : 'archivar';
    if (!confirm(`¿Quieres ${verb} “${button.dataset.productName}”?`)) return;
    button.disabled = true;
    try {
      await adminApi(`/api/admin/products/${encodeURIComponent(button.dataset.productId)}/${action}`, { method: 'POST' });
      products = await adminApi('/api/admin/products');
      applyFilters();
    } catch (error) {
      if (statusNode instanceof HTMLElement) statusNode.textContent = error.message;
      button.disabled = false;
    }
  });
  load();
}
