import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(projectRoot, 'data/scripture_public_domain.corpus');
const destination = resolve(projectRoot, 'dist/data/scripture_public_domain.corpus');
const minimumCorpusBytes = 10_000_000;

if (!existsSync(source) || statSync(source).size < minimumCorpusBytes) {
  throw new Error(
    'The bundled public-domain Scripture corpus is missing or incomplete. Run npm run setup:database before building.'
  );
}

mkdirSync(dirname(destination), { recursive: true });
copyFileSync(source, destination);
