import { privacyPolicy } from '../data/content.ts';
import { el } from '../lib/dom.ts';

type PrivacyPolicy = typeof privacyPolicy;

const section = (title: string, body: Node[]) =>
  el('section', { className: 'policy__section' }, [
    el('h2', { className: 'policy__subtitle', text: title }),
    ...body,
  ]);

const paragraph = (text: string) =>
  el('p', { className: 'policy__text', text });

/** Privacy policy page body built from src/data/content.ts. */
export function renderPrivacyPolicy(
  root: HTMLElement,
  policy: PrivacyPolicy = privacyPolicy
) {
  root.replaceChildren(
    el('h1', {
      className: 'policy__title',
      text: policy.title,
      attrs: { id: 'policy-title' },
    }),
    section('Оператор персональных данных', [
      paragraph(policy.operator),
      paragraph(policy.operatorAddress),
      el('p', { className: 'policy__text' }, [
        'E-mail: ',
        el('a', {
          text: policy.operatorEmail,
          attrs: { href: `mailto:${policy.operatorEmail}` },
        }),
      ]),
    ]),
    section('Какие данные мы обрабатываем', [
      el(
        'ul',
        { className: 'policy__list' },
        policy.dataCollected.map((item) => el('li', { text: item }))
      ),
    ]),
    section('Цель обработки', [paragraph(policy.purpose)]),
    section('Срок хранения', [paragraph(policy.retention)]),
    section('Передача данных', [paragraph(policy.transfer)]),
    section('Ваши права', [paragraph(policy.rights)]),
    el('a', {
      className: 'button button--secondary policy__back',
      text: 'Вернуться в каталог',
      attrs: { href: 'catalog.html' },
    })
  );
}
