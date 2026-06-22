const assert = require('node:assert/strict');
const { before, describe, test } = require('node:test');

describe('BibleDatabase', () => {
  let BibleDatabase;

  before(async () => {
    ({ BibleDatabase } = await import('../dist/database/bible-data.js'));
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
});
