import { privacyPolicy } from '../data/content.ts';
import { el } from '../lib/dom.ts';
import type { PolicyBlock, PolicyInline, PolicySection } from '../types.ts';

interface PrivacyPolicy {
  title: string;
  sections: readonly PolicySection[];
}

const renderInline = (part: PolicyInline): Node | string =>
  typeof part === 'string'
    ? part
    : el('a', { text: part.email, attrs: { href: `mailto:${part.email}` } });

function renderBlock(block: PolicyBlock): HTMLElement {
  if (block.type === 'list') {
    return el(
      'ul',
      { className: 'policy__list' },
      block.items.map((item) => el('li', { text: item }))
    );
  }
  return el('p', { className: 'policy__text' }, block.parts.map(renderInline));
}

/**
 * Privacy policy page body built from src/data/content.ts.
 * Sections are numbered because the text refers to "п. 1" and "6.1".
 */
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
    ...policy.sections.map((section, i) =>
      el('section', { className: 'policy__section' }, [
        el('h2', {
          className: 'policy__subtitle',
          text: `${i + 1}. ${section.title}`,
        }),
        ...section.blocks.map(renderBlock),
      ])
    ),
    el('a', {
      className: 'button button--secondary policy__back',
      text: 'Вернуться в каталог',
      attrs: { href: 'catalog.html' },
    })
  );
}
