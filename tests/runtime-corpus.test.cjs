const assert = require('node:assert/strict');
const { test } = require('node:test');

test('the packaged runtime boots with complete WEB, KJV, and ASV corpora', async () => {
  const previousDatabasePath = process.env.SCRIPTURE_DB_PATH;
  delete process.env.SCRIPTURE_DB_PATH;

  const [{ createConfigFromEnv }, { BibleDatabase }] = await Promise.all([
    import('../dist/server/index.js'),
    import('../dist/database/bible-data.js'),
  ]);

  const config = createConfigFromEnv();
  const db = new BibleDatabase(
    config.databasePath,
    config.defaultTranslation,
    config.databaseReadOnly
  );

  try {
    assert.equal(config.databaseReadOnly, true);
    await db.initialize();

    for (const translation of ['WEB', 'KJV', 'ASV']) {
      const verseCount = await db.countVersesForTranslation(translation);
      assert.ok(verseCount > 30_000, `${translation} corpus is incomplete: ${verseCount} verses`);
    }

    const john316 = await db.getVerse('John', 3, 16, 'KJV', { fallback: false });
    assert.equal(john316?.translation, 'KJV');
    assert.match(john316?.text || '', /God so loved the world/i);
  } finally {
    db.close();

    if (previousDatabasePath === undefined) {
      delete process.env.SCRIPTURE_DB_PATH;
    } else {
      process.env.SCRIPTURE_DB_PATH = previousDatabasePath;
    }
  }
});

test('the packaged corpus supports concurrent read-only sessions', async () => {
  const previousDatabasePath = process.env.SCRIPTURE_DB_PATH;
  delete process.env.SCRIPTURE_DB_PATH;

  const [{ createConfigFromEnv }, { BibleDatabase }] = await Promise.all([
    import('../dist/server/index.js'),
    import('../dist/database/bible-data.js'),
  ]);
  const config = createConfigFromEnv();
  const databases = Array.from(
    { length: 8 },
    () => new BibleDatabase(config.databasePath, config.defaultTranslation, config.databaseReadOnly)
  );

  try {
    const verses = await Promise.all(
      databases.map(async (db) => {
        await db.initialize();
        return db.getVerse('John', 3, 16, 'WEB', { fallback: false });
      })
    );

    assert.ok(verses.every((verse) => verse?.translation === 'WEB'));
  } finally {
    databases.forEach((db) => db.close());

    if (previousDatabasePath === undefined) {
      delete process.env.SCRIPTURE_DB_PATH;
    } else {
      process.env.SCRIPTURE_DB_PATH = previousDatabasePath;
    }
  }
});
