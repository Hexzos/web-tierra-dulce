export const fallbackImage = '/images/products/rollos_de_canela.png';

export const fallbackProduct = {
  name: 'Una nueva delicia está por llegar',
  description: 'Estamos preparando nuevos sabores para seguir sorprendiendo tus antojos.',
  category: 'Novedades', image: fallbackImage, isPlaceholder: true,
};

export const products = [
  { id: 'dubai-cookie', name: 'Dubai Cookie', category: 'cookies', categoryLabel: 'Cookies', description: 'Chocolate, pistacho y crujientes fideos kataifi en una cookie hecha para sorprender.', image: '/images/products/Dubai_Cookie.png', imageAlt: 'Dubai Cookie de chocolate con pistacho y kataifi de Tierra Dulce', imageWidth: 1086, imageHeight: 1086 },
  { id: 'velvet-love', name: 'Velvet Love', category: 'cookies', categoryLabel: 'Cookies', description: 'Cookie de cacao con cheesecake y mermelada de frambuesa. Cremosa, intensa y frutal.', image: '/images/products/Velvet_Love.png', imageAlt: 'Velvet Love de cacao con cheesecake y frambuesa de Tierra Dulce', imageWidth: 1086, imageHeight: 1086 },
  { id: 'limon-alegre', name: 'Limón Alegre', category: 'cookies', categoryLabel: 'Cookies', description: 'Cookie de limón rellena de cheesecake de limón. Fresca, cremosa y con ese toque cítrico que alegra el día.', image: '/images/products/Limón_Alegre.png', imageAlt: 'Cookie Limón Alegre rellena de cheesecake de limón de Tierra Dulce', imageWidth: 1086, imageHeight: 1086 },
  { id: 'oreotella', name: 'Oreotella', category: 'cookies', categoryLabel: 'Cookies', description: 'Cookie de chocolate con trozos de Oreo y un irresistible relleno de Nutella.', image: '/images/products/Oreotella.png', imageAlt: 'Cookie Oreotella de chocolate, Oreo y Nutella de Tierra Dulce', imageWidth: 1086, imageHeight: 1086 },
  { id: 'tiramisu-cookie', name: 'Tiramisú Cookie', category: 'cookies', categoryLabel: 'Cookies', description: 'Un toque de café, galleta italiana remojada en café de especialidad y topping de queso crema.', image: '/images/products/Tiramisu_cookie.png', imageAlt: 'Tiramisú Cookie con café y queso crema de Tierra Dulce', imageWidth: 1086, imageHeight: 1086 },
  { id: 'galleta-mm', name: 'Galleta M&M', category: 'cookies', categoryLabel: 'Cookies', description: 'Cookie con Nutella y M&M: chocolate, color y mucho sabor en cada mordida.', image: '/images/products/Galleta_M&M.png', imageAlt: 'Cookie con Nutella y M&M de Tierra Dulce', imageWidth: 1086, imageHeight: 1086 },
  { id: 'cookies-and-cream', name: 'Cookies & Cream', category: 'cookies', categoryLabel: 'Cookies', description: 'Cookie con trozos de Oreo y un corazón de manjar. Un clásico con sello Tierra Dulce.', image: '/images/products/Cookies_and_cream.png', imageAlt: 'Cookies and Cream con Oreo y relleno de manjar de Tierra Dulce', imageWidth: 1123, imageHeight: 1123 },
  // TODO: Reemplazar la imagen temporal de Choco Avellana por el PNG definitivo cuando sea entregado.
  { id: 'choco-avellana', name: 'Choco Avellana', category: 'cookies', categoryLabel: 'Cookies', description: 'Galleta con trozos de chocolate semi amargo y un irresistible relleno de Nutella.', image: fallbackImage, imageAlt: 'Cookie Choco Avellana con chocolate semi amargo y relleno de Nutella de Tierra Dulce', imageWidth: 2570, imageHeight: 2184, isPlaceholder: true },
  { id: 'rollo-clasico', name: 'Clásico', category: 'rollos', categoryLabel: 'Rollos de Canela', description: 'El sabor tradicional del rollo de canela, suave y perfecto para acompañar cualquier momento.', image: fallbackImage, imageAlt: 'Rollo de canela Clásico de Tierra Dulce', imageWidth: 2570, imageHeight: 2184, isPlaceholder: true },
  { id: 'rollo-oreo', name: 'Oreo', category: 'rollos', categoryLabel: 'Rollos de Canela', description: 'Una versión del rollo de canela con el toque inconfundible de Oreo.', image: fallbackImage, imageAlt: 'Rollo de canela variedad Oreo de Tierra Dulce', imageWidth: 2570, imageHeight: 2184, isPlaceholder: true },
  { id: 'rollo-dubai', name: 'Dubai', category: 'rollos', categoryLabel: 'Rollos de Canela', description: 'Una versión especial inspirada en los sabores que hacen de Dubai una de nuestras combinaciones más llamativas.', image: fallbackImage, imageAlt: 'Rollo de canela variedad Dubai de Tierra Dulce', imageWidth: 2570, imageHeight: 2184, isPlaceholder: true },
];

export const landingCategories = [
  { id: 'categoria-cookies', name: 'Cookies', categoryLabel: 'Nuestra especialidad', description: 'Descubre sabores, rellenos y combinaciones preparadas para cada antojo.', image: '/images/products/Dubai_Cookie.png', imageAlt: 'Dubai Cookie de Tierra Dulce', imageWidth: 1086, imageHeight: 1086, ctaLabel: 'Ver variedades', ctaUrl: '/productos/?categoria=cookies' },
  { id: 'categoria-rollos', name: 'Rollos de Canela', categoryLabel: 'Repostería', description: 'Clásicos, Oreo, Dubai y otras variedades que van llegando a nuestra vitrina.', image: fallbackImage, imageAlt: 'Rollos de canela de Tierra Dulce', imageWidth: 2570, imageHeight: 2184, ctaLabel: 'Ver variedades', ctaUrl: '/productos/?categoria=rollos' },
  { id: 'categoria-novedades', name: 'Y mucho más...', categoryLabel: 'Novedades', description: 'Nuevos sabores, ediciones especiales y otras delicias van llegando a Tierra Dulce.', image: '/images/products/mucho_mas.png', imageAlt: 'Selección de variedades de Tierra Dulce', imageWidth: 1176, imageHeight: 1044, ctaLabel: 'Descubre las novedades', ctaUrl: 'https://www.instagram.com/tierra.dulce.va/', external: true },
];
