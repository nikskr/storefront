import { advantagesContent } from '../data/content.ts';
import { el } from '../lib/dom.ts';

type AdvantagesContent = typeof advantagesContent;

export function renderAdvantages(
  root: HTMLElement,
  content: AdvantagesContent = advantagesContent
) {
  root.replaceChildren(
    el('div', { className: 'container' }, [
      el('h2', {
        className: 'section__title',
        text: content.title,
        attrs: { id: 'advantages-title' },
      }),
      el(
        'ul',
        { className: 'advantages__list' },
        content.items.map((item) =>
          el('li', { className: 'advantages__item' }, [
            el('h3', { className: 'advantages__title', text: item.title }),
            el('p', { className: 'advantages__text', text: item.text }),
          ])
        )
      ),
    ])
  );
}
