import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { dirname, resolve } from 'node:path';
import { existsSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

import {
  buildResourcePayload,
  renderPrompt,
  SCRIPTURE_PROMPTS,
  SCRIPTURE_RESOURCE_TEMPLATES,
  SCRIPTURE_RESOURCES,
  SCRIPTURE_TOOL_DESCRIPTIONS,
  SCRIPTURE_TOOL_NAMES,
  SCRIPTURE_TOOL_SPECS,
} from './catalog.js';
import { BibleDatabase } from '../database/bible-data.js';
import { PUBLIC_DOMAIN_TRANSLATIONS } from '../database/public-domain-importer.js';
import { QueryProcessor } from '../nlp/query-processor.js';
import { CrossReferenceEngine } from '../intelligence/cross-reference-engine.js';
import { ContextAnalyzer } from '../intelligence/context-analyzer.js';
import { DevotionalGenerator } from '../intelligence/devotional-generator.js';
import { FaithReasoningAssistant } from '../intelligence/faith-reasoning.js';
import { OriginalLanguagesProcessor } from '../intelligence/original-languages.js';
import {
  attachStudySafety,
  clampPositiveInteger,
  clampVerseRange,
  publicErrorPayload,
  safeJson,
  sanitizePromptArgs,
  sanitizeResourceUri,
  sanitizeText,
  sanitizeToolArgs,
  UserInputError,
} from '../security/input-guard.js';
import { BibleVerse, ScriptureIntelligenceConfig } from '../types/index.js';

const SERVER_VERSION = '1.1.2';
const SERVER_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(SERVER_DIR, '../..');
const MINIMUM_FULL_CORPUS_BYTES = 10_000_000;

export class ScriptureIntelligenceServer {
  private server: Server;
  private config: ScriptureIntelligenceConfig;
  private db: BibleDatabase;
  private queryProcessor: QueryProcessor;
  private crossRefEngine: CrossReferenceEngine;
  private contextAnalyzer: ContextAnalyzer;
  private devotionalGenerator: DevotionalGenerator;
  private faithReasoning: FaithReasoningAssistant;
  private originalLanguages: OriginalLanguagesProcessor;

  constructor(config: ScriptureIntelligenceConfig) {
    this.config = config;
    this.server = new Server(
      {
        name: 'barzel-scripture-intelligence',
        version: SERVER_VERSION,
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
        instructions: 'Use Barzel Scripture Intelligence for Bible search, verse lookup, Scripture analysis, cross-references, original-language study, theology, apologetics, sermon preparation, teaching, and devotional workflows.',
      }
    );

    this.db = new BibleDatabase(
      config.databasePath,
      config.defaultTranslation,
      config.databaseReadOnly
    );
    this.queryProcessor = new QueryProcessor();
    this.crossRefEngine = new CrossReferenceEngine(this.db);
    this.contextAnalyzer = new ContextAnalyzer(this.db);
    this.devotionalGenerator = new DevotionalGenerator(this.db);
    this.faithReasoning = new FaithReasoningAssistant(this.db);
    this.originalLanguages = new OriginalLanguagesProcessor(this.db);

    this.setupToolHandlers();
    this.setupResourceHandlers();
    this.setupPromptHandlers();
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
              translation: {
                type: 'string',
                description: 'Preferred loaded Bible translation such as WEB, KJV, ASV, or ESV',
                default: this.config.defaultTranslation,
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
              translation: {
                type: 'string',
                description: 'Preferred loaded Bible translation such as WEB, KJV, ASV, or ESV',
                default: this.config.defaultTranslation,
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
              translation: {
                type: 'string',
                description: 'Preferred loaded Bible translation such as WEB, KJV, ASV, or ESV',
                default: this.config.defaultTranslation,
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
              translations: {
                type: 'string',
                description: 'Optional comma-separated translation list. Loaded public-domain texts include WEB, KJV, and ASV after database setup.',
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
        ...SCRIPTURE_TOOL_SPECS,
      ];

      return { tools };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name } = request.params;
        const args = sanitizeToolArgs(request.params.arguments);

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
            if (SCRIPTURE_TOOL_NAMES.has(name)) {
              return await this.handleCatalogTool(name, args ?? {});
            }
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return this.createToolResponse(publicErrorPayload(error));
      }
    });
  }

  private setupResourceHandlers(): void {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: SCRIPTURE_RESOURCES,
    }));

    this.server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({
      resourceTemplates: SCRIPTURE_RESOURCE_TEMPLATES,
    }));

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      try {
        const uri = sanitizeResourceUri(request.params.uri);
        const payload = await this.buildDynamicResourcePayload(uri) ?? buildResourcePayload(uri, {
          toolNames: this.getToolNames(),
          promptNames: SCRIPTURE_PROMPTS.map((prompt) => prompt.name),
          config: {
            databaseConfigured: Boolean(this.config.databasePath),
            databaseReadOnly: this.config.databaseReadOnly,
            defaultTranslation: this.config.defaultTranslation,
            enableOriginalLanguages: this.config.enableOriginalLanguages,
            enableHistoricalContext: this.config.enableHistoricalContext,
            enableTheologicalAnalysis: this.config.enableTheologicalAnalysis,
            cacheSize: this.config.cacheSize,
          },
          version: SERVER_VERSION,
        });

        return {
          contents: [
            {
              uri,
              mimeType: payload.mimeType,
              text: payload.text,
            },
          ],
        };
      } catch (error) {
        return {
          contents: [
            {
              uri: 'scripture://server/error',
              mimeType: 'application/json',
              text: safeJson(publicErrorPayload(error)),
            },
          ],
        };
      }
    });
  }

  private async buildDynamicResourcePayload(uri: string): Promise<{ mimeType: string; text: string } | null> {
    if (uri === 'scripture://bible/translations') {
      const loadedTranslations = await this.db.getAvailableTranslations();
      const loadedById = new Map(loadedTranslations.map((translation) => [translation.translation, translation.verses]));
      const publicDomainSources = PUBLIC_DOMAIN_TRANSLATIONS.map((source) => ({
        id: source.id,
        name: source.name,
        publicDomain: true,
        loaded: loadedById.has(source.id),
        verses: loadedById.get(source.id) || 0,
        sourceUrl: source.sourceUrl,
        detailUrl: source.detailUrl,
        copyright: source.copyright,
      }));

      return {
        mimeType: 'application/json',
        text: safeJson(attachStudySafety({
          uri,
          defaultTranslation: this.config.defaultTranslation,
          publicDomainSources,
          licensedTranslations: [
            { id: 'ESV', name: 'English Standard Version', loaded: loadedById.has('ESV'), publicDomain: false },
            { id: 'NIV', name: 'New International Version', loaded: loadedById.has('NIV'), publicDomain: false },
            { id: 'NKJV', name: 'New King James Version', loaded: loadedById.has('NKJV'), publicDomain: false },
            { id: 'NLT', name: 'New Living Translation', loaded: loadedById.has('NLT'), publicDomain: false },
            { id: 'CSB', name: 'Christian Standard Bible', loaded: loadedById.has('CSB'), publicDomain: false },
            { id: 'NASB', name: 'New American Standard Bible', loaded: loadedById.has('NASB'), publicDomain: false },
          ],
          note: 'Full-text setup imports public-domain WEB, KJV, and ASV by default. Copyrighted modern translations are not bundled unless a licensed dataset is explicitly loaded.',
        })),
      };
    }

    const publicDomainResourceMatch = uri.match(/^scripture:\/\/bible\/public-domain\/([^/]+)$/);
    if (publicDomainResourceMatch) {
      const translation = sanitizeText(publicDomainResourceMatch[1], 16).toUpperCase();
      const source = PUBLIC_DOMAIN_TRANSLATIONS.find((candidate) => candidate.id === translation);
      if (source) {
        const verses = await this.db.countVersesForTranslation(source.id);
        return {
          mimeType: 'application/json',
          text: safeJson(attachStudySafety({
            uri,
            ...source,
            loaded: verses >= 30000,
            verses,
          })),
        };
      }
    }

    const publicDomainStatusMatch = uri.match(/^scripture:\/\/public-domain\/status\/([^/]+)$/);
    const translationMetadataMatch = uri.match(/^scripture:\/\/translation\/metadata\/([^/]+)$/);
    if (publicDomainStatusMatch || translationMetadataMatch) {
      const translation = sanitizeText((publicDomainStatusMatch || translationMetadataMatch)![1], 16).toUpperCase();
      const source = PUBLIC_DOMAIN_TRANSLATIONS.find((candidate) => candidate.id === translation);
      const verses = await this.db.countVersesForTranslation(translation);
      return {
        mimeType: 'application/json',
        text: safeJson(attachStudySafety({
          uri,
          translation,
          publicDomain: Boolean(source),
          loaded: verses > 0,
          verses,
          metadata: source || {
            id: translation,
            copyright: 'Not bundled by default. Load only with proper licensing and attribution.',
          },
        })),
      };
    }

    const bibleMatch = uri.match(/^scripture:\/\/bible\/([^/]+)\/([^/]+)\/(\d+)(?:\/(\d+)(?:-(\d+))?)?$/);
    if (bibleMatch) {
      const [, translation, book, chapterValue, verseValue, endVerseValue] = bibleMatch;
      const chapter = clampPositiveInteger(chapterValue, 1, 150);
      const range = endVerseValue ? clampVerseRange(Number(verseValue), Number(endVerseValue)) : undefined;
      const requestedTranslation = sanitizeText(translation, 16).toUpperCase();
      const verses = verseValue
        ? endVerseValue
          ? await this.db.getPassage(book, chapter, range!.startVerse, range!.endVerse, requestedTranslation, { fallback: false })
          : await this.getVersesForReference({
              book,
              chapter,
              verse: clampPositiveInteger(verseValue, 1, 200),
              translation: requestedTranslation,
              strictTranslation: true,
            })
        : await this.db.getChapter(book, chapter, requestedTranslation, { fallback: false });

      return {
        mimeType: 'application/json',
        text: safeJson(attachStudySafety({
          uri,
          translation: requestedTranslation,
          reference: verseValue
            ? endVerseValue
              ? `${book} ${chapter}:${verseValue}-${endVerseValue}`
              : `${book} ${chapter}:${verseValue}`
            : `${book} ${chapter}`,
          verses,
          count: verses.length,
          note: verses.length === 0 ? 'No matching text was found in the local Scripture database.' : undefined,
        })),
      };
    }

    const crossReferenceMatch = uri.match(/^scripture:\/\/cross-references\/([^/]+)\/(\d+)\/(\d+)$/);
    if (crossReferenceMatch) {
      const [, book, chapterValue, verseValue] = crossReferenceMatch;
      const verse = await this.db.getVerse(
        book,
        clampPositiveInteger(chapterValue, 1, 150),
        clampPositiveInteger(verseValue, 1, 200)
      );
      const crossReferences = verse ? await this.crossRefEngine.findCrossReferences(verse) : [];

      return {
        mimeType: 'application/json',
        text: safeJson(attachStudySafety({
          uri,
          reference: `${book} ${chapterValue}:${verseValue}`,
          crossReferences,
          count: crossReferences.length,
          note: verse ? undefined : 'The requested verse was not found in the local Scripture database.',
        })),
      };
    }

    const historicalContextMatch = uri.match(/^scripture:\/\/context\/historical\/([^/]+)(?:\/(\d+))?$/);
    if (historicalContextMatch) {
      const [, book, chapterValue] = historicalContextMatch;
      const chapter = chapterValue ? clampPositiveInteger(chapterValue, 1, 150) : 1;
      const context = await this.contextAnalyzer.analyzeContext({
        book,
        chapter,
        verse: 1,
        text: '',
        translation: this.config.defaultTranslation,
      });

      return {
        mimeType: 'application/json',
        text: safeJson(attachStudySafety({
          uri,
          book,
          chapter,
          context,
        })),
      };
    }

    return null;
  }

  private setupPromptHandlers(): void {
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: SCRIPTURE_PROMPTS.map((prompt) => ({
        name: prompt.name,
        description: prompt.description,
        arguments: prompt.arguments,
      })),
    }));

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      try {
        const prompt = renderPrompt(
          sanitizeText(request.params.name, 128),
          sanitizePromptArgs(request.params.arguments ?? {})
        );

        return {
          description: prompt.description,
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: prompt.template,
              },
            },
          ],
        };
      } catch (error) {
        return {
          description: 'Prompt request could not be completed safely.',
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: safeJson(publicErrorPayload(error)),
              },
            },
          ],
        };
      }
    });
  }

  private async handleSearchScripture(args: any) {
    const query = this.requireText(args.query, 'query');
    const limit = clampPositiveInteger(args.limit, 20);
    const translation = this.getRequestedTranslation(args);
    const processedQuery = this.queryProcessor.processQuery(query);
    
    let verses;
    if (processedQuery.entities.books && processedQuery.entities.books.length > 0) {
      verses = await this.db.searchVerses(query, processedQuery.entities.books, limit, translation, { fallback: !args.translation });
    } else {
      verses = await this.db.searchVerses(query, undefined, limit, translation, { fallback: !args.translation });
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
            translation,
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
    const { book, chapter, verse, translation } = this.requireVerseReference(args);
    const bibleVerse = await this.db.getVerse(book, chapter, verse, translation, { fallback: !args.translation });
    
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
    const { book, chapter, verse, translation } = this.requireVerseReference(args);
    const bibleVerse = await this.db.getVerse(book, chapter, verse, translation, { fallback: !args.translation });
    
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
    const type = sanitizeText(args.type || 'daily', 32);
    const topic = sanitizeText(args.topic || '', 256);
    const verse = sanitizeText(args.verse || args.reference || '', 256);
    const date = sanitizeText(args.date || '', 32);
    
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
    const word = this.requireText(args.word || args.query || args.topic, 'word');
    const language = sanitizeText(args.language || 'auto', 16);
    const context = sanitizeText(args.context || args.reference || '', 512);
    
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
    const reference = this.requireText(args.reference || args.query, 'reference');
    const translations = sanitizeText(args.translations || args.translation || '', 120)
      .split(',')
      .map((translation) => translation.trim().toUpperCase())
      .filter(Boolean);
    const comparison = await this.originalLanguages.compareTranslations(reference, translations);

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
    const question = this.requireText(args.question || args.query, 'question');
    const context = sanitizeText(args.context || '', 1000);
    
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
    const doctrine = this.requireText(args.doctrine || args.topic || args.query, 'doctrine');
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
    const book = this.requireText(args.book || args.reference || args.topic, 'book');
    const chapter = clampPositiveInteger(args.chapter, 1, 150);
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

  private async handleCatalogTool(name: string, args: any) {
    switch (name) {
      case 'verse_lookup':
        return await this.handleVerseLookupTool(args);
      case 'passage_analysis':
        return await this.handlePassageAnalysisTool(name, args);
      case 'chapter_summary':
        return await this.handleChapterSummaryTool(args);
      case 'book_overview':
        return this.createToolResponse(this.buildBookOverview(args));
      case 'find_parallel_passages':
        return await this.handleParallelPassagesTool(args);
      case 'topic_to_verses':
      case 'biblical_theme_search':
      case 'doctrine_evidence_finder':
      case 'biblical_word_search':
      case 'memory_verse_suggester':
        return await this.handleSearchBackedTool(name, args);
      case 'translation_compare':
        return await this.handleCompareTranslations({
          reference: this.getReferenceInput(args),
          translations: args.translations || args.translation,
        });
      case 'original_language_lookup':
      case 'hebrew_word_study':
      case 'greek_word_study':
        return await this.handleExplainOriginalLanguage({
          word: args.word || args.query || args.topic,
          language: name === 'hebrew_word_study' ? 'hebrew' : name === 'greek_word_study' ? 'greek' : args.language || 'auto',
          context: args.reference || args.context,
        });
      case 'historical_context_lookup':
        return await this.handleHistoricalContextLookupTool(args);
      case 'sermon_outline_generator':
        return await this.handleSermonOutlineTool(args);
      case 'devotional_generator':
        return this.createToolResponse(this.buildDevotionalFramework(args));
      default:
        return this.createToolResponse(this.buildGenericStudyFramework(name, args));
    }
  }

  private async handleVerseLookupTool(args: any) {
    const reference = this.parseReferenceInput(args);
    const translation = this.getRequestedTranslation(args);
    if (!reference.book || !reference.chapter) {
      return this.createToolResponse({
        tool: 'verse_lookup',
        error: 'A verse or passage reference is required.',
        example: 'John 3:16',
      });
    }

    const verses = await this.getVersesForReference({ ...reference, translation, strictTranslation: Boolean(args.translation) });

    return this.createToolResponse({
      tool: 'verse_lookup',
      reference: this.formatReference(reference),
      translation,
      verses,
      count: verses.length,
      note: verses.length === 0 ? 'No matching verses were found in the local Scripture database.' : undefined,
    });
  }

  private async handlePassageAnalysisTool(name: string, args: any) {
    const reference = this.parseReferenceInput(args);
    const translation = this.getRequestedTranslation(args);
    const verses = reference.book && reference.chapter
      ? await this.getVersesForReference({ ...reference, translation, strictTranslation: Boolean(args.translation) })
      : [];
    const passageText = verses.map((verse) => verse.text).join(' ');

    return this.createToolResponse({
      tool: name,
      reference: reference.book ? this.formatReference(reference) : this.getReferenceInput(args),
      translation,
      passage: verses,
      structure: this.describePassageStructure(verses),
      keyIdeas: this.extractKeyIdeas(passageText || this.getPrimaryInput(args)),
      theologicalMessage: 'Read the passage in its literary, canonical, and redemptive-historical context before drawing conclusions.',
      application: 'Move from observation to interpretation to application, keeping the original audience and covenant setting in view.',
      note: verses.length === 0 ? 'No local passage text was found, so the analysis is scaffolded from the supplied request.' : undefined,
    });
  }

  private async handleChapterSummaryTool(args: any) {
    const reference = this.parseReferenceInput(args);
    const translation = this.getRequestedTranslation(args);
    if (!reference.book || !reference.chapter) {
      return this.createToolResponse({
        tool: 'chapter_summary',
        error: 'A book and chapter are required.',
        example: 'Romans 8',
      });
    }

    const verses = await this.db.getChapter(reference.book, reference.chapter, translation, { fallback: !args.translation });
    const text = verses.map((verse) => verse.text).join(' ');

    return this.createToolResponse({
      tool: 'chapter_summary',
      reference: `${reference.book} ${reference.chapter}`,
      translation,
      verseCount: verses.length,
      keyEvents: this.extractKeyIdeas(text),
      themes: this.inferThemes(text || reference.book),
      lessons: [
        'Identify what the chapter reveals about God, humanity, sin, grace, covenant, and obedience.',
        'Read the chapter as part of the argument or storyline of the whole book.',
        'Apply the chapter in ways consistent with its original meaning.',
      ],
      note: verses.length === 0 ? 'No local chapter text was found, so this is a summary framework.' : undefined,
    });
  }

  private buildBookOverview(args: any) {
    const book = args.book || args.topic || args.query || 'requested book';
    return {
      tool: 'book_overview',
      book,
      overview: {
        author: 'Use responsible introduction data and note where authorship is debated.',
        audience: 'Identify the first audience before applying the book today.',
        purpose: `Explain why ${book} was written and how it contributes to Scripture.`,
        setting: 'Include historical, cultural, covenantal, and literary setting.',
        structure: 'Outline the book by major movements, speeches, poems, narratives, or arguments.',
        mainThemes: this.inferThemes(String(book)),
      },
    };
  }

  private async handleParallelPassagesTool(args: any) {
    const reference = this.parseReferenceInput(args);
    const translation = this.getRequestedTranslation(args);
    if (!reference.book || !reference.chapter || !reference.verse) {
      return this.createToolResponse({
        tool: 'find_parallel_passages',
        error: 'A specific verse reference is required for parallel-passage lookup.',
        example: 'Matthew 18:22',
      });
    }

    const verse = await this.db.getVerse(reference.book, reference.chapter, reference.verse, translation, { fallback: !args.translation });
    if (!verse) {
      return this.createToolResponse({
        tool: 'find_parallel_passages',
        reference: this.formatReference(reference),
        parallelPassages: [],
        note: 'The requested verse was not found in the local Scripture database.',
      });
    }

    const parallelPassages = await this.crossRefEngine.findParallelPassages(verse);
    return this.createToolResponse({
      tool: 'find_parallel_passages',
      reference: this.formatReference(reference),
      translation,
      parallelPassages,
      count: parallelPassages.length,
    });
  }

  private async handleSearchBackedTool(name: string, args: any) {
    const query = this.getPrimaryInput(args);
    const limit = clampPositiveInteger(args.limit, 10);
    const translation = this.getRequestedTranslation(args);
    const verses = query ? await this.db.searchVerses(query, undefined, limit, translation, { fallback: !args.translation }) : [];

    return this.createToolResponse({
      tool: name,
      query,
      translation,
      results: verses.map((verse) => ({
        reference: `${verse.book} ${verse.chapter}:${verse.verse}`,
        text: verse.text,
        translation: verse.translation,
      })),
      count: verses.length,
      studyNotes: this.buildGenericStudyFramework(name, args).studySteps,
      note: verses.length === 0 ? 'No local verse matches were found. Broaden the query or load a fuller Bible database.' : undefined,
    });
  }

  private async handleHistoricalContextLookupTool(args: any) {
    const reference = this.parseReferenceInput(args);
    const book = reference.book || args.book || args.topic || args.query;
    const chapter = reference.chapter || args.chapter || 1;

    return await this.handleGetHistoricalContext({ book, chapter });
  }

  private async handleSermonOutlineTool(args: any) {
    const reference = this.parseReferenceInput(args);
    const subject = this.getPrimaryInput(args) || 'requested Scripture passage';
    const audience = sanitizeText(args.audience || 'general audience', 160);
    const translation = this.getRequestedTranslation(args);
    const verses = reference.book && reference.chapter
      ? await this.getVersesForReference({ ...reference, translation, strictTranslation: Boolean(args.translation) })
      : [];
    const passageText = verses.map((verse) => verse.text).join(' ');
    const keyIdeas = this.extractKeyIdeas(passageText || subject);
    const referenceLabel = reference.book ? this.formatReference(reference) : subject;

    return this.createToolResponse({
      tool: 'sermon_outline_generator',
      reference: referenceLabel,
      translation,
      audience,
      passage: verses.map((verse) => ({
        reference: `${verse.book} ${verse.chapter}:${verse.verse}`,
        text: verse.text,
        translation: verse.translation,
      })),
      bigIdea: this.deriveMainClaim(passageText, keyIdeas, referenceLabel),
      objective: `Help ${audience} understand the passage in context and respond with faithful trust, repentance, worship, and obedience.`,
      outline: [
        {
          movement: 'Observation',
          title: 'What the text says',
          aim: 'Read the passage aloud, identify repeated words, people, actions, promises, commands, and contrasts.',
          support: keyIdeas.slice(0, 2),
        },
        {
          movement: 'Interpretation',
          title: 'What the text means in context',
          aim: 'Explain the immediate chapter, book argument, covenant setting, and canonical connections before moving to application.',
          support: [
            'Connect the passage to the author, audience, and flow of thought.',
            'Distinguish clear biblical teaching from debated interpretive judgments.',
          ],
        },
        {
          movement: 'Application',
          title: 'How the church should respond',
          aim: 'Apply the passage personally, spiritually, ethically, and communally without detaching it from its original meaning.',
          support: [
            'Name one belief to embrace, one sin or distortion to reject, and one concrete act of obedience.',
            'Keep application grounded in grace, truth, and the whole counsel of Scripture.',
          ],
        },
      ],
      introduction: `Open by locating ${referenceLabel} in its biblical context and naming the tension or hope the passage addresses.`,
      conclusion: `Conclude by returning to the main claim of ${referenceLabel} and calling for a Scripture-shaped response.`,
      discussionQuestions: [
        'What does this passage reveal about God, humanity, sin, grace, covenant, or obedience?',
        'How does the surrounding context shape the meaning of this passage?',
        'What application follows naturally from the text rather than from our assumptions?',
      ],
      note: verses.length === 0 ? 'No local passage text was found, so this outline is built from the supplied subject only.' : undefined,
    });
  }

  private buildDevotionalFramework(args: any) {
    const subject = this.getPrimaryInput(args) || 'today';
    return {
      tool: 'devotional_generator',
      subject,
      structure: {
        scripture: 'Select a passage in context.',
        reflection: 'Explain the passage clearly before applying it.',
        prayer: 'Root the prayer in the revealed truth of the passage.',
        application: 'Name one concrete, faithful response for daily life.',
      },
      caution: 'Devotional use should encourage Scripture-shaped reflection without replacing careful interpretation.',
    };
  }

  private buildGenericStudyFramework(name: string, args: any) {
    const description = SCRIPTURE_TOOL_DESCRIPTIONS.get(name) || 'Scripture study helper.';
    const subject = this.getPrimaryInput(args) || 'the requested Scripture study subject';

    return {
      tool: name,
      description,
      subject,
      studySteps: [
        'Identify the immediate literary context.',
        'Observe key words, repeated ideas, people, places, and covenant setting.',
        'Compare related passages and canonical development.',
        'Distinguish clear biblical teaching from interpretive judgment.',
        'Apply the passage faithfully without flattening historical or theological nuance.',
      ],
      suggestedFollowUps: [
        'search_scripture',
        'get_verse_analysis',
        'find_cross_references',
        'explain_doctrine',
      ],
    };
  }

  private async getVersesForReference(reference: {
    book?: string;
    chapter?: number;
    verse?: number;
    startVerse?: number;
    endVerse?: number;
    translation?: string;
    strictTranslation?: boolean;
  }): Promise<BibleVerse[]> {
    if (!reference.book || !reference.chapter) return [];
    const translation = this.getRequestedTranslation(reference);
    const lookupOptions = { fallback: !reference.strictTranslation };

    if (reference.startVerse && reference.endVerse) {
      const range = clampVerseRange(reference.startVerse, reference.endVerse);
      return await this.db.getPassage(reference.book, reference.chapter, range.startVerse, range.endVerse, translation, lookupOptions);
    }

    if (reference.verse) {
      const verse = await this.db.getVerse(reference.book, reference.chapter, reference.verse, translation, lookupOptions);
      return verse ? [verse] : [];
    }

    return await this.db.getChapter(reference.book, reference.chapter, translation, lookupOptions);
  }

  private requireVerseReference(args: any): { book: string; chapter: number; verse: number; translation: string } {
    const reference = this.parseReferenceInput(args);
    if (!reference.book || !reference.chapter || !reference.verse) {
      throw new UserInputError('A specific verse reference is required.');
    }

    return {
      book: reference.book,
      chapter: reference.chapter,
      verse: reference.verse,
      translation: this.getRequestedTranslation(args),
    };
  }

  private requireText(value: unknown, label: string): string {
    const text = sanitizeText(value, 1000);
    if (!text) {
      throw new UserInputError(`${label} is required.`);
    }

    return text;
  }

  private parseReferenceInput(args: any): {
    book?: string;
    chapter?: number;
    verse?: number;
    startVerse?: number;
    endVerse?: number;
  } {
    if (args.book && args.chapter) {
      return {
        book: sanitizeText(args.book, 80),
        chapter: clampPositiveInteger(args.chapter, 1, 150),
        verse: args.verse === undefined ? undefined : clampPositiveInteger(args.verse, 1, 200),
      };
    }

    const reference = this.getReferenceInput(args);
    const rangeMatch = reference.match(/^(.+?)\s+(\d+):(\d+)-(\d+)$/);
    if (rangeMatch) {
      const range = clampVerseRange(Number(rangeMatch[3]), Number(rangeMatch[4]));
      return {
        book: sanitizeText(rangeMatch[1], 80),
        chapter: clampPositiveInteger(rangeMatch[2], 1, 150),
        startVerse: range.startVerse,
        endVerse: range.endVerse,
      };
    }

    const verseMatch = reference.match(/^(.+?)\s+(\d+):(\d+)$/);
    if (verseMatch) {
      return {
        book: sanitizeText(verseMatch[1], 80),
        chapter: clampPositiveInteger(verseMatch[2], 1, 150),
        verse: clampPositiveInteger(verseMatch[3], 1, 200),
      };
    }

    const chapterMatch = reference.match(/^(.+?)\s+(\d+)$/);
    if (chapterMatch) {
      return {
        book: sanitizeText(chapterMatch[1], 80),
        chapter: clampPositiveInteger(chapterMatch[2], 1, 150),
      };
    }

    return {};
  }

  private getReferenceInput(args: any): string {
    return sanitizeText(args.reference || args.verse || args.query || args.topic || '', 256);
  }

  private getRequestedTranslation(args: any): string {
    return sanitizeText(args.translation || this.config.defaultTranslation, 16).toUpperCase();
  }

  private getPrimaryInput(args: any): string {
    return sanitizeText(
      args.query ||
      args.reference ||
      args.topic ||
      args.doctrine ||
      args.word ||
      args.strongNumber ||
      args.book ||
      '',
      1000
    );
  }

  private formatReference(reference: {
    book?: string;
    chapter?: number;
    verse?: number;
    startVerse?: number;
    endVerse?: number;
  }): string {
    if (!reference.book || !reference.chapter) return '';
    if (reference.startVerse && reference.endVerse) {
      return `${reference.book} ${reference.chapter}:${reference.startVerse}-${reference.endVerse}`;
    }
    if (reference.verse) return `${reference.book} ${reference.chapter}:${reference.verse}`;
    return `${reference.book} ${reference.chapter}`;
  }

  private describePassageStructure(verses: BibleVerse[]): string[] {
    if (verses.length === 0) {
      return [
        'Read the passage boundaries carefully.',
        'Notice transitions, repeated words, commands, promises, contrasts, and conclusions.',
        'Summarize the flow from opening claim to final emphasis.',
      ];
    }

    return verses.map((verse) => `${verse.book} ${verse.chapter}:${verse.verse} - ${verse.text.slice(0, 120)}`);
  }

  private extractKeyIdeas(text: string): string[] {
    const lowered = text.toLowerCase();
    const ideas = [
      'love', 'faith', 'hope', 'grace', 'mercy', 'forgiveness', 'salvation', 'obedience',
      'judgment', 'wisdom', 'prayer', 'covenant', 'kingdom', 'righteousness', 'holiness',
    ].filter((idea) => lowered.includes(idea));

    return ideas.length > 0 ? ideas : ['context', 'meaning', 'theological message', 'application'];
  }

  private deriveMainClaim(passageText: string, keyIdeas: string[], referenceLabel: string): string {
    const cleanText = sanitizeText(passageText, 280);
    if (cleanText) {
      return cleanText.endsWith('.') ? cleanText : `${cleanText}.`;
    }

    const idea = keyIdeas.find((candidate) => !['context', 'meaning', 'theological message', 'application'].includes(candidate));
    return idea
      ? `Faithfully explain how ${referenceLabel} develops the theme of ${idea} in context.`
      : `Faithfully explain and apply ${referenceLabel} in context.`;
  }

  private inferThemes(text: string): string[] {
    const themes = this.extractKeyIdeas(text);
    return themes.length > 0 ? themes : ['God and humanity', 'covenant faithfulness', 'redemption', 'discipleship'];
  }

  private getToolNames(): string[] {
    return [
      'search_scripture',
      'get_verse_analysis',
      'find_cross_references',
      'generate_devotional',
      'explain_original_language',
      'compare_translations',
      'faith_reasoning',
      'explain_doctrine',
      'get_historical_context',
      ...SCRIPTURE_TOOL_SPECS.map((toolSpec) => toolSpec.name),
    ];
  }

  private createToolResponse(data: unknown) {
    const payload = data && typeof data === 'object' && !Array.isArray(data)
      ? attachStudySafety(data as Record<string, unknown>)
      : data;

    return {
      content: [
        {
          type: 'text',
          text: safeJson(payload),
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
    const theological = sanitizeText(context.theological || 'the passage theme', 500).replace(/\.$/u, '');
    const cultural = sanitizeText(context.cultural || '', 500);
    return `This verse from ${verse.book} ${verse.chapter}:${verse.verse} should be read in context with the broader theme of ${theological}. ${cultural} The local data includes ${crossReferences.length} cross-reference${crossReferences.length === 1 ? '' : 's'}, helping connect this verse to the broader biblical witness.`;
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
    if (readBooleanEnv('SCRIPTURE_AUTO_SEED', true)) {
      await this.db.seedSampleData();
    }
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

function readBooleanEnv(name: string, fallback: boolean): boolean {
  const value = process.env[name];
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function readNumberEnv(name: string, fallback: number): number {
  const value = process.env[name];
  if (value === undefined) return fallback;

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export function createConfigFromEnv(): ScriptureIntelligenceConfig {
  const explicitDatabasePath = process.env.SCRIPTURE_DB_PATH;
  const defaultDatabase = getDefaultDatabaseConfig();

  return {
    databasePath: explicitDatabasePath || defaultDatabase.path,
    databaseReadOnly: explicitDatabasePath
      ? readBooleanEnv('SCRIPTURE_DB_READ_ONLY', false)
      : defaultDatabase.readOnly,
    defaultTranslation: sanitizeText(process.env.DEFAULT_TRANSLATION || 'WEB', 16).toUpperCase(),
    enableOriginalLanguages: readBooleanEnv('ENABLE_ORIGINAL_LANGUAGES', true),
    enableHistoricalContext: readBooleanEnv('ENABLE_HISTORICAL_CONTEXT', true),
    enableTheologicalAnalysis: readBooleanEnv('ENABLE_THEOLOGICAL_ANALYSIS', true),
    cacheSize: clampPositiveInteger(readNumberEnv('CACHE_SIZE', 1000), 1000, 100000),
  };
}

function getDefaultDatabaseConfig(): { path: string; readOnly: boolean } {
  const bundledCandidates = [
    resolve(SERVER_DIR, '../data/scripture_public_domain.corpus'),
    resolve(PROJECT_ROOT, 'data/scripture_public_domain.corpus'),
    resolve(process.cwd(), 'dist/data/scripture_public_domain.corpus'),
    resolve(process.cwd(), 'data/scripture_public_domain.corpus'),
  ];
  const bundledCorpus = bundledCandidates.find(
    (candidate) => existsSync(candidate) && statSync(candidate).size >= MINIMUM_FULL_CORPUS_BYTES
  );

  if (bundledCorpus) {
    return { path: bundledCorpus, readOnly: true };
  }

  return {
    path: resolve(tmpdir(), `barzel-scripture-intelligence-${process.pid}.db`),
    readOnly: false,
  };
}

async function main() {
  const server = new ScriptureIntelligenceServer(createConfigFromEnv());
  await server.initialize();
  await server.run();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(console.error);
}
