import { el } from '../lib/dom.ts';
import { formatPricePerKg } from '../lib/format.ts';
import { swipeStep, wrapIndex } from '../lib/slider-state.ts';
import type { Product } from '../types.ts';

export interface SliderOptions {
  title: string;
  products: readonly Product[];
  /** Link for the "show in catalog" button; receives the product. */
  productHref?: (product: Product) => string;
}

export interface Slider {
  goTo(index: number): void;
  readonly index: number;
}

const defaultHref = (product: Product) => `catalog.html#${product.id}`;

function renderSlide(
  product: Product,
  position: number,
  total: number,
  href: string
): HTMLLIElement {
  return el(
    'li',
    {
      className: 'slider__slide',
      attrs: {
        role: 'group',
        'aria-roledescription': 'слайд',
        'aria-label': `${position} из ${total}`,
      },
    },
    [
      el('article', { className: 'product-slide' }, [
        el('img', {
          className: 'product-slide__image',
          attrs: {
            src: product.image.src,
            alt: product.image.alt,
            width: '400',
            height: '300',
            loading: position === 1 ? 'eager' : 'lazy',
          },
        }),
        el('div', { className: 'product-slide__body' }, [
          el('h3', { className: 'product-slide__name', text: product.name }),
          el('p', {
            className: 'product-slide__description',
            text: product.description,
          }),
          el('p', {
            className: 'product-slide__price',
            text: formatPricePerKg(product.pricePerKg),
          }),
          el('a', {
            className: 'button button--secondary product-slide__link',
            text: 'Смотреть в каталоге',
            attrs: { href },
          }),
        ]),
      ]),
    ]
  );
}

/**
 * Renders an accessible carousel into `root` (WAI-ARIA carousel pattern):
 * arrow buttons, dots, ←/→ keys and touch swipe. Loops at both ends.
 */
export function createSlider(
  root: HTMLElement,
  options: SliderOptions
): Slider {
  const { title, products, productHref = defaultHref } = options;
  const total = products.length;

  const slides = products.map((product, i) =>
    renderSlide(product, i + 1, total, productHref(product))
  );
  const track = el(
    'ul',
    { className: 'slider__track', attrs: { 'aria-live': 'polite' } },
    slides
  );
  const viewport = el('div', { className: 'slider__viewport' }, [track]);

  const prev = el('button', {
    className: 'slider__arrow slider__arrow--prev',
    attrs: { type: 'button', 'aria-label': 'Предыдущий товар' },
  });
  const next = el('button', {
    className: 'slider__arrow slider__arrow--next',
    attrs: { type: 'button', 'aria-label': 'Следующий товар' },
  });
  const dots = products.map((product) =>
    el('button', {
      className: 'slider__dot',
      attrs: {
        type: 'button',
        'aria-label': `Показать: ${product.name}`,
      },
    })
  );
  const controls = el('div', { className: 'slider__controls' }, [
    prev,
    el('div', { className: 'slider__dots' }, dots),
    next,
  ]);
  controls.hidden = total < 2;

  const carousel = el(
    'div',
    {
      className: 'slider',
      attrs: {
        'aria-roledescription': 'карусель',
        'aria-labelledby': 'slider-title',
      },
    },
    [viewport, controls]
  );

  root.replaceChildren(
    el('div', { className: 'container' }, [
      el('h2', {
        className: 'section__title',
        text: title,
        attrs: { id: 'slider-title' },
      }),
      carousel,
    ])
  );

  let current = 0;

  function goTo(index: number) {
    current = wrapIndex(index, total);
    track.style.setProperty('--slider-index', String(current));

    slides.forEach((slide, i) => {
      const active = i === current;
      slide.setAttribute('aria-hidden', String(!active));
      // Hidden slides must not be reachable with Tab.
      slide.toggleAttribute('inert', !active);
    });
    dots.forEach((dot, i) => {
      const active = i === current;
      dot.classList.toggle('slider__dot--active', active);
      dot.setAttribute('aria-current', String(active));
    });
  }

  prev.addEventListener('click', () => goTo(current - 1));
  next.addEventListener('click', () => goTo(current + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  carousel.addEventListener('keydown', (event) => {
    if (total < 2) return;
    if (event.key === 'ArrowLeft') goTo(current - 1);
    if (event.key === 'ArrowRight') goTo(current + 1);
  });

  let startX: number | null = null;
  viewport.addEventListener('pointerdown', (event) => {
    startX = event.clientX;
  });
  viewport.addEventListener('pointerup', (event) => {
    if (startX === null || total < 2) return;
    const step = swipeStep(event.clientX - startX);
    startX = null;
    if (step !== 0) goTo(current + step);
  });
  viewport.addEventListener('pointercancel', () => {
    startX = null;
  });

  goTo(0);

  return {
    goTo,
    get index() {
      return current;
    },
  };
}
