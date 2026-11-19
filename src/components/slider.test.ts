import { beforeEach, describe, expect, it } from 'vitest';
import type { Product } from '../types.ts';
import { createSlider } from './slider.ts';

const product = (id: string): Product => ({
  id,
  name: `Товар ${id}`,
  description: 'Описание',
  pricePerKg: 150,
  image: { src: 'images/placeholder.svg', alt: id },
  weight: { min: 500, step: 500, max: 1000 },
});

let root: HTMLElement;

const slides = () => [...root.querySelectorAll('.slider__slide')];
const visibleSlideIndex = () =>
  slides().findIndex((s) => s.getAttribute('aria-hidden') === 'false');
const click = (selector: string) =>
  root.querySelector<HTMLButtonElement>(selector)?.click();
const press = (key: string) =>
  root
    .querySelector('.slider')
    ?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

beforeEach(() => {
  document.body.innerHTML = '<section data-slider></section>';
  root = document.querySelector<HTMLElement>('[data-slider]') as HTMLElement;
});

describe('createSlider', () => {
  it('renders a slide per product with title, price and catalog link', () => {
    createSlider(root, { title: 'Урожай', products: [product('a')] });

    expect(root.querySelector('#slider-title')?.textContent).toBe('Урожай');
    expect(slides()).toHaveLength(1);
    expect(root.querySelector('.product-slide__price')?.textContent).toBe(
      '1,50 руб./кг'
    );
    expect(
      root.querySelector('.product-slide__link')?.getAttribute('href')
    ).toBe('catalog.html#a');
  });

  it('shows only the first slide initially; others are inert', () => {
    createSlider(root, { title: 'T', products: [product('a'), product('b')] });

    expect(visibleSlideIndex()).toBe(0);
    expect(slides()[1]?.hasAttribute('inert')).toBe(true);
    expect(slides()[0]?.hasAttribute('inert')).toBe(false);
  });

  it('arrows move between slides and loop', () => {
    const slider = createSlider(root, {
      title: 'T',
      products: [product('a'), product('b'), product('c')],
    });

    click('.slider__arrow--next');
    expect(slider.index).toBe(1);
    click('.slider__arrow--prev');
    click('.slider__arrow--prev');
    expect(slider.index).toBe(2);
    expect(visibleSlideIndex()).toBe(2);
  });

  it('dots jump to a slide and mark it as current', () => {
    createSlider(root, {
      title: 'T',
      products: [product('a'), product('b'), product('c')],
    });

    const dots = root.querySelectorAll<HTMLButtonElement>('.slider__dot');
    dots[2]?.click();

    expect(visibleSlideIndex()).toBe(2);
    expect(dots[2]?.getAttribute('aria-current')).toBe('true');
    expect(dots[0]?.getAttribute('aria-current')).toBe('false');
  });

  it('arrow keys switch slides', () => {
    const slider = createSlider(root, {
      title: 'T',
      products: [product('a'), product('b')],
    });

    press('ArrowRight');
    expect(slider.index).toBe(1);
    press('ArrowLeft');
    expect(slider.index).toBe(0);
  });

  it('hides controls when there is a single slide', () => {
    createSlider(root, { title: 'T', products: [product('a')] });

    expect(root.querySelector<HTMLElement>('.slider__controls')?.hidden).toBe(
      true
    );
  });
});
