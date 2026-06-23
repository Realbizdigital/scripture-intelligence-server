import { BibleDatabase } from '../dist/database/bible-data.js';
import { importPublicDomainTranslations, PUBLIC_DOMAIN_TRANSLATIONS } from '../dist/database/public-domain-importer.js';

const dbPath = process.env.SCRIPTURE_DB_PATH || './scripture_intelligence.db';
const defaultTranslation = (process.env.DEFAULT_TRANSLATION || 'WEB').toUpperCase();
const quiet = process.argv.includes('--quiet') || process.env.SCRIPTURE_SEED_QUIET === '1';

const log = (...args) => {
  if (!quiet) {
    console.log(...args);
  }
};

function readBooleanEnv(name, fallback) {
  const value = process.env[name];
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function parseTranslationList(value) {
  const allowed = new Set(PUBLIC_DOMAIN_TRANSLATIONS.map((source) => source.id));
  return String(value || 'WEB,KJV,ASV')
    .split(',')
    .map((translation) => translation.trim().toUpperCase())
    .filter((translation) => allowed.has(translation));
}

async function setupDatabase() {
  log(`Setting up Scripture Intelligence database at ${dbPath}...`);

  const db = new BibleDatabase(dbPath, defaultTranslation);

  try {
    await db.initialize();

    const forceSeed = readBooleanEnv('FORCE_SCRIPTURE_SEED', false);
    const seedResult = await db.seedSampleData({ force: forceSeed });
    if (seedResult.seeded) {
      log(`Loaded ${seedResult.verses} public-domain starter verses through the shared database seeder.`);
    } else {
      log('Database already contains starter data. Set FORCE_SCRIPTURE_SEED=1 to refresh starter content.');
    }

    if (readBooleanEnv('SCRIPTURE_IMPORT_PUBLIC_DOMAIN', true)) {
      const translations = parseTranslationList(process.env.SCRIPTURE_IMPORT_TRANSLATIONS);
      const forceImport = readBooleanEnv('FORCE_SCRIPTURE_IMPORT', false);
      const timeoutMs = Number.parseInt(process.env.SCRIPTURE_IMPORT_TIMEOUT_MS || '120000', 10);

      if (translations.length === 0) {
        throw new Error('SCRIPTURE_IMPORT_TRANSLATIONS did not contain any supported public-domain translations.');
      }

      const results = await importPublicDomainTranslations(db, {
        translations,
        force: forceImport,
        timeoutMs: Number.isNaN(timeoutMs) ? 120000 : timeoutMs,
        log,
      });
      const summary = results.map((result) => `${result.translation}:${result.verses}`).join(', ');
      log(`Public-domain import status: ${summary}`);
    } else {
      log('Skipped public-domain Bible import because SCRIPTURE_IMPORT_PUBLIC_DOMAIN is disabled.');
    }
  } finally {
    db.close();
  }
}

setupDatabase().catch((error) => {
  console.error('Error setting up database:', error);
  process.exitCode = 1;
});
