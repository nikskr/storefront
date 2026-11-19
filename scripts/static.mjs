// Static assets pipeline shared by `npm run build` and `npm run dev`.
// Copies everything from src/ except TypeScript into dist/.
// In HTML files replaces {{site.key}} tokens with values from src/data/site.ts,
// so page titles and meta tags come from one place.
import {
  cpSync,
  existsSync,
  globSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const SRC = 'src';
export const DIST = 'dist';
export const SITE_DATA = join(SRC, 'data', 'site.ts');

/** Files compiled by tsc instead of being copied. */
export const isTs = (path) => path.endsWith('.ts');

/** Loads site data; the query string bypasses the ESM cache in watch mode. */
export async function loadSite() {
  const url = pathToFileURL(SITE_DATA);
  url.searchParams.set('t', String(Date.now()));
  const { site } = await import(url.href);
  return site;
}

/** Replaces {{site.key}} tokens. Unknown keys fail the build loudly. */
export function renderHtml(html, site, file = 'HTML') {
  return html.replace(/\{\{\s*site\.(\w+)\s*\}\}/g, (token, key) => {
    if (!(key in site)) {
      throw new Error(`${file}: unknown token ${token}`);
    }
    return escapeHtml(String(site[key]));
  });
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

/** Copies (or renders) one file, given its path relative to src/. */
export function copyStaticFile(relPath, site) {
  const from = join(SRC, relPath);
  const to = join(DIST, relPath);
  mkdirSync(dirname(to), { recursive: true });

  if (statSync(from).isDirectory()) {
    // A folder was added or moved in: copy its contents file by file.
    for (const file of globSync('**/*', { cwd: from, withFileTypes: false })) {
      const child = join(relPath, file);
      if (!isTs(child) && statSync(join(SRC, child)).isFile()) {
        copyStaticFile(child, site);
      }
    }
  } else if (relPath.endsWith('.html')) {
    writeFileSync(to, renderHtml(readFileSync(from, 'utf8'), site, relPath));
  } else {
    cpSync(from, to);
  }
}

/** Removes one file from dist/, given its path relative to src/. */
export function removeStaticFile(relPath) {
  rmSync(join(DIST, relPath), { recursive: true, force: true });
}

/** Copies all static files from src/ to dist/. */
export async function copyAllStatic() {
  if (!existsSync(SRC)) return;
  const site = await loadSite();

  cpSync(SRC, DIST, {
    recursive: true,
    filter: (source) => !isTs(source),
  });

  // Re-render HTML on top of the plain copies.
  for (const file of globSync('**/*.html', { cwd: SRC })) {
    copyStaticFile(file, site);
  }
}
