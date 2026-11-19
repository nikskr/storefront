// Copies everything from src/ except TypeScript into dist/:
// HTML, CSS, images, fonts. JS in dist/ is produced by tsc.
import { cpSync, existsSync } from 'node:fs';

if (existsSync('src')) {
  cpSync('src', 'dist', {
    recursive: true,
    filter: (source) => !source.endsWith('.ts'),
  });
}
