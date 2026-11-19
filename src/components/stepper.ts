import { el } from '../lib/dom.ts';
import { formatWeight } from '../lib/format.ts';
import type { Grams } from '../types.ts';

export interface Stepper {
  element: HTMLDivElement;
  update(grams: Grams, canIncrement: boolean): void;
  focusIncrement(): void;
}

interface StepperOptions {
  /** Product name for screen reader labels. */
  name: string;
  onDecrement: () => void;
  onIncrement: () => void;
}

/** "− 1,5 кг +" weight control. */
export function createStepper({
  name,
  onDecrement,
  onIncrement,
}: StepperOptions): Stepper {
  const decrement = el('button', {
    className: 'stepper__button',
    text: '−',
    attrs: { type: 'button', 'aria-label': `Уменьшить вес: ${name}` },
  });
  const value = el('span', { className: 'stepper__value' });
  const increment = el('button', {
    className: 'stepper__button',
    text: '+',
    attrs: { type: 'button', 'aria-label': `Увеличить вес: ${name}` },
  });

  decrement.addEventListener('click', onDecrement);
  increment.addEventListener('click', onIncrement);

  const element = el(
    'div',
    { className: 'stepper', attrs: { role: 'group', 'aria-label': name } },
    [decrement, value, increment]
  );

  return {
    element,
    update(grams, canIncrement) {
      value.textContent = formatWeight(grams);
      increment.disabled = !canIncrement;
    },
    focusIncrement: () => increment.focus(),
  };
}
