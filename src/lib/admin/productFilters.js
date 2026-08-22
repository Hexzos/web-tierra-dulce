export function filterAdminProducts(products, { search = '', status = '', category = '' } = {}) {
  const term = String(search).trim().toLocaleLowerCase('es');
  return products.filter((product) => {
    const matchesText = !term || product.name.toLocaleLowerCase('es').includes(term) || product.slug.toLocaleLowerCase('es').includes(term);
    const matchesStatus = !status || product.status === status;
    const matchesCategory = !category || (category === 'uncategorized' ? product.categoryId === null : product.categoryId === category);
    return matchesText && matchesStatus && matchesCategory;
  });
}
