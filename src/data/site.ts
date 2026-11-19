// MOCK: replace with real values before launch.
// Used at runtime and at build time: {{site.*}} tokens in HTML files
// are replaced with these values by scripts/static.mjs.

export const site = {
  name: 'Ферма «Зелёная грядка»',
  /** Up to ~160 characters: shown in search results and link previews. */
  description:
    'Свежие овощи напрямую от фермера: без посредников, с доставкой. Закажите онлайн за пару минут.',
  /** Final address without trailing slash: needed for absolute preview links. */
  url: 'https://example.netlify.app',
  /** Link preview image, 1200×630 PNG or JPG, path relative to src/. */
  ogImage: 'images/og-image.png',
  lang: 'ru',
  locale: 'ru_BY',
  themeColor: '#3f7d3a',
} as const;
