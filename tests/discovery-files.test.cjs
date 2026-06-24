const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { describe, test } = require('node:test');

const root = join(__dirname, '..');
const readText = (name) => readFileSync(join(root, name), 'utf8');
const readJson = (name) => JSON.parse(readText(name));

describe('search and AI discovery metadata', () => {
  test('keeps canonical identity, version, URLs, and capability counts consistent', () => {
    const packageJson = readJson('package.json');
    const mcp = readJson('mcp.json');
    const discovery = readJson('ai-discovery.json');
    const serverCard = readJson('mcp-server-card.json');

    assert.equal(packageJson.version, '1.1.3');
    assert.equal(mcp.version, packageJson.version);
    assert.equal(discovery.metadataVersion, packageJson.version);
    assert.equal(discovery.canonicalName, 'Barzel Scripture Intelligence');
    assert.equal(serverCard.name, discovery.canonicalName);
    assert.equal(discovery.canonicalUrls.marketplace, packageJson.homepage);
    assert.deepEqual(discovery.mcpSurface, {
      tools: 54,
      resources: 36,
      prompts: 75,
      discoveryResource: 'scripture://server/discovery',
    });
  });

  test('publishes valid search snippets and rich structured data without inflated claims', () => {
    const mcp = readJson('mcp.json');
    const schema = readJson('schema.org.jsonld');
    const graphTypes = schema['@graph'].map((entry) => entry['@type']);

    assert.ok(mcp.seo.title.length >= 30 && mcp.seo.title.length <= 60);
    assert.ok(mcp.seo.summary.length >= 120 && mcp.seo.summary.length <= 160);
    assert.ok(graphTypes.includes('SoftwareApplication'));
    assert.ok(graphTypes.includes('Dataset'));
    assert.ok(graphTypes.includes('FAQPage'));
    assert.equal(schema['@graph'][0].softwareVersion, '1.1.3');
    assert.equal(schema['@graph'][0].isAccessibleForFree, true);
  });

  test('provides crawler and agent routing files with no internal work narration', () => {
    const files = [
      'README.md',
      'FAQ.md',
      'llms.txt',
      'llms-full.txt',
      'ai-discovery.json',
      'mcp-server-card.json',
      'schema.org.jsonld',
    ];
    const combined = files.map(readText).join('\n');

    assert.match(combined, /https:\/\/mcpize\.com\/mcp\/scripture-intelligence-server/);
    assert.match(combined, /scripture:\/\/server\/discovery/);
    assert.match(combined, /verse_lookup/);
    assert.match(combined, /sermon_outline_generator/);
    assert.doesNotMatch(combined, /I'll search the workspace/i);
    assert.doesNotMatch(combined, /1000000+ times/i);
  });
});
