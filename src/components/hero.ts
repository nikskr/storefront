import { hero } from '../data/content.ts';
import { el } from '../lib/dom.ts';

type HeroContent = typeof hero;

export function renderHero(root: HTMLElement, content: HeroContent = hero) {
  root.replaceChildren(
    el('div', { className: 'container hero__inner' }, [
      el('h1', {
        className: 'hero__title',
        text: content.title,
        attrs: { id: 'hero-title' },
      }),
      el('p', { className: 'hero__text', text: content.text }),
      el('a', {
        className: 'button button--primary hero__button',
        text: content.buttonLabel,
        attrs: { href: content.buttonHref },
      }),
    ])
  );
}
