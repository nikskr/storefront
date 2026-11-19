import { el } from '../lib/dom.ts';
import { formatPricePerKg } from '../lib/format.ts';
import type { Grams, Product } from '../types.ts';
import { createStepper } from './stepper.ts';

export interface ProductCard {
  element: HTMLElement;
  /** grams in the cart, or undefined when the product is not in the cart. */
  update(grams: Grams | undefined): void;
}

interface ProductCardOptions {
  product: Product;
  addLabel: string;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

/**
 * Product card. Out of the cart it shows the "add" button,
 * in the cart it shows a weight stepper instead.
 */
export function createProductCard({
  product,
  addLabel,
  onAdd,
  onIncrement,
  onDecrement,
}: ProductCardOptions): ProductCard {
  const addButton = el('button', {
    className: 'button button--primary product-card__add',
    text: addLabel,
    attrs: { type: 'button' },
  });
  addButton.addEventListener('click', onAdd);

  const stepper = createStepper({
    name: product.name,
    onDecrement,
    onIncrement,
  });
  stepper.element.classList.add('product-card__stepper');

  const element = el(
    'article',
    // id makes slider links like catalog.html#potato scroll to the card.
    { className: 'product-card', attrs: { id: product.id } },
    [
      el('img', {
        className: 'product-card__image',
        attrs: {
          src: product.image.src,
          alt: product.image.alt,
          width: '400',
          height: '300',
          loading: 'lazy',
        },
      }),
      el('div', { className: 'product-card__body' }, [
        el('h2', { className: 'product-card__name', text: product.name }),
        el('p', {
          className: 'product-card__description',
          text: product.description,
        }),
        el('p', {
          className: 'product-card__price',
          text: formatPricePerKg(product.pricePerKg),
        }),
        el('div', { className: 'product-card__actions' }, [
          addButton,
          stepper.element,
        ]),
      ]),
    ]
  );

  return {
    element,
    update(grams) {
      const inCart = grams !== undefined;
      // Keep keyboard focus inside the card when one control replaces the other.
      const focusWasOnAdd = document.activeElement === addButton;
      const focusWasInStepper = stepper.element.contains(
        document.activeElement
      );

      addButton.hidden = inCart;
      stepper.element.hidden = !inCart;
      if (inCart) {
        stepper.update(grams, grams < product.weight.max);
      }

      if (inCart && focusWasOnAdd) stepper.focusIncrement();
      if (!inCart && focusWasInStepper) addButton.focus();
    },
  };
}
