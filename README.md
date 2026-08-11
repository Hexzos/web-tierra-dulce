# Tierra Dulce — Landing Page

Landing page desarrollada para **Tierra Dulce**, emprendimiento de pastelería ubicado en Villa Alemana, Chile, enfocado en productos dulces como cheesecakes, galletas, queques y otras preparaciones.

El proyecto busca construir una presencia digital atractiva, responsive y orientada a conversión, combinando **desarrollo web, Marketing Digital, SEO, UX/UI, branding y dirección de arte**.

> Proyecto desarrollado por **Gabriel Llanos Arzola**.

---

## Descripción del proyecto

Tierra Dulce necesitaba una presencia web que permitiera presentar su identidad, productos y ubicación de una manera sencilla y visualmente atractiva.

A diferencia de un e-commerce tradicional, esta primera versión se plantea como una **landing page orientada al descubrimiento y contacto**, evitando introducir procesos de compra innecesarios para el modelo actual del negocio.

El principal CTA del sitio es **WhatsApp**, utilizado como canal directo entre el potencial cliente y Tierra Dulce.

La experiencia fue diseñada procurando que este contacto esté siempre disponible sin forzar prematuramente la conversión del usuario.

---

## Objetivos

El proyecto tiene como principales objetivos:

- Crear una presencia digital profesional para Tierra Dulce.
- Comunicar claramente qué ofrece el emprendimiento.
- Presentar visualmente sus principales productos.
- Facilitar el contacto mediante WhatsApp.
- Dar visibilidad a la ubicación física del negocio.
- Diseñar una experiencia optimizada para dispositivos móviles.
- Construir una base preparada para estrategias futuras de SEO.
- Favorecer la captación de tráfico orgánico mediante Marketing Digital.
- Mantener una arquitectura escalable para futuras funcionalidades.

---

## Enfoque de Marketing Digital y SEO

La landing page fue concebida no solo como una pieza visual, sino como un activo dentro de una estrategia de **Marketing Digital**.

Uno de sus objetivos es establecer una base técnica y de contenido que permita posteriormente desarrollar estrategias de adquisición de tráfico orgánico.

Para ello se consideran aspectos como:

- HTML semántico.
- Jerarquía correcta de encabezados.
- Textos descriptivos.
- Optimización de imágenes.
- Uso apropiado de atributos `alt`.
- Diseño responsive.
- Rendimiento web.
- Arquitectura clara de contenidos.
- Información contextual relacionada con la actividad y ubicación del negocio.
- Experiencia de usuario orientada a navegación y conversión.

La arquitectura permite además incorporar posteriormente contenido orientado a búsquedas relacionadas con pastelería, productos, eventos y necesidades de usuarios locales.

---

## UX/UI

El diseño de experiencia e interfaz se desarrolló considerando especialmente el comportamiento de usuarios que acceden desde dispositivos móviles.

La navegación busca mantener una experiencia simple y progresiva:

**Descubrir → Explorar productos → Conocer la marca → Ubicar el negocio → Contactar**

Entre las decisiones de UX/UI implementadas se encuentran:

- Navbar sticky.
- Navegación mediante anchors.
- Scroll suave entre secciones.
- Indicador dinámico de la sección activa.
- CTA de WhatsApp disponible durante la navegación.
- Diseño mobile-first / responsive.
- Catálogo inicial reducido para evitar saturación visual.
- Sistema de “Ver más productos”.
- Animaciones e interacciones discretas.
- Jerarquía tipográfica clara.
- Secciones visualmente diferenciadas.
- Carrusel de reseñas.
- Uso controlado del espacio en blanco.

El objetivo es reducir fricción y permitir que el usuario explore antes de decidir si desea contactar al negocio.

---

## Dirección de arte y Branding

La identidad visual del sitio parte del logotipo y de los colores existentes de **Tierra Dulce**.

A partir de estos elementos se desarrolló una dirección de arte digital que combina tonos turquesa, aqua, café y colores cálidos relacionados visualmente con repostería y productos dulces.

Paleta de referencia:

```css
#e0b27f
#edc176
#102423
#70c3c4
#8c5932
#34261a
#448884
#173e3d
#b7804d
```

La tipografía principal seleccionada es **Montserrat**, utilizando diferentes pesos para establecer jerarquía entre navegación, títulos, subtítulos y cuerpo de texto.

También se desarrollaron y adaptaron variantes del logotipo para responder a diferentes necesidades de interfaz, como su utilización horizontal dentro del Navbar.

---

## Inteligencia Artificial aplicada al desarrollo

El proyecto incorpora **Inteligencia Artificial como herramienta de apoyo durante el proceso de desarrollo y diseño**.

Su utilización se integra dentro de un flujo supervisado de trabajo para apoyar tareas relacionadas con:

- Investigación de referencias.
- Análisis de tendencias UX/UI.
- Exploración de patrones de navegación.
- Desarrollo y revisión de código.
- Evaluación de componentes.
- Iteración de interfaces.
- Responsive design.
- Accesibilidad.
- SEO técnico.
- Arquitectura de información.
- Optimización del flujo de desarrollo.

La IA se utiliza como una herramienta complementaria dentro del proceso creativo y técnico, manteniendo las decisiones de diseño, dirección de arte, branding y estrategia bajo supervisión humana.

---

# Tecnologías utilizadas

## Astro

El proyecto utiliza **Astro** como framework principal.

Astro permite construir una arquitectura basada en componentes manteniendo una salida optimizada para sitios predominantemente estáticos.

Se utiliza para:

- estructura general del proyecto;
- layouts;
- componentes reutilizables;
- organización de secciones;
- generación del sitio estático;
- optimización del frontend.

---

## HTML

Astro genera HTML para el navegador y permite mantener una estructura semántica orientada tanto a accesibilidad como a SEO.

El contenido se organiza mediante elementos y secciones que representan correctamente su función dentro de la página.

---

## CSS

CSS es utilizado para construir la identidad visual y el sistema responsive del proyecto.

La arquitectura incluye:

- variables/tokens de diseño;
- tipografía;
- sistema de colores;
- responsive design;
- estados interactivos;
- animaciones;
- layout mediante Flexbox y Grid;
- breakpoints;
- componentes reutilizables.

---

## JavaScript

JavaScript vanilla es utilizado únicamente donde existe una necesidad de interacción.

Entre sus responsabilidades se encuentran:

- navegación entre secciones;
- scroll suave;
- detección de sección activa;
- menú responsive;
- expansión del catálogo;
- animaciones;
- carrusel de reseñas.

Se evita incorporar dependencias innecesarias para mantener el proyecto ligero.

---

## Node.js y npm

Node.js y npm se utilizan como entorno y sistema de gestión de dependencias durante el desarrollo.

Permiten ejecutar Astro, instalar dependencias, levantar el servidor local y generar la versión de producción.

Comandos principales:

```bash
npm install
npm run dev
npm run build
```

---

## Git y GitHub

El proyecto utiliza Git para control de versiones y GitHub como repositorio remoto.

Esto permite:

- mantener historial de cambios;
- controlar versiones del proyecto;
- documentar el desarrollo;
- facilitar despliegues;
- mantener una estructura profesional para portafolio.

---

## Estructura general

```text
web-tierra-dulce/
│
├── public/
│   └── images/
│       ├── brand/
│       ├── products/
│       └── stock/
│
├── src/
│   ├── components/
│   │   ├── layout/
│   │   ├── sections/
│   │   └── ui/
│   │
│   ├── data/
│   ├── layouts/
│   ├── pages/
│   ├── scripts/
│   └── styles/
│
├── astro.config.mjs
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

---

# Secciones del landing

La versión actual contempla:

### Inicio

Presentación inicial de Tierra Dulce y propuesta general del negocio.

### Productos

Catálogo visual de productos destacados con expansión progresiva para evitar sobrecarga de información.

### Nosotros

Presentación de la marca, identidad e información del emprendimiento.

### Visítanos

Información destinada a comunicar la ubicación física y horarios del negocio.

### Contacto

Footer orientado a contacto, redes sociales, WhatsApp y presentación de reseñas.

---

# Responsive Design

El sitio fue diseñado considerando especialmente navegación desde smartphones.

La interfaz se adapta progresivamente a diferentes tamaños de pantalla, reorganizando elementos, navegación, imágenes y contenido cuando es necesario.

Se realizan pruebas de referencia en resoluciones móviles, tablet y desktop.

---

# Estado del proyecto

**MVP / Demo en desarrollo**

Esta versión se utiliza para:

- validación visual;
- revisión de estructura;
- evaluación UX/UI;
- aprobación del cliente;
- pruebas responsive;
- definición del contenido final.

Algunas imágenes y textos pueden corresponder a contenido temporal utilizado exclusivamente para visualizar la propuesta.

Los recursos definitivos serán incorporados progresivamente durante las siguientes etapas del proyecto.

---

# Próximas mejoras

Entre las mejoras previstas se encuentran:

- Incorporación de fotografías reales de Tierra Dulce.
- Contenido definitivo de productos.
- Información comercial definitiva.
- Integración de ubicación real.
- Optimización de imágenes para producción.
- Metadatos SEO definitivos.
- Open Graph y contenido para redes sociales.
- Revisión de accesibilidad.
- Optimización de rendimiento.
- Revisión Lighthouse.
- Configuración de analítica.
- Estrategia SEO y medición de tráfico orgánico.

---

# Autor

**Gabriel Llanos Arzola**

Proyecto desarrollado combinando conocimientos y herramientas de:

**Desarrollo Web · Marketing Digital · SEO · UX/UI · Dirección de Arte · Branding · Inteligencia Artificial aplicada al desarrollo**

---

## Licencia y recursos

Este repositorio corresponde a un proyecto desarrollado para Tierra Dulce.

Los logotipos, elementos de identidad visual y otros recursos asociados a la marca pertenecen a sus respectivos propietarios.

Durante la etapa MVP pueden utilizarse recursos visuales temporales o de stock. Estos no necesariamente representan los productos finales del negocio y deberán respetarse las condiciones de licencia de sus respectivas fuentes.

El código fuente y los recursos de marca no deben considerarse automáticamente bajo la misma licencia.