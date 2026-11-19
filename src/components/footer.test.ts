import { beforeEach, describe, expect, it } from 'vitest';
import { renderFooter } from './footer.ts';

let root: HTMLElement;

beforeEach(() => {
  document.body.innerHTML = '<footer data-footer></footer>';
  root = document.querySelector<HTMLElement>('[data-footer]') as HTMLElement;
});

describe('renderFooter', () => {
  it('renders phones as tel: links with formatted numbers', () => {
    renderFooter(root, {
      contacts: {
        title: 'Контакты',
        phones: [{ label: 'Заказы', number: '+375291234567' }],
        workingHours: '9–20',
      },
      siteName: 'Ферма',
      policy: { href: 'privacy.html', label: 'Политика' },
      year: 2026,
    });

    const link = root.querySelector('.footer__phone');
    expect(link?.getAttribute('href')).toBe('tel:+375291234567');
    expect(link?.textContent).toBe('+375 (29) 123-45-67');
    expect(root.querySelector('.footer__phone-label')?.textContent).toBe(
      'Заказы'
    );
    expect(root.querySelector('.footer__copy')?.textContent).toBe(
      '© 2026 Ферма'
    );
    expect(root.querySelector('.footer__link')?.getAttribute('href')).toBe(
      'privacy.html'
    );
  });
});
