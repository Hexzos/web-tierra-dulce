export function confirmPermanentDelete({ name, category = false, categories = [] }) {
  return new Promise((resolve) => {
    const dialog = document.createElement('dialog');
    dialog.className = 'admin-delete-dialog';
    const categoryFields = category
      ? `<label>Productos asociados<select name="mode"><option value="unassign">Dejarlos sin categoría</option><option value="move">Moverlos a otra categoría</option><option value="create_and_move">Crear categoría y moverlos</option></select></label><label data-target hidden>Destino<select name="target"></select></label><label data-new hidden>Nombre nueva categoría<input name="newName"></label>`
      : '';
    dialog.innerHTML = `<form method="dialog"><h2>Eliminar permanentemente</h2><p>Esta acción eliminará definitivamente <strong></strong>. No podrá restaurarse.</p>${categoryFields}<div class="admin-notice"><strong>DEV ONLY · NOT SECURITY</strong><p>Escribe DELETE DEV para simular reautenticación futura.</p></div><label>Confirmación<input name="reauth" autocomplete="off"></label><div class="admin-form-actions"><button value="cancel">Cancelar</button><button class="admin-danger-action" value="confirm">Eliminar permanentemente</button></div></form>`;
    dialog.querySelector('p strong').textContent = `“${name}”`;

    if (category) {
      const mode = dialog.querySelector('[name=mode]');
      const target = dialog.querySelector('[name=target]');
      const newWrapper = dialog.querySelector('[data-new]');
      const targetWrapper = dialog.querySelector('[data-target]');
      categories.forEach((item) => target.add(new Option(item.name, item.id)));
      mode.addEventListener('change', () => {
        targetWrapper.hidden = mode.value !== 'move';
        newWrapper.hidden = mode.value !== 'create_and_move';
      });
    }

    document.body.append(dialog);
    dialog.addEventListener('close', () => {
      const confirmed = dialog.returnValue === 'confirm'
        && dialog.querySelector('[name=reauth]').value === 'DELETE DEV';
      if (!confirmed) {
        resolve(null);
        dialog.remove();
        return;
      }

      let resolution = null;
      if (category) {
        const mode = dialog.querySelector('[name=mode]').value;
        resolution = { mode };
        if (mode === 'move') resolution.targetCategoryId = dialog.querySelector('[name=target]').value;
        if (mode === 'create_and_move') {
          const newName = dialog.querySelector('[name=newName]').value.trim();
          resolution.category = {
            name: newName,
            slug: newName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
            description: 'Categoría creada durante reasignación.',
            status: 'active',
            displayOrder: categories.length,
            imageAlt: '',
          };
        }
      }
      resolve({ reauth: 'DELETE DEV', resolution });
      dialog.remove();
    });
    dialog.showModal();
  });
}
