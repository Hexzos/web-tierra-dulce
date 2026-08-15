const navbars = document.querySelectorAll('[data-navbar]');
const sectionIds = ['inicio', 'productos', 'nosotros', 'visitanos', 'contacto'];
const sections = sectionIds
  .map((id) => document.getElementById(id))
  .filter((section) => section instanceof HTMLElement);
const navigationLinks = document.querySelectorAll(
  '[data-navbar] .navbar__link[href^="#"]',
);
const header = document.querySelector('[data-navbar]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const scrollDuration = 650;
let scrollAnimationFrame;
let removeScrollInterruptionListeners = () => {};
let restoreScrollBehavior = () => {};

const easeInOutCubic = (progress) =>
  progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;

const updateHash = (hash) => {
  if (window.location.hash !== hash) history.pushState(null, '', hash);
};

const cancelScrollAnimation = () => {
  if (scrollAnimationFrame !== undefined) cancelAnimationFrame(scrollAnimationFrame);
  scrollAnimationFrame = undefined;
  removeScrollInterruptionListeners();
  restoreScrollBehavior();
};

const scrollToSection = (target, hash) => {
  cancelScrollAnimation();

  const headerHeight = header instanceof HTMLElement ? header.offsetHeight : 0;
  const scrollMargin = Number.parseFloat(getComputedStyle(target).scrollMarginBlockStart) || 0;
  const targetOffset = Math.max(headerHeight, scrollMargin);
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const targetPosition = Math.min(
    Math.max(target.getBoundingClientRect().top + window.scrollY - targetOffset, 0),
    maxScroll,
  );

  if (reducedMotion.matches) {
    window.scrollTo({ top: targetPosition, behavior: 'auto' });
    updateHash(hash);
    return;
  }

  const startPosition = window.scrollY;
  const distance = targetPosition - startPosition;
  const startTime = performance.now();
  const originalScrollBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = 'auto';
  restoreScrollBehavior = () => {
    document.documentElement.style.scrollBehavior = originalScrollBehavior;
    restoreScrollBehavior = () => {};
  };

  const finishAnimation = ({ updateLocation = false } = {}) => {
    if (scrollAnimationFrame !== undefined) cancelAnimationFrame(scrollAnimationFrame);
    scrollAnimationFrame = undefined;
    removeScrollInterruptionListeners();
    restoreScrollBehavior();
    if (updateLocation) updateHash(hash);
  };

  const interruptAnimation = () => finishAnimation();
  const interruptOnKey = (event) => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) {
      interruptAnimation();
    }
  };

  window.addEventListener('wheel', interruptAnimation, { passive: true, once: true });
  window.addEventListener('touchstart', interruptAnimation, { passive: true, once: true });
  window.addEventListener('pointerdown', interruptAnimation, { passive: true, once: true });
  window.addEventListener('keydown', interruptOnKey);
  removeScrollInterruptionListeners = () => {
    window.removeEventListener('wheel', interruptAnimation);
    window.removeEventListener('touchstart', interruptAnimation);
    window.removeEventListener('pointerdown', interruptAnimation);
    window.removeEventListener('keydown', interruptOnKey);
    removeScrollInterruptionListeners = () => {};
  };

  const animateScroll = (currentTime) => {
    const progress = Math.min((currentTime - startTime) / scrollDuration, 1);
    window.scrollTo(0, startPosition + distance * easeInOutCubic(progress));

    if (progress < 1) {
      scrollAnimationFrame = requestAnimationFrame(animateScroll);
    } else {
      window.scrollTo(0, targetPosition);
      finishAnimation({ updateLocation: true });
    }
  };

  scrollAnimationFrame = requestAnimationFrame(animateScroll);
};

const setActiveSection = (sectionId) => {
  navigationLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${sectionId}`;
    link.classList.toggle('active', isActive);

    if (isActive) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  });
};

const initialSectionId = sectionIds.includes(window.location.hash.slice(1))
  ? window.location.hash.slice(1)
  : 'inicio';

setActiveSection(initialSectionId);

navigationLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const sectionId = link.getAttribute('href')?.slice(1);
    const target = sectionId ? document.getElementById(sectionId) : null;

    if (sectionId && sectionIds.includes(sectionId) && target instanceof HTMLElement) {
      event.preventDefault();
      setActiveSection(sectionId);
      scrollToSection(target, `#${sectionId}`);
    }
  });
});

if ('IntersectionObserver' in window && sections.length > 0) {
  const headerHeight = header instanceof HTMLElement ? header.offsetHeight : 0;
  const footer = document.getElementById('contacto');
  const pageEndTolerance = 8;

  const isNearPageEnd = () =>
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - pageEndTolerance;

  const updateFromViewport = () => {
    if (footer instanceof HTMLElement && isNearPageEnd()) {
      setActiveSection('contacto');
      return;
    }

    const viewportProbe = headerHeight + (window.innerHeight - headerHeight) * 0.35;
    let activeSection = sections[0];

    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= viewportProbe) activeSection = section;
    });

    if (activeSection) setActiveSection(activeSection.id);
  };

  const sectionObserver = new IntersectionObserver(updateFromViewport, {
    rootMargin: `-${headerHeight}px 0px -65% 0px`,
    threshold: 0,
  });

  sections.forEach((section) => sectionObserver.observe(section));
  updateFromViewport();
}

navbars.forEach((navbar) => {
  const toggle = navbar.querySelector('[data-menu-toggle]');
  const menu = navbar.querySelector('[data-menu]');

  if (!(toggle instanceof HTMLButtonElement) || !(menu instanceof HTMLElement)) return;

  const desktopMedia = window.matchMedia('(min-width: 64rem)');
  let closeTimer;
  let openAnimationFrame;

  const finishClose = () => {
    menu.hidden = true;
    menu.removeAttribute('data-open');
    closeTimer = undefined;
  };

  const closeMenu = ({ returnFocus = false, immediate = false } = {}) => {
    if (closeTimer !== undefined) window.clearTimeout(closeTimer);
    if (openAnimationFrame !== undefined) cancelAnimationFrame(openAnimationFrame);
    openAnimationFrame = undefined;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú de navegación');
    menu.removeAttribute('data-open');

    if (immediate || reducedMotion.matches || menu.hidden) {
      finishClose();
    } else {
      closeTimer = window.setTimeout(finishClose, 250);
    }

    if (returnFocus) toggle.focus();
  };

  const openMenu = () => {
    if (closeTimer !== undefined) window.clearTimeout(closeTimer);
    closeTimer = undefined;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Cerrar menú de navegación');
    menu.hidden = false;
    openAnimationFrame = requestAnimationFrame(() => {
      menu.setAttribute('data-open', '');
      openAnimationFrame = undefined;
    });
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  menu.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('a')) closeMenu();
  });

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Node)) return;
    const clickedOrdersLayer =
      event.target instanceof Element &&
      event.target.closest('[data-order-panel], [data-order-backdrop]');

    if (clickedOrdersLayer) return;
    if (!navbar.contains(event.target)) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.querySelector('[data-order-panel][data-open]')) {
      return;
    }

    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      closeMenu({ returnFocus: true });
    }
  });

  desktopMedia.addEventListener('change', () => closeMenu({ immediate: true }));
});
