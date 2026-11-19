import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createCartStore } from '../lib/cart-store.ts';
import type { CartStore } from '../lib/cart-store.ts';
import type { OrderRequest, OrderResponse } from '../lib/order.ts';
import type { Product } from '../types.ts';
import { createCheckout } from './checkout.ts';

const carrot: Product = {
  id: 'carrot',
  name: 'Морковь',
  description: '',
  pricePerKg: 180,
  image: { src: '', alt: '' },
  weight: { min: 500, step: 500, max: 2000 },
};

type Submit = (request: OrderRequest) => Promise<OrderResponse>;

let root: HTMLElement;
let store: CartStore;
let submit: ReturnType<typeof vi.fn<Submit>>;

const q = <T extends Element = HTMLElement>(selector: string) =>
  root.querySelector<T>(selector) as T;
const phone = () => q<HTMLInputElement>('#checkout-phone');
const consentBox = () => q<HTMLInputElement>('#checkout-consent');
const button = () => q<HTMLButtonElement>('.checkout__submit');
const form = () => q<HTMLFormElement>('.checkout__form');

function fill(value: string, consent = true) {
  phone().value = value;
  consentBox().checked = consent;
  consentBox().dispatchEvent(new Event('change'));
}
const send = () => form().requestSubmit();
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = '<div data-checkout></div>';
  root = document.querySelector<HTMLElement>('[data-checkout]') as HTMLElement;
  store = createCartStore({
    products: [carrot],
    storage: localStorage,
    key: 't',
  });
  submit = vi.fn<Submit>().mockResolvedValue({ ok: true, orderId: 'id-1' });
  createCheckout(root, { store, submit, createOrderId: () => 'order-123456' });
  store.add('carrot');
});

describe('createCheckout', () => {
  it('is hidden while the cart is empty', () => {
    store.clear();
    expect(root.hidden).toBe(true);
  });

  it('starts with an unchecked consent and a blocked button', () => {
    expect(root.hidden).toBe(false);
    expect(consentBox().checked).toBe(false);
    expect(button().getAttribute('aria-disabled')).toBe('true');
  });

  it('unblocks the button when consent is given', () => {
    fill('+375291234567');
    expect(button().getAttribute('aria-disabled')).toBe('false');
  });

  it('does not send without consent and explains why', () => {
    fill('+375291234567', false);
    send();

    expect(submit).not.toHaveBeenCalled();
    expect(q('#checkout-consent-error').hidden).toBe(false);
    expect(q('#checkout-consent-error').textContent).toContain('Без согласия');
    expect(document.activeElement).toBe(consentBox());
  });

  it('does not send an invalid phone', () => {
    fill('12345');
    send();

    expect(submit).not.toHaveBeenCalled();
    expect(q('#checkout-phone-error').hidden).toBe(false);
    expect(phone().getAttribute('aria-invalid')).toBe('true');
    expect(document.activeElement).toBe(phone());
  });

  it('formats a valid phone on blur', () => {
    phone().value = '8029 1234567';
    phone().dispatchEvent(new Event('blur'));
    expect(phone().value).toBe('+375 (29) 123-45-67');
  });

  it('sends the order, clears the cart and shows the success message', async () => {
    fill('8 029 123 45 67');
    send();
    await flush();

    expect(submit).toHaveBeenCalledWith({
      orderId: 'order-123456',
      phone: '+375291234567',
      consent: true,
      items: [{ id: 'carrot', grams: 500 }],
      total: 90,
      website: '',
    });
    expect(store.getCart()).toEqual([]);
    expect(root.hidden).toBe(false);
    expect(q('.checkout__success').hidden).toBe(false);
    expect(q('.checkout__success-text').textContent).toContain(
      '+375 (29) 123-45-67'
    );
    expect(document.activeElement).toBe(q('.checkout__success'));
  });

  it('a new item after success shows the form again', async () => {
    fill('+375291234567');
    send();
    await flush();
    store.add('carrot');

    expect(q('.checkout__success').hidden).toBe(true);
    expect(form().hidden).toBe(false);
    expect(consentBox().checked).toBe(false);
  });

  it('keeps the cart and shows an error when sending fails', async () => {
    submit.mockResolvedValue({ ok: false, error: 'network' });
    fill('+375291234567');
    send();
    await flush();

    expect(store.getCart()).toHaveLength(1);
    expect(q('.checkout__error').hidden).toBe(false);
    expect(q('.checkout__error').textContent).toContain('Нет связи');
    expect(button().getAttribute('aria-disabled')).toBe('false');
  });

  it('ignores repeated submits while sending', async () => {
    let resolve: (value: OrderResponse) => void = () => {};
    submit.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      })
    );
    fill('+375291234567');
    send();
    send();

    expect(submit).toHaveBeenCalledOnce();
    expect(button().textContent).toBe('Отправляем…');
    expect(form().getAttribute('aria-busy')).toBe('true');

    resolve({ ok: true, orderId: 'order-123456' });
    await flush();
  });

  it('sends the honeypot value so the server can drop bots', async () => {
    fill('+375291234567');
    q<HTMLInputElement>('#checkout-website').value = 'spam';
    send();
    await flush();

    expect(submit.mock.calls[0]?.[0].website).toBe('spam');
  });

  it('links to the privacy policy', () => {
    expect(q('.consent__link').getAttribute('href')).toBe('privacy.html');
  });
});
