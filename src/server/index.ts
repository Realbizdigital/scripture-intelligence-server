import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

import { BibleDatabase } from '../database/bible-data.js';
import { QueryProcessor } from '../nlp/query-processor.js';
import { CrossReferenceEngine } from '../intelligence/cross-reference-engine.js';
import { ContextAnalyzer } from '../intelligence/context-analyzer.js';
import { DevotionalGenerator } from '../intelligence/devotional-generator.js';
import { FaithReasoningAssistant } from '../intelligence/faith-reasoning.js';
import { OriginalLanguagesProcessor } from '../intelligence/original-languages.js';
import { ScriptureIntelligenceConfig } from '../types/index.js';

class ScriptureIntelligenceServer {
  private server: Server;
  private db: BibleDatabase;
  private queryProcessor: QueryProcessor;
  private crossRefEngine: CrossReferenceEngine;
  private contextAnalyzer: ContextAnalyzer;
  private devotionalGenerator: DevotionalGenerator;
  private faithReasoning: FaithReasoningAssistant;
  private originalLanguages: OriginalLanguagesProcessor;

  constructor(config: ScriptureIntelligenceConfig) {
    this.server = new Server({
      name: 'scripture-intelligence-server',
      version: '1.0.0',
      capabilities: {
        tools: {},
      },
    });

    this.db = new BibleDatabase(config.databasePath);
    this.queryProcessor = new QueryProcessor();
    this.crossRefEngine = new CrossReferenceEngine(this.db);
    this.contextAnalyzer = new ContextAnalyzer(this.db);
    this.devotionalGenerator = new DevotionalGenerator(this.db);
    this.faithReasoning = new FaithReasoningAssistant(this.db);
    this.originalLanguages = new OriginalLanguagesProcessor(this.db);

    this.setupToolHandlers();
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = [
        {
          name: 'search_scripture',
          description: 'Search the Bible for specific verses, topics, or themes using natural language queries',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Natural language query (e.g., "What does forgiveness mean in Matthew 18?")',
              },
              limit: {
                type: 'number',
                description: 'Maximum number of results to return',
                default: 20,
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'get_verse_analysis',
          description: 'Get comprehensive analysis of a specific Bible verse including context, cross-references, and original language insights',
          inputSchema: {
            type: 'object',
            properties: {
              book: {
                type: 'string',
                description: 'Bible book name (e.g., "John", "Psalm", "1 Corinthians")',
              },
              chapter: {
                type: 'number',
                description: 'Chapter number',
              },
              verse: {
                type: 'number',
                description: 'Verse number',
              },
            },
            required: ['book', 'chapter', 'verse'],
          },
        },
        {
          name: 'find_cross_references',
          description: 'Find cross-references and parallel passages for a specific verse',
          inputSchema: {
            type: 'object',
            properties: {
              book: {
                type: 'string',
                description: 'Bible book name',
              },
              chapter: {
                type: 'number',
                description: 'Chapter number',
              },
              verse: {
                type: 'number',
                description: 'Verse number',
              },
            },
            required: ['book', 'chapter', 'verse'],
          },
        },
        {
          name: 'generate_devotional',
          description: 'Generate a daily or topical devotional with scripture, reflection, prayer, and application',
          inputSchema: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['daily', 'topical', 'verse'],
                description: 'Type of devotional to generate',
                default: 'daily',
              },
              topic: {
                type: 'string',
                description: 'Topic for topical devotional (e.g., "faith", "love", "hope")',
              },
              verse: {
                type: 'string',
                description: 'Verse reference for verse-based devotional (e.g., "John 3:16")',
              },
              date: {
                type: 'string',
                description: 'Date for daily devotional (YYYY-MM-DD format)',
              },
            },
            required: ['type'],
          },
        },
        {
          name: 'explain_original_language',
          description: 'Get detailed explanation of original Hebrew/Greek words and their theological significance',
          inputSchema: {
            type: 'object',
            properties: {
              word: {
                type: 'string',
                description: 'Word to explain (e.g., "agape", "chesed", "logos")',
              },
              language: {
                type: 'string',
                enum: ['hebrew', 'greek', 'auto'],
                description: 'Original language (auto-detect if not specified)',
                default: 'auto',
              },
              context: {
                type: 'string',
                description: 'Context or verse reference for the word',
              },
            },
            required: ['word'],
          },
        },
        {
          name: 'compare_translations',
          description: 'Compare different Bible translations of a specific verse and analyze theological implications',
          inputSchema: {
            type: 'object',
            properties: {
              reference: {
                type: 'string',
                description: 'Verse reference (e.g., "John 3:16", "Psalm 23:1")',
              },
            },
            required: ['reference'],
          },
        },
        {
          name: 'faith_reasoning',
          description: 'Get faith-based explanations, theological answers, or spiritual guidance for questions',
          inputSchema: {
            type: 'object',
            properties: {
              question: {
                type: 'string',
                description: 'Theological or spiritual question',
              },
              context: {
                type: 'string',
                description: 'Additional context or specific situation',
              },
            },
            required: ['question'],
          },
        },
        {
          name: 'explain_doctrine',
          description: 'Get comprehensive explanation of Christian doctrines with biblical basis and historical development',
          inputSchema: {
            type: 'object',
            properties: {
              doctrine: {
                type: 'string',
                description: 'Doctrine to explain (e.g., "Trinity", "Atonement", "Justification")',
              },
            },
            required: ['doctrine'],
          },
        },
        {
          name: 'get_historical_context',
          description: 'Get historical, cultural, and literary context for Bible passages',
          inputSchema: {
            type: 'object',
            properties: {
              book: {
                type: 'string',
                description: 'Bible book name',
              },
              chapter: {
                type: 'number',
                description: 'Chapter number',
              },
            },
            required: ['book', 'chapter'],
          },
        },
      ];

      return { tools };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'search_scripture':
            return await this.handleSearchScripture(args);
          case 'get_verse_analysis':
            return await this.handleGetVerseAnalysis(args);
          case 'find_cross_references':
            return await this.handleFindCrossReferences(args);
          case 'generate_devotional':
            return await this.handleGenerateDevotional(args);
          case 'explain_original_language':
            return await this.handleExplainOriginalLanguage(args);
          case 'compare_translations':
            return await this.handleCompareTranslations(args);
          case 'faith_reasoning':
            return await this.handleFaithReasoning(args);
          case 'explain_doctrine':
            return await this.handleExplainDoctrine(args);
          case 'get_historical_context':
            return await this.handleGetHistoricalContext(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    });
  }

  private async handleSearchScripture(args: any) {
    const { query, limit = 20 } = args;
    const processedQuery = this.queryProcessor.processQuery(query);
    
    let verses;
    if (processedQuery.entities.books && processedQuery.entities.books.length > 0) {
      verses = await this.db.searchVerses(query, processedQuery.entities.books, limit);
    } else {
      verses = await this.db.searchVerses(query, undefined, limit);
    }

    const results = verses.map(verse => ({
      reference: `${verse.book} ${verse.chapter}:${verse.verse}`,
      text: verse.text,
      translation: verse.translation,
      relevance: this.calculateRelevance(processedQuery, verse)
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            query,
            intent: processedQuery.intent,
            entities: processedQuery.entities,
            results: results.sort((a, b) => b.relevance - a.relevance),
            count: results.length
          }, null, 2),
        },
      ],
    };
  }

  private async handleGetVerseAnalysis(args: any) {
    const { book, chapter, verse } = args;
    const bibleVerse = await this.db.getVerse(book, chapter, verse);
    
    if (!bibleVerse) {
      throw new Error('Verse not found');
    }

    const crossReferences = await this.crossRefEngine.findCrossReferences(bibleVerse);
    const context = await this.contextAnalyzer.analyzeContext(bibleVerse);
    const originalLanguageInsights = await this.originalLanguages.getOriginalLanguageInsights(bibleVerse);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            verse: bibleVerse,
            crossReferences,
            context,
            originalLanguageInsights,
            analysis: this.generateVerseAnalysis(bibleVerse, context, crossReferences)
          }, null, 2),
        },
      ],
    };
  }

  private async handleFindCrossReferences(args: any) {
    const { book, chapter, verse } = args;
    const bibleVerse = await this.db.getVerse(book, chapter, verse);
    
    if (!bibleVerse) {
      throw new Error('Verse not found');
    }

    const crossReferences = await this.crossRefEngine.findCrossReferences(bibleVerse);
    const parallelPassages = await this.crossRefEngine.findParallelPassages(bibleVerse);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            verse: bibleVerse,
            crossReferences,
            parallelPassages,
            summary: this.generateCrossReferenceSummary(crossReferences, parallelPassages)
          }, null, 2),
        },
      ],
    };
  }

  private async handleGenerateDevotional(args: any) {
    const { type, topic, verse, date } = args;
    
    let devotional;
    switch (type) {
      case 'daily':
        devotional = await this.devotionalGenerator.generateDailyDevotional(date);
        break;
      case 'topical':
        if (!topic) throw new Error('Topic is required for topical devotional');
        devotional = await this.devotionalGenerator.generateTopicalDevotional(topic);
        break;
      case 'verse':
        if (!verse) throw new Error('Verse is required for verse-based devotional');
        devotional = await this.devotionalGenerator.generateVerseDevotional(verse);
        break;
      default:
        throw new Error('Invalid devotional type');
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(devotional, null, 2),
        },
      ],
    };
  }

  private async handleExplainOriginalLanguage(args: any) {
    const { word, language, context } = args;
    
    let explanation;
    if (language === 'hebrew' || (language === 'auto' && this.isLikelyHebrew(word))) {
      explanation = await this.originalLanguages.explainHebrewWord(word, context);
    } else {
      explanation = await this.originalLanguages.explainGreekWord(word, context);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(explanation, null, 2),
        },
      ],
    };
  }

  private async handleCompareTranslations(args: any) {
    const { reference } = args;
    const comparison = await this.originalLanguages.compareTranslations(reference);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(comparison, null, 2),
        },
      ],
    };
  }

  private async handleFaithReasoning(args: any) {
    const { question, context } = args;
    
    // Determine if this is a theological question, spiritual guidance, or general question
    const questionType = this.classifyQuestion(question);
    
    let answer;
    switch (questionType) {
      case 'theological':
        answer = await this.faithReasoning.answerTheologicalQuestion(question);
        break;
      case 'guidance':
        answer = await this.faithReasoning.provideSpiritualGuidance(
          this.extractTopic(question), 
          context
        );
        break;
      default:
        answer = await this.faithReasoning.provideFaithBasedExplanation([], question);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            question,
            type: questionType,
            answer,
            context
          }, null, 2),
        },
      ],
    };
  }

  private async handleExplainDoctrine(args: any) {
    const { doctrine } = args;
    const explanation = await this.faithReasoning.explainDoctrinalConcept(doctrine);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(explanation, null, 2),
        },
      ],
    };
  }

  private async handleGetHistoricalContext(args: any) {
    const { book, chapter } = args;
    const context = await this.contextAnalyzer.analyzeContext({ 
      book, 
      chapter, 
      verse: 1, 
      text: '', 
      translation: '' 
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            book,
            chapter,
            historical: context.historical,
            cultural: context.cultural,
            literary: context.literary,
            theological: context.theological
          }, null, 2),
        },
      ],
    };
  }

  private calculateRelevance(query: any, verse: any): number {
    let score = 0;
    
    // Boost score if query entities match verse
    if (query.entities.books?.includes(verse.book.toLowerCase())) score += 10;
    if (query.entities.chapters?.includes(verse.chapter)) score += 5;
    if (query.entities.verses?.includes(verse.verse)) score += 3;
    
    // Boost score for theological topics
    if (query.entities.topics) {
      const verseText = verse.text.toLowerCase();
      query.entities.topics.forEach((topic: string) => {
        if (verseText.includes(topic.toLowerCase())) score += 2;
      });
    }
    
    return score;
  }

  private generateVerseAnalysis(verse: any, context: any, crossReferences: any): string {
    return `This verse from ${verse.book} ${verse.chapter}:${verse.verse} speaks to ${context.theological.toLowerCase()}. ${context.cultural} The passage contains ${crossReferences.length} cross-references, indicating its theological significance and connection to broader biblical themes.`;
  }

  private generateCrossReferenceSummary(crossReferences: any, parallelPassages: any): string {
    const total = crossReferences.length + parallelPassages.length;
    return `Found ${total} related passages: ${crossReferences.length} cross-references and ${parallelPassages.length} parallel passages. These connections reveal the theological unity of Scripture and how this passage relates to the broader biblical narrative.`;
  }

  private classifyQuestion(question: string): string {
    const lower = question.toLowerCase();
    if (lower.includes('doctrine') || lower.includes('trinity') || lower.includes('salvation')) {
      return 'theological';
    }
    if (lower.includes('should') || lower.includes('how to') || lower.includes('guidance')) {
      return 'guidance';
    }
    return 'general';
  }

  private extractTopic(question: string): string {
    const topics = ['marriage', 'parenting', 'work', 'suffering', 'anxiety', 'depression', 'forgiveness'];
    const lower = question.toLowerCase();
    return topics.find(topic => lower.includes(topic)) || 'general';
  }

  private isLikelyHebrew(word: string): boolean {
    const hebrewWords = ['chesed', 'emunah', 'shalom', 'torah', 'ruach'];
    return hebrewWords.includes(word.toLowerCase());
  }

  async initialize(): Promise<void> {
    await this.db.initialize();
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Server initialization
const config: ScriptureIntelligenceConfig = {
  databasePath: './scripture_intelligence.db',
  defaultTranslation: 'ESV',
  enableOriginalLanguages: true,
  enableHistoricalContext: true,
  enableTheologicalAnalysis: true,
  cacheSize: 1000,
};

async function main() {
  const server = new ScriptureIntelligenceServer(config);
  await server.initialize();
  await server.run();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
