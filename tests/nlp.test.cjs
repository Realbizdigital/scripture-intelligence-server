const assert = require('node:assert/strict');
const { before, describe, test } = require('node:test');

describe('QueryProcessor', () => {
  let QueryProcessor;

  before(async () => {
    ({ QueryProcessor } = await import('../dist/nlp/query-processor.js'));
  });

  test('constructs the natural tokenizer at runtime and extracts scripture intent', () => {
    const processor = new QueryProcessor();
    const query = processor.processQuery('Find John 3:16 about love');

    assert.equal(query.intent, 'search');
    assert.ok(query.entities.books.includes('john'));
    assert.ok(query.entities.chapters.includes(3));
    assert.ok(query.entities.verses.includes(16));
    assert.ok(query.entities.topics.includes('love'));
  });
});
