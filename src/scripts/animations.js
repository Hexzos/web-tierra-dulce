const revealElements = document.querySelectorAll('[data-reveal]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const revealImmediately = () => {
  revealElements.forEach((element) => element.setAttribute('data-revealed', ''));
};

if (reducedMotion.matches || !('IntersectionObserver' in window)) {
  revealImmediately();
} else {
  document.documentElement.classList.add('reveal-ready');

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.setAttribute('data-revealed', '');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
}
