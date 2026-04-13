# Scripture Intelligence Server

An advanced MCP (Model Context Protocol) server that makes the Bible deeply searchable, explainable, and applicable with natural language queries, cross-references, and faith-based reasoning.

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
      "args": ["./node_modules/scripture-intelligence-server/dist/index.js"],
      "env": {
        "SCRIPTURE_DB_PATH": "./scripture_intelligence.db"
      }
    }
  }
}
```

### Direct Usage

```typescript
import { ScriptureIntelligenceServer } from 'scripture-intelligence-server';

const server = new ScriptureIntelligenceServer({
  databasePath: './scripture_intelligence.db',
  defaultTranslation: 'ESV',
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
- **Bible Text**: Multiple translations (ESV, NIV, KJV)
- **Strong's Concordance**: Hebrew and Greek lexicon data
- **Cross-References**: Comprehensive cross-reference database
- **Historical Data**: Cultural and historical context information
- **Theological Themes**: Systematic theology framework

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
