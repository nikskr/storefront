// Build step: copies HTML, CSS, images and fonts from src/ into dist/.
// JS in dist/ is produced by tsc. See scripts/static.mjs.
import { copyAllStatic } from './static.mjs';

await copyAllStatic();
