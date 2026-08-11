Tierra Dulce
Villa Alemana, Chile

Stack:
Astro 7
HTML5
CSS3
Vanilla JavaScript

Diseño:
Mobile-first
390px referencia móvil
1440px referencia desktop
Crumbl como referencia, no copia
Tipografía más contenida
Fotografía de producto protagonista

Landing:
Navbar
Hero
Productos
Brand Moment
Nosotros
Ubicación
Footer + Reviews

Conversión:
WhatsApp
Sin popups invasivos

Arquitectura:
Componentes Astro
CSS propio
Sin React inicialmente
Sin Tailwind
Sin backend inicialmente

SEO:
Landing optimizada
Blog futuro
SEO local Villa Alemana

## Images and Media

- Real Tierra Dulce photography has not yet been provided.
- Do not invent local image file paths for assets that do not exist.
- When a design requires an image that is not available, create an empty visual placeholder that preserves the intended dimensions, aspect ratio, border radius, spacing, and responsive behavior.
- Placeholders should be visually neutral and should not look like final content.
- Add clear comments identifying what image belongs there, for example:
  `<!-- TODO: Replace with real Tierra Dulce cheesecake photography -->`
- Use descriptive placeholder classes such as:
  `.image-placeholder`
  `.product-image-placeholder`
  `.hero-image-placeholder`
- Placeholders must remain responsive.

### Stock images

Stock photography may be used during development only when:
- The image clearly matches the context of the section.
- The subject is relevant to Tierra Dulce: cheesecakes, cookies, cakes, desserts, bakery products, ingredients, or related food photography.
- The source can be reasonably identified as suitable for development use, preferably Unsplash or Pexels.
- Remote images must not be presented as actual Tierra Dulce products.
- Do not invent product names, prices, ingredients, or characteristics based on stock photography.
- Stock images are temporary development assets and must be easy to replace later.
- Prefer placeholders over unrelated or low-quality stock photography.

### Image implementation

- Hero images should be treated as high-priority content and must not use lazy loading.
- Images below the fold should use lazy loading when appropriate.
- Always provide meaningful `alt` text for real content images.
- Decorative images should use an empty `alt=""`.
- Prevent layout shift by defining image dimensions or aspect ratios.
- Use `object-fit: cover` only when cropping does not hide important product content.
- Product photography should remain visually prominent without overwhelming typography.