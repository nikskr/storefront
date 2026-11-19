import { checkoutContent, consent } from '../data/content.ts';
import type { CartStore } from '../lib/cart-store.ts';
import { el } from '../lib/dom.ts';
import { formatPhone } from '../lib/format.ts';
import { buildOrderRequest } from '../lib/order.ts';
import type {
  OrderErrorCode,
  OrderRequest,
  OrderResponse,
} from '../lib/order.ts';
import { submitOrder } from '../lib/order-client.ts';
import { normalizePhone } from '../lib/phone.ts';
import { PHONE } from '../config.ts';

interface CheckoutOptions {
  store: CartStore;
  submit?: (request: OrderRequest) => Promise<OrderResponse>;
  createOrderId?: () => string;
  content?: typeof checkoutContent;
  consentContent?: typeof consent;
}

/**
 * Order form under the cart: phone, mandatory personal data consent,
 * hidden honeypot and submission with clear success and error states.
 */
export function createCheckout(
  root: HTMLElement,
  {
    store,
    submit = submitOrder,
    createOrderId = () => crypto.randomUUID(),
    content = checkoutContent,
    consentContent = consent,
  }: CheckoutOptions
) {
  // Phone field
  const phone = el('input', {
    className: 'field__input',
    attrs: {
      id: 'checkout-phone',
      name: 'phone',
      type: 'tel',
      inputmode: 'tel',
      autocomplete: 'tel',
      placeholder: PHONE.placeholder,
      required: '',
      'aria-describedby': 'checkout-phone-hint checkout-phone-error',
    },
  });
  const phoneError = el('p', {
    className: 'field__error',
    attrs: { id: 'checkout-phone-error' },
  });
  phoneError.hidden = true;

  // Consent checkbox: never pre-checked.
  const consentBox = el('input', {
    className: 'consent__checkbox',
    attrs: {
      id: 'checkout-consent',
      name: 'consent',
      type: 'checkbox',
      required: '',
      'aria-describedby': 'checkout-consent-error',
    },
  });
  const consentError = el('p', {
    className: 'field__error',
    text: consentContent.requiredMessage,
    attrs: { id: 'checkout-consent-error' },
  });
  consentError.hidden = true;

  // Honeypot: invisible for people, tempting for bots.
  const trap = el('input', {
    attrs: {
      id: 'checkout-website',
      name: 'website',
      type: 'text',
      tabindex: '-1',
      autocomplete: 'off',
    },
  });

  const formError = el('p', {
    className: 'checkout__error',
    attrs: { role: 'alert' },
  });
  formError.hidden = true;

  const button = el('button', {
    className: 'button button--primary checkout__submit',
    text: content.submit,
    attrs: { type: 'submit' },
  });

  const form = el(
    'form',
    {
      className: 'checkout__form',
      attrs: { novalidate: '', 'aria-labelledby': 'checkout-title' },
    },
    [
      el('h3', {
        className: 'checkout__title',
        text: content.title,
        attrs: { id: 'checkout-title' },
      }),
      el('div', { className: 'field' }, [
        el('label', {
          className: 'field__label',
          text: content.phoneLabel,
          attrs: { for: 'checkout-phone' },
        }),
        phone,
        el('p', {
          className: 'field__hint',
          text: content.phoneHint,
          attrs: { id: 'checkout-phone-hint' },
        }),
        phoneError,
      ]),
      el(
        'div',
        { className: 'checkout__trap', attrs: { 'aria-hidden': 'true' } },
        [
          el('label', { text: 'Сайт', attrs: { for: 'checkout-website' } }),
          trap,
        ]
      ),
      el('div', { className: 'consent' }, [
        consentBox,
        el('div', { className: 'consent__text' }, [
          el('label', {
            className: 'consent__label',
            text: consentContent.label,
            attrs: { for: 'checkout-consent' },
          }),
          el(
            'a',
            {
              className: 'consent__link',
              text: consentContent.policyLinkLabel,
              attrs: {
                href: consentContent.policyHref,
                target: '_blank',
                rel: 'noopener',
              },
            },
            [
              el('span', {
                className: 'visually-hidden',
                text: ' (откроется в новой вкладке)',
              }),
            ]
          ),
        ]),
        consentError,
      ]),
      formError,
      button,
    ]
  );

  const successText = el('p', { className: 'checkout__success-text' });
  const success = el(
    'div',
    { className: 'checkout__success', attrs: { tabindex: '-1' } },
    [
      el('h3', {
        className: 'checkout__success-title',
        text: content.successTitle,
      }),
      successText,
    ]
  );
  success.hidden = true;

  root.replaceChildren(form, success);

  let orderId = createOrderId();
  let sending = false;
  let showSuccess = false;

  // --- field states ---

  function setPhoneError(visible: boolean) {
    phoneError.textContent = content.phoneError;
    phoneError.hidden = !visible;
    phone.setAttribute('aria-invalid', String(visible));
  }

  function setConsentError(visible: boolean) {
    consentError.hidden = !visible;
    consentBox.setAttribute('aria-invalid', String(visible));
  }

  function updateButton() {
    // aria-disabled instead of disabled: the button stays focusable and a
    // click explains why the order can't be sent yet.
    const blocked = sending || !consentBox.checked;
    button.setAttribute('aria-disabled', String(blocked));
    button.textContent = sending ? content.submitting : content.submit;
  }

  phone.addEventListener('blur', () => {
    const normalized = normalizePhone(phone.value);
    if (normalized) {
      phone.value = formatPhone(normalized);
      setPhoneError(false);
    }
  });
  phone.addEventListener('input', () => {
    if (!phoneError.hidden && normalizePhone(phone.value)) setPhoneError(false);
  });
  consentBox.addEventListener('change', () => {
    if (consentBox.checked) setConsentError(false);
    updateButton();
  });

  // --- submission ---

  function errorMessage(code: OrderErrorCode): string {
    if (code === 'invalid_phone') return content.phoneError;
    if (code === 'consent_required') return consentContent.requiredMessage;
    const known: Partial<Record<OrderErrorCode, string>> = content.errors;
    return known[code] ?? content.errors.default;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (sending) return;
    formError.hidden = true;

    const normalized = normalizePhone(phone.value);
    setPhoneError(!normalized);
    setConsentError(!consentBox.checked);

    if (!normalized) {
      phone.focus();
      return;
    }
    if (!consentBox.checked) {
      consentBox.focus();
      return;
    }

    void send(normalized);
  });

  async function send(normalizedPhone: string) {
    sending = true;
    form.setAttribute('aria-busy', 'true');
    updateButton();

    const request = buildOrderRequest({
      orderId,
      phone: normalizedPhone,
      cart: store.getCart(),
      lines: store.getLines(),
      website: trap.value,
    });
    const result = await submit(request);

    sending = false;
    form.removeAttribute('aria-busy');

    if (result.ok) {
      successText.textContent = content.successText.replace(
        '{phone}',
        formatPhone(normalizedPhone)
      );
      showSuccess = true;
      orderId = createOrderId();
      form.reset();
      store.clear();
      updateButton();
      success.focus();
      return;
    }

    formError.textContent = errorMessage(result.error);
    formError.hidden = false;
    updateButton();
  }

  // --- visibility ---

  function render() {
    const hasItems = store.getCart().length > 0;
    // A new item after a successful order starts a new order.
    if (hasItems) showSuccess = false;
    form.hidden = !hasItems;
    success.hidden = !showSuccess;
    root.hidden = !hasItems && !showSuccess;
  }

  store.subscribe(render);
  render();
  updateButton();
}
