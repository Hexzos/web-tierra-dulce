const carousels = document.querySelectorAll('[data-carousel]');

carousels.forEach((carousel) => {
  const slides = [...carousel.querySelectorAll('[data-carousel-slide]')];
  const indicators = [...carousel.querySelectorAll('[data-carousel-indicator]')];
  const previous = carousel.querySelector('[data-carousel-previous]');
  const next = carousel.querySelector('[data-carousel-next]');
  const status = carousel.querySelector('[data-carousel-status]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const interval = Number(carousel.getAttribute('data-autoplay-interval')) || 12_000;

  if (
    slides.length === 0 ||
    !(previous instanceof HTMLButtonElement) ||
    !(next instanceof HTMLButtonElement) ||
    !(status instanceof HTMLElement)
  ) return;

  let currentIndex = 0;
  let autoplayTimer = 0;
  let isHovered = false;
  let hasFocus = false;

  const stopAutoplay = () => window.clearInterval(autoplayTimer);

  const startAutoplay = () => {
    stopAutoplay();
    if (reducedMotion.matches || isHovered || hasFocus || document.hidden || slides.length < 2) return;
    autoplayTimer = window.setInterval(() => showSlide(currentIndex + 1), interval);
  };

  const showSlide = (requestedIndex, { announce = false, restart = false } = {}) => {
    currentIndex = (requestedIndex + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      const isActive = index === currentIndex;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
      if (slide instanceof HTMLElement) slide.inert = !isActive;
    });

    indicators.forEach((indicator, index) => {
      const isActive = index === currentIndex;
      indicator.classList.toggle('is-active', isActive);
      if (isActive) indicator.setAttribute('aria-current', 'true');
      else indicator.removeAttribute('aria-current');
    });

    if (announce) status.textContent = `Review ${currentIndex + 1} de ${slides.length}`;
    if (restart) startAutoplay();
  };

  previous.addEventListener('click', () => showSlide(currentIndex - 1, { announce: true, restart: true }));
  next.addEventListener('click', () => showSlide(currentIndex + 1, { announce: true, restart: true }));

  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => showSlide(index, { announce: true, restart: true }));
  });

  carousel.addEventListener('mouseenter', () => {
    isHovered = true;
    stopAutoplay();
  });

  carousel.addEventListener('mouseleave', () => {
    isHovered = false;
    startAutoplay();
  });

  carousel.addEventListener('focusin', () => {
    hasFocus = true;
    stopAutoplay();
  });

  carousel.addEventListener('focusout', (event) => {
    if (event.relatedTarget instanceof Node && carousel.contains(event.relatedTarget)) return;
    hasFocus = false;
    startAutoplay();
  });

  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopAutoplay() : startAutoplay();
  });

  reducedMotion.addEventListener('change', startAutoplay);
  showSlide(0);
  startAutoplay();
});
