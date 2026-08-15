import { products } from '../data/products.js';

const STORAGE_KEY = 'tierra-dulce-order-v1';
const MAX_QUANTITY = 20;
const categoryOrder = ['cookies', 'rollos'];
const categoryLabels = { cookies: 'Cookies', rollos: 'Rollos de canela', novedades: 'Novedades' };
const categoryIcons = { cookies: '🍪', rollos: '🥐' };
const productCategories = new Map(products.map((product) => [product.id, product.category]));
const toSentenceCase = (value) => {
  const label = value.replaceAll('-', ' ').trim();
  if (!label) return 'Novedades';
  const uniformCase = label === label.toUpperCase() || label === label.toLowerCase();
  const normalized = uniformCase ? label.toLocaleLowerCase('es') : label;
  return normalized.charAt(0).toLocaleUpperCase('es') + normalized.slice(1);
};
const panel = document.querySelector('[data-order-panel]');

if (panel instanceof HTMLElement && !panel.dataset.initialized) {
  panel.dataset.initialized = 'true';
  const groups = panel.querySelector('[data-order-groups]');
  const empty = panel.querySelector('[data-order-empty]');
  const filled = panel.querySelector('[data-order-filled]');
  const summaryTotal = panel.querySelector('[data-order-summary-total]');
  const whatsapp = panel.querySelector('[data-order-whatsapp]');
  const backdrop = document.querySelector('[data-order-backdrop]');
  const openButtons = document.querySelectorAll('[data-order-open]');
  const countNodes = document.querySelectorAll('[data-order-count]');
  let lastTrigger = null;
  let order = [];

  const load = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      if (!Array.isArray(parsed)) throw new Error('Invalid order');
      order = parsed
        .filter((item) => typeof item?.productId === 'string' && typeof item?.name === 'string' && Number.isInteger(item?.quantity) && item.quantity > 0)
        .map((item) => ({ productId: item.productId, name: item.name, quantity: Math.min(item.quantity, MAX_QUANTITY) }));
    } catch {
      order = [];
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const total = () => order.reduce((sum, item) => sum + item.quantity, 0);
  const groupedOrder = () => {
    const grouped = new Map();
    order.forEach((item) => {
      const category = productCategories.get(item.productId) ?? 'novedades';
      grouped.set(category, [...(grouped.get(category) ?? []), item]);
    });
    const categories = [...grouped.keys()].sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a); const bIndex = categoryOrder.indexOf(b);
      return (aIndex < 0 ? categoryOrder.length : aIndex) - (bIndex < 0 ? categoryOrder.length : bIndex);
    });
    return categories.map((category) => [category, grouped.get(category)]);
  };
  const save = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(order)); } catch {}
    render();
  };
  const buildOrderInquiryMessage = () => {
    const sections = groupedOrder().map(([category, items]) => {
      const icon = categoryIcons[category] ?? '✨';
      const label = toSentenceCase(categoryLabels[category] ?? category);
      const lines = items.map((item) => `• ${item.name} × ${item.quantity}`).join('\n');
      return `${icon} ${label}\n${lines}`;
    }).join('\n\n');
    const units = total();
    return `Hola 👋 Vi los productos de su página web y quisiera consultar por:\n\n${sections}\n\nTotal: ${units} ${units === 1 ? 'producto' : 'productos'}\n\n¿Podrían confirmarme la disponibilidad y los precios de estos productos?\n\nQuedo atento/a al valor total y a los medios de pago disponibles. 😊`;
  };

  const createLine = (item) => {
    const line = document.createElement('li');
    line.className = 'order-line';
    line.dataset.productId = item.productId;
    line.innerHTML = `<strong></strong><div class="order-line__actions"><div class="order-line__controls"><button type="button" data-line-decrease>−</button><span></span><button type="button" data-line-increase>+</button></div><button class="order-line__remove" type="button" data-line-remove>Eliminar</button></div>`;
    line.querySelector('strong').textContent = item.name;
    line.querySelector('.order-line__controls span').textContent = String(item.quantity);
    const decrease = line.querySelector('[data-line-decrease]');
    const increase = line.querySelector('[data-line-increase]');
    decrease.setAttribute('aria-label', `Disminuir cantidad de ${item.name}`);
    increase.setAttribute('aria-label', `Aumentar cantidad de ${item.name}`);
    return line;
  };

  const render = () => {
    const units = total();
    countNodes.forEach((node) => {
      node.textContent = String(units);
      node.toggleAttribute('data-active', units > 0);
    });
    if (!(groups instanceof HTMLElement) || !(empty instanceof HTMLElement) || !(filled instanceof HTMLElement)) return;
    const hasItems = order.length > 0 && units > 0;
    empty.hidden = hasItems;
    filled.hidden = !hasItems;
    groups.replaceChildren();

    if (hasItems) {
      groupedOrder().forEach(([category, items]) => {
        const section = document.createElement('section'); section.className = 'order-group';
        const title = document.createElement('h3'); title.className = 'order-group__title'; title.textContent = toSentenceCase(categoryLabels[category] ?? category);
        const list = document.createElement('ul'); list.className = 'order-list'; list.setAttribute('role', 'list');
        list.append(...items.map(createLine)); section.append(title, list); groups.append(section);
      });
      if (summaryTotal instanceof HTMLElement) summaryTotal.textContent = `${units} ${units === 1 ? 'producto' : 'productos'}`;
    }
  };

  const open = (trigger) => {
    lastTrigger = trigger; panel.setAttribute('data-open', ''); panel.setAttribute('aria-hidden', 'false');
    if (backdrop instanceof HTMLElement) backdrop.hidden = false;
    openButtons.forEach((button) => button.setAttribute('aria-expanded', 'true'));
    document.body.style.overflow = 'hidden'; panel.querySelector('[data-order-close]')?.focus();
  };
  const closeOrdersPanel = () => {
    panel.removeAttribute('data-open'); panel.setAttribute('aria-hidden', 'true');
    if (backdrop instanceof HTMLElement) backdrop.hidden = true;
    openButtons.forEach((button) => button.setAttribute('aria-expanded', 'false'));
    document.body.style.overflow = ''; if (lastTrigger instanceof HTMLElement) lastTrigger.focus();
  };

  openButtons.forEach((button) => button.addEventListener('click', () => open(button)));
  panel.querySelector('[data-order-close]')?.addEventListener('click', closeOrdersPanel);
  backdrop?.addEventListener('click', closeOrdersPanel);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && panel.hasAttribute('data-open')) {
      closeOrdersPanel();
      event.stopImmediatePropagation();
    }
  });

  document.querySelectorAll('[data-product-card]').forEach((card) => {
    let quantity = 1; const output = card.querySelector('[data-card-quantity]');
    const update = () => { if (output) output.textContent = String(quantity); };
    card.querySelector('[data-card-decrease]')?.addEventListener('click', () => { quantity = Math.max(1, quantity - 1); update(); });
    card.querySelector('[data-card-increase]')?.addEventListener('click', () => { quantity = Math.min(MAX_QUANTITY, quantity + 1); update(); });
    card.querySelector('[data-add-order]')?.addEventListener('click', () => {
      const productId = card.getAttribute('data-product-id'); const name = card.getAttribute('data-product-name'); if (!productId || !name) return;
      const current = order.find((item) => item.productId === productId);
      if (current) current.quantity = Math.min(MAX_QUANTITY, current.quantity + quantity); else order.push({ productId, name, quantity });
      save(); const feedback = card.querySelector('[data-add-feedback]');
      if (feedback) { feedback.textContent = 'Añadido a Mis pedidos ✓'; window.setTimeout(() => { feedback.textContent = ''; }, 1800); }
    });
  });

  groups?.addEventListener('click', (event) => {
    const button = event.target instanceof Element ? event.target.closest('button') : null;
    const line = button?.closest('[data-product-id]'); const item = order.find((entry) => entry.productId === line?.getAttribute('data-product-id'));
    if (!button || !item) return;
    if (button.hasAttribute('data-line-increase')) item.quantity = Math.min(MAX_QUANTITY, item.quantity + 1);
    if (button.hasAttribute('data-line-decrease')) item.quantity = Math.max(1, item.quantity - 1);
    if (button.hasAttribute('data-line-remove')) order = order.filter((entry) => entry !== item);
    save();
  });

  whatsapp?.addEventListener('click', (event) => {
    if (whatsapp instanceof HTMLAnchorElement) {
      event.preventDefault();
      const url = `https://wa.me/56941354438?text=${encodeURIComponent(buildOrderInquiryMessage())}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  });
  panel.querySelector('[data-empty-action]')?.addEventListener('click', () => { if (panel.dataset.isCatalog === 'true') closeOrdersPanel(); });
  window.addEventListener('storage', (event) => { if (event.key === STORAGE_KEY) { load(); render(); } });
  load(); render();
}
