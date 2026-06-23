const assert = require('node:assert/strict');
const { before, describe, test } = require('node:test');

describe('BibleDatabase', () => {
  let BibleDatabase;
  let parseUsfmArchive;
  let zipSync;
  let strToU8;

  before(async () => {
    ({ BibleDatabase } = await import('../dist/database/bible-data.js'));
    ({ parseUsfmArchive } = await import('../dist/database/public-domain-importer.js'));
    ({ zipSync, strToU8 } = await import('fflate'));
  });

  test('stores and retrieves verses using prepared database helpers', async () => {
    const db = new BibleDatabase(':memory:');
    await db.initialize();

    await db.addVerse({
      book: 'John',
      chapter: 3,
      verse: 16,
      text: 'For God so loved the world.',
      translation: 'ESV',
      originalHebrew: null,
      originalGreek: null,
      strongNumbers: ['G25'],
    });

    const verse = await db.getVerse('John', 3, 16);
    assert.deepEqual(verse, {
      book: 'John',
      chapter: 3,
      verse: 16,
      text: 'For God so loved the world.',
      translation: 'ESV',
      originalHebrew: null,
      originalGreek: null,
      strongNumbers: ['G25'],
    });

    db.close();
  });

  test('caps search and passage results to prevent oversized responses', async () => {
    const db = new BibleDatabase(':memory:');
    await db.initialize();

    for (let verse = 1; verse <= 250; verse += 1) {
      await db.addVerse({
        book: 'Psalm',
        chapter: 119,
        verse,
        text: `Your word gives light ${verse}`,
        translation: 'ESV',
      });
    }

    const searchResults = await db.searchVerses('word', undefined, 999);
    const passageResults = await db.getPassage('Psalm', 119, 1, 999);

    assert.equal(searchResults.length, 50);
    assert.equal(passageResults.length, 200);
    assert.equal(passageResults[0].verse, 1);
    assert.equal(passageResults[199].verse, 200);

    db.close();
  });

  test('seeds bundled scripture data when the runtime database is empty', async () => {
    const db = new BibleDatabase(':memory:');
    await db.initialize();

    const seedResult = await db.seedSampleData();
    const verse = await db.getVerse('John', 3, 16);
    const loveResults = await db.searchVerses('love', undefined, 5);

    assert.deepEqual(seedResult, { seeded: true, verses: 17 });
    assert.match(verse?.text || '', /For God so loved the world/);
    assert.ok(loveResults.length > 0);

    db.close();
  });

  test('prefers requested translations and respects strict translation lookups', async () => {
    const db = new BibleDatabase(':memory:', 'WEB');
    await db.initialize();

    await db.addVersesBulk([
      {
        book: 'John',
        chapter: 3,
        verse: 16,
        text: 'For God so loved the world, that he gave his only begotten Son.',
        translation: 'KJV',
      },
      {
        book: 'John',
        chapter: 3,
        verse: 16,
        text: 'For God so loved the world, that he gave his one and only Son.',
        translation: 'WEB',
      },
      {
        book: 'Psalms',
        chapter: 23,
        verse: 1,
        text: 'Yahweh is my shepherd: I shall lack nothing.',
        translation: 'WEB',
      },
    ]);

    const defaultVerse = await db.getVerse('John', 3, 16);
    const kjvVerse = await db.getVerse('John', 3, 16, 'KJV', { fallback: false });
    const missingNiv = await db.getVerse('John', 3, 16, 'NIV', { fallback: false });
    const psalmAlias = await db.getVerse('Psalm', 23, 1, 'WEB', { fallback: false });

    assert.equal(defaultVerse?.translation, 'WEB');
    assert.equal(kjvVerse?.translation, 'KJV');
    assert.equal(missingNiv, null);
    assert.equal(psalmAlias?.book, 'Psalms');

    db.close();
  });

  test('parses canonical USFM archives into Bible verses', () => {
    const archive = zipSync({
      '01-GEN.usfm': strToU8([
        '\\id GEN World English Bible',
        '\\c 1',
        '\\v 1 \\+w In|strong="H7225"\\+w* the beginning God created the heavens and the earth.',
        '\\v 2 Now the earth was formless and empty.',
      ].join('\n')),
      'metadata.txt': strToU8('not scripture'),
    });

    const verses = parseUsfmArchive(archive, 'WEB');

    assert.equal(verses.length, 2);
    assert.deepEqual(verses[0], {
      book: 'Genesis',
      chapter: 1,
      verse: 1,
      text: 'In the beginning God created the heavens and the earth.',
      translation: 'WEB',
    });
  });
});
