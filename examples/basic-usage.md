# Scripture Intelligence Server - Basic Usage Examples

This guide demonstrates how to use the Scripture Intelligence Server for various Bible study tasks.

## Setup

First, ensure the server is running and the database is initialized:

```bash
# Install dependencies
npm install

# Set up the database with sample data
npm run setup:db

# Start the server
npm start
```

## Example 1: Natural Language Search

### Search for verses about love

```json
{
  "tool": "search_scripture",
  "arguments": {
    "query": "What does the Bible say about love?",
    "limit": 10
  }
}
```

**Expected Response:**
```json
{
  "query": "What does the Bible say about love?",
  "intent": "search",
  "entities": {
    "topics": ["love"],
    "books": [],
    "chapters": [],
    "verses": []
  },
  "results": [
    {
      "reference": "John 3:16",
      "text": "For God so loved the world...",
      "translation": "ESV",
      "relevance": 10
    },
    {
      "reference": "1 Corinthians 13:4",
      "text": "Love is patient and kind...",
      "translation": "ESV",
      "relevance": 9
    }
  ],
  "count": 2
}
```

### Search in specific book

```json
{
  "tool": "search_scripture",
  "arguments": {
    "query": "forgiveness in Matthew 18",
    "limit": 5
  }
}
```

## Example 2: Verse Analysis

### Get comprehensive analysis of John 3:16

```json
{
  "tool": "get_verse_analysis",
  "arguments": {
    "book": "John",
    "chapter": 3,
    "verse": 16
  }
}
```

**Expected Response:**
```json
{
  "verse": {
    "book": "John",
    "chapter": 3,
    "verse": 16,
    "text": "For God so loved the world, that he gave his only Son...",
    "translation": "ESV",
    "originalGreek": "Outos gar hégapesen ho theos ton kosmon...",
    "strongNumbers": ["G3739", "G25", "G2316"]
  },
  "crossReferences": [
    {
      "verse": {...},
      "references": [{"book": "Romans", "chapter": 5, "verse": 8, ...}],
      "relationship": "theological parallel - God's love demonstrated",
      "theologicalTheme": "love"
    }
  ],
  "context": {
    "historical": {...},
    "cultural": "Greco-Roman world with Jewish religious context...",
    "literary": "Gospel narrative emphasizing theological depth...",
    "theological": "Divine love as motivation for salvation..."
  },
  "originalLanguageInsights": {
    "greekInsights": [
      {
        "originalLanguage": "greek",
        "originalWord": "agapé",
        "transliteration": "agape",
        "strongNumber": "G26",
        "meaning": "unconditional, selfless love",
        "usage": "Highest form of love, characteristic of God",
        "relatedWords": ["phileo", "storge", "eros"]
      }
    ],
    "keyWords": ["love", "believe", "eternal life"],
    "wordStudies": [...]
  },
  "analysis": "This verse from John 3:16 speaks to the foundation of Christian salvation..."
}
```

## Example 3: Cross-References

### Find cross-references for Matthew 18:22

```json
{
  "tool": "find_cross_references",
  "arguments": {
    "book": "Matthew",
    "chapter": 18,
    "verse": 22
  }
}
```

**Expected Response:**
```json
{
  "verse": {
    "book": "Matthew",
    "chapter": 18,
    "verse": 22,
    "text": "Jesus said to him, 'I do not say to you seven times, but seventy-seven times.'",
    "translation": "ESV"
  },
  "crossReferences": [
    {
      "verse": {...},
      "references": [{"book": "Luke", "chapter": 17, "verse": 4, ...}],
      "relationship": "parallel teaching on forgiveness",
      "theologicalTheme": "forgiveness"
    }
  ],
  "parallelPassages": [
    {
      "verse": {...},
      "references": [{"book": "Luke", "chapter": 17, "verse": 4, ...}],
      "relationship": "gospel parallel"
    }
  ],
  "summary": "Found 1 cross-reference and 1 parallel passage..."
}
```

## Example 4: Devotional Generation

### Generate a daily devotional

```json
{
  "tool": "generate_devotional",
  "arguments": {
    "type": "daily",
    "date": "2024-01-15"
  }
}
```

### Generate a topical devotional

```json
{
  "tool": "generate_devotional",
  "arguments": {
    "type": "topical",
    "topic": "faith"
  }
}
```

**Expected Response:**
```json
{
  "id": "devotional-2024-01-15-abc123",
  "title": "Faith: Hebrews 11:1",
  "scripture": [
    {
      "book": "Hebrews",
      "chapter": 11,
      "verse": 1,
      "text": "Now faith is the assurance of things hoped for...",
      "translation": "ESV"
    }
  ],
  "reflection": "Today's passage from Hebrews 11:1 reveals profound truth about faith...",
  "prayer": "Heavenly Father, thank you for the truth revealed in Hebrews 11:1...",
  "application": "Today, look for opportunities to express faith in your interactions...",
  "date": "2024-01-15",
  "theme": "faith"
}
```

### Generate a verse-based devotional

```json
{
  "tool": "generate_devotional",
  "arguments": {
    "type": "verse",
    "verse": "Romans 8:28"
  }
}
```

## Example 5: Original Language Study

### Explain a Greek word

```json
{
  "tool": "explain_original_language",
  "arguments": {
    "word": "agape",
    "language": "greek"
  }
}
```

**Expected Response:**
```json
{
  "word": "agape",
  "transliteration": "agape",
  "strongNumber": "G26",
  "meaning": "unconditional, selfless love",
  "usage": "Highest form of love, characteristic of God and Christian ethics",
  "theologicalSignificance": "Defines God's essential nature and the supreme Christian virtue",
  "relatedWords": ["phileo", "storge", "eros"],
  "bibleUsage": [
    {
      "reference": "John 3:16",
      "context": "God so loved the world",
      "significance": "Demonstrates divine love as motivation for salvation"
    },
    {
      "reference": "1 Corinthians 13",
      "context": "Love chapter describing supreme virtue",
      "significance": "Defines agape as the greatest spiritual gift"
    }
  ]
}
```

### Explain a Hebrew word

```json
{
  "tool": "explain_original_language",
  "arguments": {
    "word": "chesed",
    "language": "hebrew"
  }
}
```

## Example 6: Translation Comparison

### Compare translations of John 3:16

```json
{
  "tool": "compare_translations",
  "arguments": {
    "reference": "John 3:16"
  }
}
```

**Expected Response:**
```json
{
  "reference": "John 3:16",
  "translations": [
    {
      "name": "ESV",
      "text": "For God so loved the world, that he gave his only Son...",
      "characteristics": "Essentially literal translation, emphasizing word-for-word accuracy",
      "originalLanguageInsights": ["Maintains Hebrew/Greek word order", "Emphasizes theological precision"]
    },
    {
      "name": "NIV",
      "text": "For God so loved the world that he gave his one and only Son...",
      "characteristics": "Dynamic equivalence translation, balancing accuracy with readability",
      "originalLanguageInsights": ["Focuses on meaning over form", "Uses contemporary idioms"]
    }
  ],
  "keyDifferences": [
    "ESV uses 'only Son' while NIV uses 'one and only Son'"
  ],
  "theologicalImplications": "Translation differences reflect various approaches to balancing literal accuracy with readability..."
}
```

## Example 7: Faith-Based Reasoning

### Theological question

```json
{
  "tool": "faith_reasoning",
  "arguments": {
    "question": "What does the Bible teach about the Trinity?",
    "context": "Preparing for a Bible study"
  }
}
```

**Expected Response:**
```json
{
  "question": "What does the Bible teach about the Trinity?",
  "type": "theological",
  "answer": "The doctrine of the Trinity reveals God as one essence in three persons - Father, Son, and Holy Spirit...",
  "context": "Preparing for a Bible study"
}
```

### Spiritual guidance

```json
{
  "tool": "faith_reasoning",
  "arguments": {
    "question": "How should Christians handle anxiety?",
    "context": "Personal struggle with worry"
  }
}
```

## Example 8: Doctrine Explanation

### Explain the doctrine of Atonement

```json
{
  "tool": "explain_doctrine",
  "arguments": {
    "doctrine": "Atonement"
  }
}
```

**Expected Response:**
```json
{
  "doctrine": "Atonement",
  "explanation": "The doctrine of atonement explains how God's justice and mercy are satisfied through Christ's sacrifice...",
  "scripturalFoundation": "Scriptural foundation includes Romans 3:25, 2 Corinthians 5:21, Hebrews 9:22...",
  "historicalDevelopment": "Atonement theology developed from early church understanding through medieval satisfaction theory...",
  "theologicalSignificance": "Atonement explains how God's justice and mercy are satisfied through Christ's sacrifice..."
}
```

## Example 9: Historical Context

### Get context for Romans

```json
{
  "tool": "get_historical_context",
  "arguments": {
    "book": "Romans",
    "chapter": 8
  }
}
```

**Expected Response:**
```json
{
  "book": "Romans",
  "chapter": 8,
  "historical": {
    "period": "Mid-1st Century AD",
    "culturalBackground": "Urban Roman church with mixed Jewish-Gentile membership...",
    "politicalSituation": "Neronian persecution approaching, tensions in Roman Empire...",
    "religiousContext": "Christian theology developing in pagan environment..."
  },
  "cultural": "Romans is written to a diverse urban church in the imperial capital...",
  "literary": "Romans uses logical argumentation, employs diatribe style...",
  "theological": "Romans systematically presents gospel theology..."
}
```

## Advanced Usage Examples

### Complex theological study

```json
{
  "tool": "search_scripture",
  "arguments": {
    "query": "How does Paul explain justification by faith in Romans and Galatians?",
    "limit": 15
  }
}
```

### Comparative study

```json
{
  "tool": "search_scripture",
  "arguments": {
    "query": "Compare teachings on prayer in Matthew and Luke",
    "limit": 10
  }
}
```

### Thematic study

```json
{
  "tool": "search_scripture",
  "arguments": {
    "query": "kingdom of God parables in the Gospels",
    "limit": 20
  }
}
```

## Tips for Effective Queries

1. **Be specific**: Include book names when possible ("love in Romans" vs "love")
2. **Use theological terms**: "justification", "atonement", "incarnation"
3. **Ask questions**: "What does...", "How does...", "Why does..."
4. **Include context**: "for suffering", "in marriage", "about leadership"
5. **Compare and contrast**: "Compare faith in James and Paul"

## Error Handling

If you encounter errors, check:
- Book names are spelled correctly
- Chapter and verse numbers are valid
- Query format is correct
- Database is properly initialized

Common error responses:
```json
{
  "content": [
    {
      "type": "text",
      "text": "Error: Verse not found"
    }
  ]
}
```

These examples demonstrate the comprehensive capabilities of the Scripture Intelligence Server for deep Bible study and theological exploration.
