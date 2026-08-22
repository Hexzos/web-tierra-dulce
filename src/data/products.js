export const fallbackImage = '/images/products/rollos_de_canela.png';

// Presentation-only metadata that is not part of the product domain model.
export const productPresentation = {
  'dubai-cookie': { imageWidth: 1086, imageHeight: 1086 },
  'velvet-love': { imageWidth: 1086, imageHeight: 1086 },
  'limon-alegre': { imageWidth: 1086, imageHeight: 1086 },
  oreotella: { imageWidth: 1086, imageHeight: 1086 },
  'tiramisu-cookie': { imageWidth: 1086, imageHeight: 1086 },
  'galleta-mm': { imageWidth: 1086, imageHeight: 1086 },
  'cookies-and-cream': { imageWidth: 1123, imageHeight: 1123 },
  'choco-avellana': { imageWidth: 1023, imageHeight: 818 },
  'rollo-clasico': { imageWidth: 2570, imageHeight: 2184, isPlaceholder: true },
  'rollo-oreo': { imageWidth: 2570, imageHeight: 2184, isPlaceholder: true },
  'rollo-dubai': { imageWidth: 2570, imageHeight: 2184, isPlaceholder: true },
};

export const categoryPresentation = {
  cookies: { categoryLabel: 'Nuestra especialidad', image: '/images/products/Dubai_Cookie.png', imageAlt: 'Dubai Cookie de Tierra Dulce', imageWidth: 1086, imageHeight: 1086 },
  rollos: { categoryLabel: 'Repostería', image: fallbackImage, imageAlt: 'Rollos de canela de Tierra Dulce', imageWidth: 2570, imageHeight: 2184 },
};

// This is an editorial CTA, not a physical catalog category.
export const editorialLandingCards = [
  { id: 'categoria-novedades', name: 'Y mucho más...', categoryLabel: 'Novedades', description: 'Nuevos sabores, ediciones especiales y otras delicias van llegando a Tierra Dulce.', image: '/images/products/mucho_mas.png', imageAlt: 'Selección de variedades de Tierra Dulce', imageWidth: 1176, imageHeight: 1044, ctaLabel: 'Descubre las novedades', ctaUrl: 'https://www.instagram.com/tierra.dulce.va/', external: true },
];
