const productSections = document.querySelectorAll('[data-products]');

productSections.forEach((section) => {
  const toggle = section.querySelector('[data-products-toggle]');
  const label = section.querySelector('[data-products-toggle-label]');
  const icon = section.querySelector('[data-products-toggle-icon]');
  const extraProducts = section.querySelector('[data-products-extra]');

  if (
    !(toggle instanceof HTMLButtonElement) ||
    !(label instanceof HTMLElement) ||
    !(icon instanceof HTMLElement) ||
    !(extraProducts instanceof HTMLElement)
  ) return;
  if (!extraProducts.querySelector('.products__item')) return;

  let desiredExpanded = false;
  let animationFrame = 0;
  let finishTimer = 0;

  const finishTransition = () => {
    window.clearTimeout(finishTimer);

    if (desiredExpanded) {
      extraProducts.style.height = 'auto';
    } else {
      extraProducts.style.height = '0px';
      extraProducts.hidden = true;
    }
  };

  const setExpanded = (isExpanded) => {
    desiredExpanded = isExpanded;
    window.cancelAnimationFrame(animationFrame);
    window.clearTimeout(finishTimer);

    toggle.setAttribute('aria-expanded', String(isExpanded));
    label.textContent = isExpanded ? 'Ver menos' : 'Ver más';
    icon.textContent = isExpanded ? '↑' : '↓';

    if (isExpanded) {
      extraProducts.hidden = false;
      extraProducts.inert = false;
    }

    const currentHeight = extraProducts.getBoundingClientRect().height;
    extraProducts.style.height = `${currentHeight}px`;
    extraProducts.inert = !isExpanded;
    extraProducts.classList.toggle('is-expanded', isExpanded);
    void extraProducts.offsetHeight;

    animationFrame = window.requestAnimationFrame(() => {
      extraProducts.style.height = isExpanded ? `${extraProducts.scrollHeight}px` : '0px';
    });

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    finishTimer = window.setTimeout(finishTransition, reduceMotion ? 20 : 460);
  };

  section.setAttribute('data-enhanced', 'true');
  extraProducts.style.height = '0px';
  extraProducts.inert = true;
  extraProducts.hidden = true;
  toggle.hidden = false;

  extraProducts.addEventListener('transitionend', (event) => {
    if (event.propertyName === 'height') finishTransition();
  });

  toggle.addEventListener('click', () => {
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    setExpanded(!isExpanded);
  });
});
