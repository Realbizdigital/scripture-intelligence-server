const assert = require('node:assert/strict');
const { before, describe, test } = require('node:test');

describe('security input guard', () => {
  let guard;

  before(async () => {
    guard = await import('../dist/security/input-guard.js');
  });

  test('sanitizes tool arguments without blocking normal study text', () => {
    const args = guard.sanitizeToolArgs({
      query: '  John 3:16\u0000 in context  ',
      topic: 'grace and faith',
      'bad key!': 'removed',
      nested: {
        reference: 'Romans 8:28',
      },
    });

    assert.deepEqual(args, {
      query: 'John 3:16  in context',
      topic: 'grace and faith',
      nested: {
        reference: 'Romans 8:28',
      },
    });
  });

  test('rejects malformed argument shapes and unsafe resource URIs', () => {
    assert.throws(() => guard.sanitizeToolArgs('not an object'), /Tool arguments must be a JSON object/);
    assert.throws(() => guard.sanitizeResourceUri('https://example.com'), /Only scripture:\/\/ resources are supported/);
    assert.throws(() => guard.sanitizeResourceUri('scripture://../secrets'), /unsafe path tokens/);
  });

  test('clamps expensive result limits and passage ranges', () => {
    assert.equal(guard.clampPositiveInteger(999, 10), 50);
    assert.equal(guard.clampPositiveInteger('0', 10), 1);
    assert.deepEqual(guard.clampVerseRange(1, 999), { startVerse: 1, endVerse: 200 });
  });

  test('public errors do not expose internal exception messages', () => {
    assert.deepEqual(guard.publicErrorPayload(new Error('database path C:/secret.db')).error, {
      code: 'REQUEST_FAILED',
      message: 'The request could not be completed safely. Check the input and try again.',
      recoverable: true,
    });
  });
});
