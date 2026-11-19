// Development mode: builds the site once, then keeps dist/ in sync with src/
// and serves the site together with Netlify Functions.
//   - tsc --watch       recompiles TypeScript into dist/
//   - fs.watch on src/  copies changed HTML/CSS/images into dist/
//   - netlify dev       serves dist/ and functions on http://localhost:8888
import { spawn } from 'node:child_process';
import { existsSync, watch } from 'node:fs';
import { join } from 'node:path';
import {
  SITE_DATA,
  SRC,
  copyAllStatic,
  copyStaticFile,
  isTs,
  loadSite,
  removeStaticFile,
} from './static.mjs';

const bin = {
  tsc: join('node_modules', 'typescript', 'bin', 'tsc'),
  netlify: join('node_modules', 'netlify-cli', 'bin', 'run.js'),
};

const children = [];

function run(name, script, args) {
  const child = spawn(process.execPath, [script, ...args], {
    stdio: 'inherit',
  });
  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`[dev] ${name} exited with code ${code}`);
      shutdown(code);
    }
  });
  children.push(child);
}

function shutdown(code = 0) {
  for (const child of children) child.kill();
  process.exit(code);
}

process.on('SIGINT', () => shutdown());
process.on('SIGTERM', () => shutdown());

// 1. Fresh static copy (tsc --watch below does the initial TS compile).
await copyAllStatic();
let site = await loadSite();
console.warn('[dev] static files copied, watching src/');

// 2. Keep static files in sync. Events are debounced per file because
// editors often emit several events for a single save.
const pending = new Map();

watch(SRC, { recursive: true }, (_event, filename) => {
  if (!filename) return;
  const relPath = filename.toString();

  clearTimeout(pending.get(relPath));
  pending.set(
    relPath,
    setTimeout(() => {
      pending.delete(relPath);
      sync(relPath).catch((error) => console.error('[dev]', error.message));
    }, 50)
  );
});

async function sync(relPath) {
  // Site data feeds {{site.*}} tokens: re-render every HTML file.
  if (join(SRC, relPath) === SITE_DATA) {
    site = await loadSite();
    await copyAllStatic();
    console.warn('[dev] site data changed, HTML re-rendered');
    return;
  }

  if (isTs(relPath)) return;

  if (existsSync(join(SRC, relPath))) {
    copyStaticFile(relPath, site);
    console.warn(`[dev] copied ${relPath}`);
  } else {
    removeStaticFile(relPath);
    console.warn(`[dev] removed ${relPath}`);
  }
}

// 3. TypeScript compiler and Netlify dev server.
run('tsc', bin.tsc, ['--watch', '--preserveWatchOutput']);
run('netlify dev', bin.netlify, ['dev']);
