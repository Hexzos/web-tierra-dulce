import { adminApi, getCurrentProfile } from './admin-api-client.js';
import { bindAlt,bindAutoSlug,bindPreview,loadSummary,uploadSelected } from './admin-form-helpers.js';

const form = document.querySelector('[data-product-form]');
if (form instanceof HTMLFormElement) {
  const mode = form.dataset.mode;
  const productId = new URLSearchParams(location.search).get('id');
  const message = form.querySelector('[data-form-message]');
  const submit = form.querySelector('[data-form-submit]');
  const categorySelect = form.elements.namedItem('categoryId');
  const profile = getCurrentProfile();
  const canWrite = ['editor','admin','developer'].includes(profile?.role);
  let loadedProduct = null;
  bindAutoSlug(form);bindAlt(form);bindPreview(form);

  const showMessage = (text, type = 'error') => {
    if (message instanceof HTMLElement) {
      message.textContent = text;
      message.dataset.type = type;
      message.focus?.();
    }
  };
  const clearErrors = () => form.querySelectorAll('[data-error-for]').forEach((node) => { node.textContent = ''; });
  const showFieldErrors = (fields = {}) => Object.entries(fields).forEach(([field, text]) => {
    const node = form.querySelector(`[data-error-for="${CSS.escape(field)}"]`);
    if (node instanceof HTMLElement) node.textContent = String(text);
  });
  const setBusy = (busy) => {
    form.setAttribute('aria-busy', String(busy));
    if (submit instanceof HTMLButtonElement) submit.disabled = busy || !canWrite;
  };
  const setValue = (name, value) => {
    const control = form.elements.namedItem(name);
    if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement || control instanceof HTMLSelectElement) control.value = value ?? '';
  };
  const populate = (product) => {
    loadedProduct = product;
    setValue('name', product.name); setValue('description', product.description); setValue('slug', product.slug);
    setValue('categoryId', product.categoryId); setValue('imageAlt', product.imageAlt); setValue('status', product.status); setValue('displayOrder', product.displayOrder);
    const subtitle = document.querySelector('[data-editor-subtitle]');
    if (subtitle instanceof HTMLElement) subtitle.textContent = `${product.name} · versión ${product.version}`;
    const preview=form.querySelector('[data-image-preview]'),remove=form.querySelector('[data-remove-image]');if(product.imagePath&&preview){preview.src=product.imagePath;preview.hidden=false;if(remove)remove.hidden=false}
  };

  const load = async () => {
    try {
      const categories = await adminApi('/api/admin/categories');
      if (categorySelect instanceof HTMLSelectElement) categories.forEach((category) => categorySelect.add(new Option(category.name, category.id)));
      if (mode === 'edit') {
        if (!productId) throw new Error('Falta el identificador del producto.');
        populate(await adminApi(`/api/admin/products/${encodeURIComponent(productId)}`));
        loadSummary('product',productId,form.querySelector('[data-context-history]'));
        const pending=(await adminApi('/api/admin/revisions?status=pending')).find((revision)=>revision.productId===productId);
        if(pending){showMessage(`Hay una revisión pendiente enviada por ${pending.submitterName??'un perfil'}. `, 'info');const link=document.createElement('a');link.href=`/admin/revisiones/ver/?id=${pending.id}`;link.textContent='Ver revisión';message.append(link);if(profile?.role==='editor'&&submit instanceof HTMLButtonElement)submit.disabled=true;}
      }
    } catch (error) {
      showMessage(error.message);
      if (submit instanceof HTMLButtonElement) submit.disabled = true;
    }
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!canWrite) return;
    clearErrors();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const data = new FormData(form);
    const payload = {
      name: String(data.get('name') ?? '').trim(),
      description: String(data.get('description') ?? '').trim(),
      slug: String(data.get('slug') ?? '').trim().toLowerCase(),
      categoryId: String(data.get('categoryId') ?? '') || null,
      imageAlt: String(data.get('imageAlt') ?? '').trim(),
      status: String(data.get('status') ?? ''),
      displayOrder: Number(data.get('displayOrder')),
    };
    if (payload.status === 'archived' && loadedProduct?.status !== 'archived' && !confirm('¿Quieres archivar este producto? Dejará de ser visible en el catálogo después del próximo build.')) return;
    if (mode === 'edit' && loadedProduct && payload.slug !== loadedProduct.slug && !confirm('Cambiar el slug puede invalidar referencias existentes del carrito local. ¿Quieres continuar?')) return;
    setBusy(true);
    showMessage('Guardando…', 'info');
    try {
      const result = mode === 'edit'
        ? await adminApi(`/api/admin/products/${encodeURIComponent(productId)}`, { method: 'PUT', body: JSON.stringify(payload) })
        : await adminApi('/api/admin/products', { method: 'POST', body: JSON.stringify(payload) });
      const product=result.product??result;
      if(result.workflow==='pending_review'){
        await uploadSelected(form,'revisions',result.revision.id);
        if(form.dataset.removeImage==='true')await adminApi(`/api/admin/revisions/${result.revision.id}/image`,{method:'DELETE'});
        showMessage('Revisión creada. El contenido público no cambiará hasta su aprobación.','success');
        if(mode==='create')location.replace(`/admin/productos/editar/?id=${encodeURIComponent(product.id)}`);else setBusy(false);
        return;
      }
      await uploadSelected(form,'products',product.id);
      if (mode === 'create') location.replace(`/admin/productos/editar/?id=${encodeURIComponent(product.id)}&saved=created`);
      else {
        populate(product);
        showMessage('Producto actualizado en SQLite. Ejecuta un build manual para reflejar cambios públicos.', 'success');
        setBusy(false);
      }
    } catch (error) {
      showFieldErrors(error.fields);
      showMessage(error.message);
      setBusy(false);
      const firstField = Object.keys(error.fields ?? {})[0];
      if (firstField) form.elements.namedItem(firstField)?.focus();
    }
  });
  form.querySelector('[data-remove-image]')?.addEventListener('click',async()=>{if(!productId||!confirm('¿Eliminar la imagen actual?'))return;if(profile?.role==='editor'&&profile.publishingMode==='review_required'){form.dataset.removeImage='true';const p=form.querySelector('[data-image-preview]');if(p)p.hidden=true;form.querySelector('[data-remove-image]').hidden=true;showMessage('La eliminación se propondrá al guardar la revisión.','info');return}await adminApi(`/api/admin/products/${productId}/image`,{method:'DELETE'});const p=form.querySelector('[data-image-preview]');if(p)p.hidden=true;form.querySelector('[data-remove-image]').hidden=true});
  load();
}
