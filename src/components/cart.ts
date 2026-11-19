import { cartContent } from '../data/content.ts';
import { canIncrement, findItem } from '../lib/cart.ts';
import type { CartLine } from '../lib/cart.ts';
import { cartChangeMessage } from '../lib/cart-messages.ts';
import type { CartStore } from '../lib/cart-store.ts';
import { el } from '../lib/dom.ts';
import { formatPrice, formatPricePerKg } from '../lib/format.ts';
import { createStepper } from './stepper.ts';
import type { Stepper } from './stepper.ts';

interface CartViewOptions {
  store: CartStore;
  announce: (message: string) => void;
  content?: typeof cartContent;
}

interface Row {
  element: HTMLLIElement;
  stepper: Stepper;
  cost: HTMLElement;
}

/**
 * Cart panel: items with weight steppers, line costs, total and "clear".
 * Rows are updated in place (keyed by product id), so buttons keep focus.
 */
export function createCartView(
  root: HTMLElement,
  { store, announce, content = cartContent }: CartViewOptions
) {
  const title = el('h2', {
    className: 'cart__title',
    text: content.title,
    // tabindex lets focus move here when the focused row disappears.
    attrs: { id: 'cart-title', tabindex: '-1' },
  });
  const empty = el('p', { className: 'cart__empty', text: content.empty });
  const list = el('ul', { className: 'cart__list' });
  const total = el('span', { className: 'cart__total-value' });
  const summary = el('p', { className: 'cart__total' }, [
    el('span', { text: content.total }),
    total,
  ]);
  const clear = el('button', {
    className: 'cart__clear',
    text: content.clear,
    attrs: { type: 'button' },
  });
  clear.addEventListener('click', () => {
    store.clear();
    title.focus();
    announce(content.cleared);
  });

  root.replaceChildren(title, empty, list, summary, clear);

  const rows = new Map<string, Row>();

  function createRow({ product }: CartLine): Row {
    const run = (action: (id: string) => void) => () => {
      action(product.id);
      const grams = findItem(store.getCart(), product.id)?.grams;
      announce(cartChangeMessage(product.name, grams));
    };
    const stepper = createStepper({
      name: product.name,
      onDecrement: run(store.decrement),
      onIncrement: run(store.increment),
    });
    const cost = el('p', { className: 'cart-item__cost' });
    const remove = el('button', {
      className: 'cart-item__remove',
      text: content.remove,
      attrs: {
        type: 'button',
        'aria-label': `${content.remove}: ${product.name}`,
      },
    });
    remove.addEventListener('click', () => {
      store.remove(product.id);
      announce(cartChangeMessage(product.name, undefined));
    });

    const element = el('li', { className: 'cart-item' }, [
      el('div', { className: 'cart-item__info' }, [
        el('p', { className: 'cart-item__name', text: product.name }),
        el('p', {
          className: 'cart-item__price',
          text: formatPricePerKg(product.pricePerKg),
        }),
      ]),
      stepper.element,
      cost,
      remove,
    ]);
    return { element, stepper, cost };
  }

  function render() {
    const lines = store.getLines();
    const ids = new Set(lines.map((line) => line.product.id));

    for (const [id, row] of rows) {
      if (ids.has(id)) continue;
      if (row.element.contains(document.activeElement)) title.focus();
      row.element.remove();
      rows.delete(id);
    }

    for (const line of lines) {
      let row = rows.get(line.product.id);
      if (!row) {
        row = createRow(line);
        rows.set(line.product.id, row);
        // New items are always added to the end of the cart.
        list.append(row.element);
      }
      row.stepper.update(line.grams, canIncrement(line.product, line.grams));
      row.cost.textContent = formatPrice(line.cost);
    }

    const isEmpty = lines.length === 0;
    empty.hidden = !isEmpty;
    list.hidden = isEmpty;
    summary.hidden = isEmpty;
    clear.hidden = isEmpty;
    total.textContent = formatPrice(store.getTotal());
  }

  store.subscribe(render);
  render();
}
