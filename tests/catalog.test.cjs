const assert = require('node:assert/strict');
const { before, describe, test } = require('node:test');

describe('MCP catalog resources and prompts', () => {
  let catalog;

  before(async () => {
    catalog = await import('../dist/server/catalog.js');
  });

  test('renders server info with security metadata', () => {
    const payload = catalog.buildResourcePayload('scripture://server/info', {
      toolNames: ['search_scripture'],
      promptNames: ['analyze_verse'],
      config: { databaseConfigured: true },
      version: '1.0.0',
    });

    const body = JSON.parse(payload.text);
    assert.equal(body.security.inputValidation, 'enabled');
    assert.equal(body.security.publicErrors, 'enabled');
    assert.equal(body.security.responseSizeCaps, 'enabled');
    assert.equal(
      body.safety.accessibility,
      'Inputs are gently normalized and capped for reliability without blocking ordinary Bible-study use.'
    );
  });

  test('sanitizes prompt arguments while preserving accessible study context', () => {
    const prompt = catalog.renderPrompt('analyze_verse', {
      reference: '  John 3:16\u0000  ',
      topic: 'Gods love',
    });

    assert.match(prompt.template, /reference: John 3:16/);
    assert.match(prompt.template, /topic: Gods love/);
    assert.match(prompt.template, /Use Scripture in context/);
    assert.doesNotMatch(prompt.template, /\u0000/);
  });

  test('publishes machine-readable AI discovery metadata through MCP resources', () => {
    const payload = catalog.buildResourcePayload('scripture://server/discovery', {
      toolNames: ['search_scripture', 'verse_lookup'],
      promptNames: ['analyze_verse'],
      config: { databaseConfigured: true },
      version: '1.0.0',
    });

    const body = JSON.parse(payload.text);
    assert.equal(body.canonicalName, 'Barzel Scripture Intelligence');
    assert.ok(body.highIntentQueries.includes('Bible MCP server'));
    assert.ok(body.entityAliases.includes('Bible MCP Server'));
    assert.equal(body.groundedFacts.verseCounts.KJV, 31102);
    assert.equal(body.queryClusters.bibleSearch.includes('KJV Bible MCP'), true);
    assert.equal(body.exampleToolRouting[1].tool, 'verse_lookup');
    assert.ok(body.topTools.includes('search_scripture'));
    assert.equal(body.schemaOrg['@type'], 'SoftwareApplication');
    assert.equal(body.schemaOrg.name, 'Barzel Scripture Intelligence');
    assert.equal(body.schemaOrg.codeRepository, 'https://github.com/Realbizdigital/scripture-intelligence-server');
    assert.equal(body.schemaOrg.softwareVersion, '1.0.0');
  });
});
