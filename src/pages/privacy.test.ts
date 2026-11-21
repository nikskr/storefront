import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { operator, privacyPolicy } from '../data/content.ts';

// Smoke test: the real privacy.html markup + the page script work together.
beforeAll(async () => {
  localStorage.clear();
  // Node path helpers: in jsdom `URL` is jsdom's class, not Node's.
  const here = dirname(fileURLToPath(import.meta.url));
  const html = readFileSync(join(here, '..', 'privacy.html'), 'utf8');
  document.body.innerHTML =
    /<body[^>]*>([\s\S]*)<\/body>/.exec(html)?.[1] ?? '';
  await import('./privacy.ts');
});

describe('privacy page', () => {
  it('renders the policy title and operator', () => {
    expect(document.querySelector('#policy-title')?.textContent).toBe(
      privacyPolicy.title
    );
    expect(document.body.textContent).toContain(operator.fullName);
    expect(document.querySelectorAll('.policy__section')).toHaveLength(
      privacyPolicy.sections.length
    );
  });

  it('renders the footer', () => {
    expect(document.querySelectorAll('.footer__phone').length).toBeGreaterThan(
      0
    );
  });
});
