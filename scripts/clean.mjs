// Removes the previous build so deleted files do not linger in dist/.
import { rmSync } from 'node:fs';

rmSync('dist', { recursive: true, force: true });
