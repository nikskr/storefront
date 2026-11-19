import { consent, contacts } from '../data/content.ts';
import { site } from '../data/site.ts';
import { el } from '../lib/dom.ts';
import { formatPhone } from '../lib/format.ts';

interface FooterOptions {
  contacts: typeof contacts;
  siteName: string;
  policy: { href: string; label: string };
  year: number;
}

const defaults: FooterOptions = {
  contacts,
  siteName: site.name,
  policy: { href: consent.policyHref, label: consent.policyLinkLabel },
  year: new Date().getFullYear(),
};

export function renderFooter(
  root: HTMLElement,
  options: FooterOptions = defaults
) {
  const { contacts: info, siteName, policy, year } = options;

  const phones = info.phones.map((phone) =>
    el('li', { className: 'footer__phone-item' }, [
      el('span', { className: 'footer__phone-label', text: phone.label }),
      el('a', {
        className: 'footer__phone',
        text: formatPhone(phone.number),
        attrs: { href: `tel:${phone.number}` },
      }),
    ])
  );

  root.replaceChildren(
    el('div', { className: 'container footer__inner' }, [
      el('div', { className: 'footer__brand' }, [
        el('p', { className: 'footer__name', text: siteName }),
        el('p', { className: 'footer__hours', text: info.workingHours }),
      ]),
      el('div', { className: 'footer__contacts' }, [
        el('h2', { className: 'footer__title', text: info.title }),
        el('ul', { className: 'footer__phones' }, phones),
      ]),
      el('div', { className: 'footer__bottom' }, [
        el('p', { className: 'footer__copy', text: `© ${year} ${siteName}` }),
        el('a', {
          className: 'footer__link',
          text: policy.label,
          attrs: { href: policy.href },
        }),
      ]),
    ])
  );
}
