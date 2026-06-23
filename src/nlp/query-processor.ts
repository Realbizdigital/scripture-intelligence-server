import { NaturalLanguageQuery, BibleVerse } from '../types/index.js';

export class QueryProcessor {
  private readonly wordPattern = /[a-z0-9]+(?::[0-9]+)?/gi;

  processQuery(text: string): NaturalLanguageQuery {
    const tokens = this.tokenize(text.toLowerCase());
    const stemmedTokens = tokens.map((token: string) => this.stemToken(token));

    const entities = this.extractEntities(tokens, stemmedTokens);
    const intent = this.detectIntent(tokens, stemmedTokens);

    return {
      text,
      intent,
      entities,
      context: this.extractContext(tokens)
    };
  }

  private tokenize(text: string): string[] {
    return text.match(this.wordPattern) || [];
  }

  private stemToken(token: string): string {
    return token
      .replace(/(fulness|lessness|ingly|edly)$/u, '')
      .replace(/(ing|ed|es|s)$/u, '');
  }

  private isBookToken(
    token: string | undefined,
    bibleBooks: string[],
    bookAbbreviations: Record<string, string>
  ): boolean {
    return Boolean(token && (bibleBooks.includes(token) || bookAbbreviations[token]));
  }

  private isNumberedBookPrefix(token: string | undefined, nextToken: string | undefined, bibleBooks: string[]): boolean {
    return Boolean(token && nextToken && /^[1-3]$/.test(token) && bibleBooks.includes(`${token} ${nextToken}`));
  }

  private extractEntities(tokens: string[], _stemmedTokens: string[]): NaturalLanguageQuery['entities'] {
    const entities: NaturalLanguageQuery['entities'] = {
      books: [],
      chapters: [],
      verses: [],
      topics: [],
      themes: []
    };

    // Bible book detection
    const bibleBooks = [
      'genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy',
      'joshua', 'judges', 'ruth', '1 samuel', '2 samuel', '1 kings', '2 kings',
      '1 chronicles', '2 chronicles', 'ezra', 'nehemiah', 'esther',
      'job', 'psalms', 'proverbs', 'ecclesiastes', 'song of solomon', 'song of songs',
      'isaiah', 'jeremiah', 'lamentations', 'ezekiel', 'daniel',
      'hosea', 'joel', 'amos', 'obadiah', 'jonah', 'micah', 'nahum', 'habakkuk', 'zephaniah', 'haggai', 'zechariah', 'malachi',
      'matthew', 'mark', 'luke', 'john', 'acts',
      'romans', '1 corinthians', '2 corinthians', 'galatians', 'ephesians', 'philippians', 'colossians',
      '1 thessalonians', '2 thessalonians', '1 timothy', '2 timothy', 'titus', 'philemon',
      'hebrews', 'james', '1 peter', '2 peter', '1 john', '2 john', '3 john', 'jude', 'revelation'
    ];

    // Common book abbreviations
    const bookAbbreviations = {
      'gen': 'genesis', 'ex': 'exodus', 'lev': 'leviticus', 'num': 'numbers', 'deut': 'deuteronomy',
      'josh': 'joshua', 'judg': 'judges', 'ruth': 'ruth', '1 sam': '1 samuel', '2 sam': '2 samuel',
      '1 kgs': '1 kings', '2 kgs': '2 kings', '1 chr': '1 chronicles', '2 chr': '2 chronicles',
      'ezra': 'ezra', 'neh': 'nehemiah', 'esth': 'esther', 'job': 'job', 'ps': 'psalms', 'psalm': 'psalms',
      'prov': 'proverbs', 'eccl': 'ecclesiastes', 'song': 'song of solomon',
      'isa': 'isaiah', 'jer': 'jeremiah', 'lam': 'lamentations', 'ezek': 'ezekiel', 'dan': 'daniel',
      'hos': 'hosea', 'joel': 'joel', 'amos': 'amos', 'obad': 'obadiah', 'jonah': 'jonah',
      'mic': 'micah', 'nah': 'nahum', 'hab': 'habakkuk', 'zeph': 'zephaniah', 'hag': 'haggai',
      'zech': 'zechariah', 'mal': 'malachi',
      'mt': 'matthew', 'mk': 'mark', 'lk': 'luke', 'jn': 'john', 'acts': 'acts',
      'rom': 'romans', '1 cor': '1 corinthians', '2 cor': '2 corinthians', 'gal': 'galatians',
      'eph': 'ephesians', 'phil': 'philippians', 'col': 'colossians',
      '1 thess': '1 thessalonians', '2 thess': '2 thessalonians', '1 tim': '1 timothy', '2 tim': '2 timothy',
      'titus': 'titus', 'philem': 'philemon', 'heb': 'hebrews', 'jas': 'james',
      '1 pet': '1 peter', '2 pet': '2 peter', '1 jn': '1 john', '2 jn': '2 john', '3 jn': '3 john',
      'jude': 'jude', 'rev': 'revelation'
    };

    // Extract books
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const nextToken = tokens[i + 1];
      
      // Check full book names
      if (bibleBooks.includes(token)) {
        entities.books!.push(token);
      }
      // Check abbreviations
      else if (bookAbbreviations[token as keyof typeof bookAbbreviations]) {
        entities.books!.push(bookAbbreviations[token as keyof typeof bookAbbreviations]);
      }
      // Check for numbered books (e.g., "1 john", "2 corinthians")
      else if (/^[1-3]$/.test(token) && nextToken && bibleBooks.includes(`${token} ${nextToken}`)) {
        entities.books!.push(`${token} ${nextToken}`);
        i++; // Skip next token since we've processed it
      }
    }

    // Extract chapters and verses
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const nextToken = tokens[i + 1];
      
      // Chapter:verse format (e.g., "18:21", "john 3:16")
      if (token.includes(':')) {
        const [chapter, verse] = token.split(':');
        const chapNum = parseInt(chapter);
        const verseNum = parseInt(verse);
        
        if (!isNaN(chapNum)) entities.chapters!.push(chapNum);
        if (!isNaN(verseNum)) entities.verses!.push(verseNum);
      }
      // Separate chapter and verse (e.g., "chapter 18 verse 21")
      else if (token === 'chapter' && nextToken && !isNaN(parseInt(nextToken))) {
        entities.chapters!.push(parseInt(nextToken));
        i++; // Skip next token
      }
      else if (token === 'verse' && nextToken && !isNaN(parseInt(nextToken))) {
        entities.verses!.push(parseInt(nextToken));
        i++; // Skip next token
      }
      // Standalone numbers (assume chapters if no verse context)
      else if (!isNaN(parseInt(token)) && !token.includes(':')) {
        const num = parseInt(token);

        if (this.isNumberedBookPrefix(token, nextToken, bibleBooks)) {
          continue;
        }

        const previousToken = tokens[i - 1];
        const twoBackToken = tokens[i - 2];
        const threeBackToken = tokens[i - 3];
        const previousTokenIsBook = this.isBookToken(previousToken, bibleBooks, bookAbbreviations)
          || this.isNumberedBookPrefix(twoBackToken, previousToken, bibleBooks);
        const twoBackTokenIsBook = this.isBookToken(twoBackToken, bibleBooks, bookAbbreviations)
          || this.isNumberedBookPrefix(threeBackToken, twoBackToken, bibleBooks);

        if (num > 0 && previousTokenIsBook) {
          entities.chapters!.push(num);
          continue;
        }

        if (num > 0 && twoBackTokenIsBook && previousToken && !isNaN(parseInt(previousToken))) {
          entities.verses!.push(num);
          continue;
        }

        if (num > 0 && num <= 150) { // Reasonable Bible chapter range
          entities.chapters!.push(num);
        }
      }
    }

    // Extract theological topics and themes
    const theologicalTopics = [
      'love', 'faith', 'hope', 'grace', 'mercy', 'forgiveness', 'salvation', 'redemption',
      'sin', 'righteousness', 'holiness', 'prayer', 'worship', 'trinity', 'christ', 'jesus',
      'god', 'holy spirit', 'bible', 'scripture', 'gospel', 'kingdom', 'heaven', 'hell',
      'judgment', 'eternity', 'creation', 'providence', 'sovereignty', 'covenant', 'law',
      'prophecy', 'apostles', 'disciples', 'church', 'baptism', 'communion', 'marriage',
      'family', 'suffering', 'perseverance', 'joy', 'peace', 'patience', 'kindness', 'goodness',
      'faithfulness', 'gentleness', 'self-control', 'wisdom', 'understanding', 'knowledge',
      'truth', 'light', 'darkness', 'evil', 'satan', 'demons', 'angels', 'miracles',
      'resurrection', 'ascension', 'second coming', 'end times', 'tribulation', 'rapture'
    ];

    tokens.forEach(token => {
      if (theologicalTopics.includes(token)) {
        entities.topics!.push(token);
      }
    });

    return entities;
  }

  private detectIntent(tokens: string[], _stemmedTokens: string[]): NaturalLanguageQuery['intent'] {
    const intentKeywords = {
      search: ['search', 'find', 'look', 'show', 'verse', 'passage', 'scripture'],
      explain: ['explain', 'meaning', 'what', 'why', 'how', 'interpret', 'understand'],
      compare: ['compare', 'difference', 'similar', 'contrast', 'versus', 'like'],
      apply: ['apply', 'application', 'relevant', 'today', 'modern', 'practical', 'life'],
      devotional: ['devotional', 'daily', 'reflection', 'meditation', 'prayer', 'quiet time']
    };

    for (const [intent, keywords] of Object.entries(intentKeywords)) {
      if (keywords.some(keyword => tokens.includes(keyword))) {
        return intent as NaturalLanguageQuery['intent'];
      }
    }

    // Default to search if no specific intent detected
    return 'search';
  }

  private extractContext(tokens: string[]): string | undefined {
    const contextIndicators = [
      'in', 'during', 'when', 'where', 'because', 'since', 'therefore', 'however',
      'although', 'though', 'while', 'before', 'after', 'until', 'as', 'like'
    ];

    const contextTokens = tokens.filter(token => contextIndicators.includes(token));
    
    if (contextTokens.length > 0) {
      const startIndex = tokens.findIndex(token => contextIndicators.includes(token));
      return tokens.slice(startIndex).join(' ');
    }

    return undefined;
  }

  formatVerseReference(verse: BibleVerse): string {
    return `${verse.book} ${verse.chapter}:${verse.verse}`;
  }

  parseVerseReference(reference: string): { book?: string; chapter?: number; verse?: number } | null {
    // Match patterns like "John 3:16", "Matthew 18:21-22", "Genesis 1", "Psalm 23"
    const patterns = [
      /^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/, // Book chapter:verse[-verse]
      /^(.+?)\s+(\d+)$/, // Book chapter
      /^(\d+)\s+(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/ // Numbered Book chapter:verse[-verse]
    ];

    for (const pattern of patterns) {
      const match = reference.match(pattern);
      if (match) {
        if (pattern === patterns[2]) {
          // Numbered book pattern
          return {
            book: `${match[1]} ${match[2]}`,
            chapter: parseInt(match[3]),
            verse: parseInt(match[4])
          };
        } else if (pattern === patterns[0]) {
          // Standard book chapter:verse pattern
          return {
            book: match[1],
            chapter: parseInt(match[2]),
            verse: parseInt(match[3])
          };
        } else {
          // Book chapter pattern
          return {
            book: match[1],
            chapter: parseInt(match[2])
          };
        }
      }
    }

    return null;
  }
}
