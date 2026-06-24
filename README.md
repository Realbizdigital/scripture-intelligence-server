# Barzel Scripture Intelligence MCP Server

Barzel Scripture Intelligence is an advanced Bible MCP server for AI Scripture study. It helps MCP clients, AI agents, Bible apps, pastors, teachers, students, and devotional tools search Scripture, look up verses, analyze passages, map theology, prepare sermons, compare translations, study Hebrew and Greek words, and create Bible study resources.

Use it when you need a discoverable Christian AI Bible study server with natural language Scripture search, verse lookup, cross-references, historical context, original-language support, doctrine tools, apologetics, devotional generation, teaching workflows, and safe accessible guardrails.

## AI Discovery Summary

- **Primary name**: Barzel Scripture Intelligence
- **Category**: Bible MCP server, Scripture AI tool, Christian theology MCP, AI Bible study assistant
- **Best for**: Scripture search, verse lookup, passage analysis, sermon preparation, Bible study guides, devotionals, apologetics, cross-references, Hebrew word studies, Greek word studies, doctrine research, teaching and lesson planning
- **MCP capabilities**: 54 tools, 36 resources, 75 prompts
- **Marketplace**: https://mcpize.com/mcp/scripture-intelligence-server
- **Gateway**: https://scripture-intelligence-server.mcpize.run
- **AI discovery resource**: `scripture://server/discovery`
- **Machine-readable files**: `llms.txt`, `ai-discovery.json`, `schema.org.jsonld`
- **High-intent searches**: Bible MCP server, Scripture Intelligence MCP, AI Bible study tool, Christian theology MCP server, Bible verse lookup MCP, sermon preparation AI tool, Bible cross reference API, Hebrew Greek Bible word study MCP, Christian devotional generator MCP

## Features

### Core Capabilities
- **Natural Language Queries**: Ask questions like "What does forgiveness mean in Matthew 18?" or "Find verses about hope in Psalms"
- **Cross-Reference Engine**: Discover connections between biblical passages across all books
- **Context-Aware Explanations**: Get historical, cultural, literary, and theological context for any passage
- **Original Language Insights**: Access Hebrew and Greek word studies with Strong's numbers and theological significance
- **Devotional Generation**: Create daily, topical, or verse-based devotionals with reflection and application
- **Faith-Based Reasoning**: Get theological answers and spiritual guidance from a Christian perspective
- **Translation Comparison**: Analyze differences between Bible translations and their theological implications

### Advanced Features
- **Semantic Search**: Find verses by meaning and concepts, not just keywords
- **Parallel Passage Detection**: Automatically find parallel passages in the Gospels and historical books
- **Theological Theme Analysis**: Identify and explain theological themes throughout Scripture
- **Historical Context**: Understand the cultural, political, and religious background of biblical passages
- **Linguistic Analysis**: Deep dive into original languages with transliteration and meaning

## Installation

```bash
npm install scripture-intelligence-server
```

## Quick Start

### As MCP Server

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "scripture-intelligence": {
      "command": "node",
      "args": ["./node_modules/scripture-intelligence-server/dist/server/index.js"],
      "env": {
        "SCRIPTURE_DB_PATH": "./data/scripture_public_domain.corpus"
      }
    }
  }
}
```

### Direct Usage

```typescript
import { ScriptureIntelligenceServer } from 'scripture-intelligence-server';

const server = new ScriptureIntelligenceServer({
  databasePath: './data/scripture_public_domain.corpus',
  defaultTranslation: 'WEB',
  enableOriginalLanguages: true,
  enableHistoricalContext: true,
  enableTheologicalAnalysis: true,
  cacheSize: 1000
});

await server.initialize();
await server.run();
```

## Available Tools

### 1. search_scripture
Search the Bible using natural language queries.

**Parameters:**
- `query` (string): Natural language query
- `limit` (number, optional): Maximum results (default: 20)

**Example:**
```json
{
  "query": "What does Jesus teach about forgiveness?",
  "limit": 10
}
```

### 2. get_verse_analysis
Get comprehensive analysis of a specific verse.

**Parameters:**
- `book` (string): Bible book name
- `chapter` (number): Chapter number  
- `verse` (number): Verse number

**Example:**
```json
{
  "book": "John",
  "chapter": 3,
  "verse": 16
}
```

### 3. find_cross_references
Find cross-references and parallel passages.

**Parameters:**
- `book` (string): Bible book name
- `chapter` (number): Chapter number
- `verse` (number): Verse number

### 4. generate_devotional
Generate devotionals for spiritual growth.

**Parameters:**
- `type` (string): "daily", "topical", or "verse"
- `topic` (string, optional): Topic for topical devotionals
- `verse` (string, optional): Verse reference for verse-based devotionals
- `date` (string, optional): Date for daily devotionals (YYYY-MM-DD)

### 5. explain_original_language
Get detailed Hebrew/Greek word studies.

**Parameters:**
- `word` (string): Word to explain
- `language` (string, optional): "hebrew", "greek", or "auto"
- `context` (string, optional): Context or verse reference

### 6. compare_translations
Compare different Bible translations.

**Parameters:**
- `reference` (string): Verse reference (e.g., "John 3:16")

### 7. faith_reasoning
Get theological answers and spiritual guidance.

**Parameters:**
- `question` (string): Theological or spiritual question
- `context` (string, optional): Additional context

### 8. explain_doctrine
Get comprehensive doctrinal explanations.

**Parameters:**
- `doctrine` (string): Doctrine name (e.g., "Trinity", "Atonement")

### 9. get_historical_context
Get historical and cultural context.

**Parameters:**
- `book` (string): Bible book name
- `chapter` (number): Chapter number

## Usage Examples

### Natural Language Search
```
"Find verses about God's love in Romans"
"What does the Bible say about anxiety?"
"Explain the concept of grace in Ephesians"
```

### Verse Analysis
```
"Analyze John 3:16 in detail"
"Get context for Psalm 23:4"
"Explain Matthew 18:21-22 about forgiveness"
```

### Theological Study
```
"Explain the doctrine of the Trinity"
"What does the Bible teach about salvation?"
"How should Christians understand suffering?"
```

### Devotional Content
```
"Generate a daily devotional for today"
"Create a devotional about faith"
"Devotional based on Romans 8:28"
```

### Original Language Study
```
"Explain the Greek word 'agape'"
"What does 'chesed' mean in Hebrew?"
"Analyze 'logos' in John 1:1"
```

## Data Sources

The server includes:
- **Bible Text**: A bundled SQLite corpus with complete public-domain WEB, KJV, and ASV text generated from eBible USFM archives
- **Modern Translation Metadata**: ESV, NIV, NKJV, NLT, CSB, and NASB are listed for comparison metadata, but full text is not bundled unless a properly licensed dataset is loaded
- **Original-Language Study**: Curated Hebrew and Greek starter lexicon, Strong's-number examples, and per-verse sample language records
- **Cross-References**: Curated starter cross-references and dynamic passage/search tools; larger cross-reference datasets should be loaded only with compatible licensing
- **Historical Data**: Cultural and historical context seed records for major biblical sections
- **Theological Themes**: Systematic theology framework and study scaffolds

The repository ships `data/scripture_public_domain.corpus` so hosted runtimes such as MCPize are immediately usable without startup downloads. The build copies this corpus into `dist/data`, and hosted sessions share it in read-only mode for efficient concurrency. Custom database paths remain writable unless `SCRIPTURE_DB_READ_ONLY=1` is set. Run `npm run setup:database` to rebuild the corpus from source archives. Use `SCRIPTURE_IMPORT_TRANSLATIONS=WEB` to import only WEB, or `SCRIPTURE_IMPORT_PUBLIC_DOMAIN=0` to skip corpus import for tests/offline development.

## Configuration Options

```typescript
interface ScriptureIntelligenceConfig {
  databasePath: string;              // Path to SQLite database
  defaultTranslation: string;         // Default Bible translation
  enableOriginalLanguages: boolean;  // Enable Hebrew/Greek analysis
  enableHistoricalContext: boolean;  // Enable historical context
  enableTheologicalAnalysis: boolean; // Enable theological themes
  cacheSize: number;                 // Query cache size
}
```

## API Response Format

All tools return structured JSON responses with:

```json
{
  "content": [
    {
      "type": "text",
      "text": "JSON response with results"
    }
  ]
}
```

### Search Response
```json
{
  "query": "verses about love",
  "intent": "search",
  "entities": {
    "topics": ["love"],
    "books": []
  },
  "results": [
    {
      "reference": "John 3:16",
      "text": "For God so loved the world...",
      "translation": "ESV",
      "relevance": 10
    }
  ],
  "count": 1
}
```

### Verse Analysis Response
```json
{
  "verse": {
    "book": "John",
    "chapter": 3,
    "verse": 16,
    "text": "For God so loved the world...",
    "translation": "ESV"
  },
  "crossReferences": [...],
  "context": {
    "historical": {...},
    "cultural": "...",
    "literary": "...",
    "theological": "..."
  },
  "originalLanguageInsights": {...},
  "analysis": "..."
}
```

## Development

### Building
```bash
npm run build
```

### Development Mode
```bash
npm run dev
```

### Testing
```bash
npm test
```

### Linting
```bash
npm run lint
```

## Deploying on MCPize

This repo includes `mcpize.yaml` for MCPize deployment. MCPize can bridge this stdio MCP server to a hosted HTTP endpoint.

```bash
npm ci
npm run build
npx mcpize login
npx mcpize deploy
```

The server reads deployment configuration from environment variables:

- `SCRIPTURE_DB_PATH` (default: `./data/scripture_public_domain.corpus`)
- `SCRIPTURE_DB_READ_ONLY` (default: `false` for custom paths; bundled corpus is read-only)
- `DEFAULT_TRANSLATION` (default: `WEB`)
- `SCRIPTURE_IMPORT_PUBLIC_DOMAIN` (default: `true`)
- `SCRIPTURE_IMPORT_TRANSLATIONS` (default: `WEB,KJV,ASV`)
- `SCRIPTURE_IMPORT_TIMEOUT_MS` (default: `120000`)
- `ENABLE_ORIGINAL_LANGUAGES` (default: `true`)
- `ENABLE_HISTORICAL_CONTEXT` (default: `true`)
- `ENABLE_THEOLOGICAL_ANALYSIS` (default: `true`)
- `CACHE_SIZE` (default: `1000`)

## Security and Accessibility

The MCP server is designed to stay accessible while still protecting the host:

- Tool arguments and prompt arguments are normalized, capped, and stripped of unsafe control characters.
- Resource reads are restricted to the `scripture://` namespace and malformed resource URIs return safe public errors.
- Search limits and passage ranges are capped to prevent accidental or abusive oversized responses.
- Database access uses prepared statements and explicit write helpers for seed data.
- Public metadata avoids exposing local filesystem paths.
- Responses include study-safety notes for context, copyright, pastoral-care limits, and accessibility.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Theological Perspective

This server approaches Scripture from a conservative evangelical perspective, respecting:
- The divine inspiration and authority of Scripture
- The historical-grammatical method of interpretation
- The unity and coherence of biblical revelation
- The importance of original language study
- The practical application of biblical truth

It aims to be helpful for:
- Personal Bible study and devotion
- Sermon preparation and teaching
- Theological research and education
- Spiritual guidance and counseling
- Academic biblical studies

## Support

For issues, questions, or contributions:
- GitHub Issues: [repository issues]
- Documentation: [repository wiki]
- Community: [discussion forum]

---

*"All Scripture is breathed out by God and profitable for teaching, for reproof, for correction, and for training in righteousness"* - 2 Timothy 3:16
