export const reviews = [
  {
    id: 'instagram-review-1',
    text: 'Hoy me he dado los mejores gustos reposteros.',
    source: 'Vía Instagram',
  },
  {
    id: 'instagram-review-2',
    text: 'Cada día más ricas, 1000 de 10. Ahora puedo seguir trabajando feliz.',
    source: 'Vía Instagram',
  },
  {
    id: 'instagram-review-3',
    text: 'La mejor galleta Red Velvet de la vida.',
    source: 'Vía Instagram',
  },
];

/**
 * Planned Footer carousel behavior:
 * - rotate every 12 seconds;
 * - provide previous/next controls and slide indicators;
 * - pause on pointer hover and when focus enters the carousel;
 * - disable autoplay when prefers-reduced-motion is enabled;
 * - use a brief, subtle transition implemented with vanilla JavaScript.
 */
export const reviewsCarouselConfig = {
  autoplayInterval: 12_000,
};
