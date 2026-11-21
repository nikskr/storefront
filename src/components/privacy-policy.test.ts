import { beforeEach, describe, expect, it } from 'vitest';
import { checkoutContent, operator, privacyPolicy } from '../data/content.ts';
import { renderPrivacyPolicy } from './privacy-policy.ts';

let root: HTMLElement;

beforeEach(() => {
  document.body.innerHTML = '<article data-policy></article>';
  root = document.querySelector<HTMLElement>('[data-policy]') as HTMLElement;
});

describe('renderPrivacyPolicy', () => {
  it('numbers sections so "п. 1" and "6.1" in the text make sense', () => {
    renderPrivacyPolicy(root);

    const titles = [...root.querySelectorAll('.policy__subtitle')].map(
      (h) => h.textContent
    );
    expect(titles).toHaveLength(privacyPolicy.sections.length);
    expect(titles[0]).toBe('1. Оператор персональных данных');
    expect(titles[5]).toBe('6. Передача данных третьим лицам');
  });

  it('inserts operator details into the text', () => {
    renderPrivacyPolicy(root);
    const text = root.textContent ?? '';

    expect(text).toContain(
      `Индивидуальный предприниматель ${operator.fullName} (УНП ${operator.unp})`
    );
    expect(text).toContain(`Адрес: ${operator.address}.`);
    expect(text).toContain(
      `Индивидуальный предприниматель ${operator.shortName}`
    );
  });

  it('renders every e-mail mention as a mailto link', () => {
    renderPrivacyPolicy(root);
    const links = [...root.querySelectorAll('a[href^="mailto:"]')];

    expect(links).toHaveLength(3);
    for (const link of links) {
      expect(link.getAttribute('href')).toBe(`mailto:${operator.email}`);
      expect(link.textContent).toBe(operator.email);
    }
  });

  it('keeps text around an inline e-mail', () => {
    renderPrivacyPolicy(root);
    const paragraph = [...root.querySelectorAll('.policy__text')].find((el) =>
      el.textContent?.startsWith('Ответственным')
    );

    expect(paragraph?.textContent).toBe(
      `Ответственным за осуществление внутреннего контроля за обработкой персональных данных является Индивидуальный предприниматель ${operator.shortName} (контактный e-mail: ${operator.email}).`
    );
  });

  it('ties the consent moment to the checkbox and the real button label', () => {
    renderPrivacyPolicy(root);

    expect(root.textContent).toContain(
      `отметил в форме заказа поле согласия на обработку персональных данных («галочку») и нажал кнопку «${checkoutContent.submit}»`
    );
  });

  it('renders lists', () => {
    renderPrivacyPolicy(root);
    const items = [...root.querySelectorAll('.policy__list li')].map(
      (li) => li.textContent
    );

    expect(items).toContain('Номер телефона.');
    expect(items).toContain('Согласование условий и времени доставки.');
  });
});
