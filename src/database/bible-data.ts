import sqlite3 from 'sqlite3';
import { BibleVerse, CrossReference, HistoricalContext, LinguisticAnalysis, TheologicalTheme } from '../types/index.js';
import {
  SAMPLE_CROSS_REFERENCES,
  SAMPLE_HISTORICAL_CONTEXTS,
  SAMPLE_LINGUISTIC_ANALYSES,
  SAMPLE_THEOLOGICAL_THEMES,
  SAMPLE_VERSES,
} from './sample-data.js';
import { getBookNameCandidates } from './book-names.js';

type TranslationLookupOptions = {
  fallback?: boolean;
};

export class BibleDatabase {
  private db: sqlite3.Database;
  private readonly maxSearchLimit = 50;
  private readonly maxPassageVerses = 200;
  private readonly defaultTranslation: string;

  constructor(dbPath: string, defaultTranslation = 'WEB') {
    this.db = new sqlite3.Database(dbPath);
    this.defaultTranslation = this.normalizeTranslation(defaultTranslation);
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Create verses table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS verses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book TEXT NOT NULL,
            chapter INTEGER NOT NULL,
            verse INTEGER NOT NULL,
            text TEXT NOT NULL,
            translation TEXT NOT NULL,
            original_hebrew TEXT,
            original_greek TEXT,
            strong_numbers TEXT,
            UNIQUE(book, chapter, verse, translation)
          )
        `);

        // Create cross_references table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS cross_references (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_book TEXT NOT NULL,
            source_chapter INTEGER NOT NULL,
            source_verse INTEGER NOT NULL,
            target_book TEXT NOT NULL,
            target_chapter INTEGER NOT NULL,
            target_verse INTEGER NOT NULL,
            relationship TEXT NOT NULL,
            theological_theme TEXT
          )
        `);

        // Create historical_context table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS historical_context (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book TEXT NOT NULL,
            chapter_start INTEGER,
            chapter_end INTEGER,
            period TEXT NOT NULL,
            cultural_background TEXT NOT NULL,
            political_situation TEXT NOT NULL,
            religious_context TEXT NOT NULL
          )
        `);

        // Create linguistic_analysis table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS linguistic_analysis (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book TEXT NOT NULL,
            chapter INTEGER NOT NULL,
            verse INTEGER NOT NULL,
            word_position INTEGER NOT NULL,
            original_language TEXT NOT NULL,
            original_word TEXT NOT NULL,
            transliteration TEXT NOT NULL,
            strong_number TEXT NOT NULL,
            meaning TEXT NOT NULL,
            usage TEXT NOT NULL,
            related_words TEXT
          )
        `);

        // Create theological_themes table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS theological_themes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT NOT NULL,
            historical_development TEXT NOT NULL
          )
        `);

        // Create theme_verses junction table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS theme_verses (
            theme_id INTEGER,
            book TEXT NOT NULL,
            chapter INTEGER NOT NULL,
            verse INTEGER NOT NULL,
            FOREIGN KEY (theme_id) REFERENCES theological_themes (id)
          )
        `);

        this.db.run('CREATE INDEX IF NOT EXISTS idx_verses_reference ON verses(book, chapter, verse)');
        this.db.run('CREATE INDEX IF NOT EXISTS idx_verses_reference_translation ON verses(book, chapter, verse, translation)');
        this.db.run('CREATE INDEX IF NOT EXISTS idx_verses_translation_reference ON verses(translation, book, chapter, verse)');
        this.db.run('CREATE INDEX IF NOT EXISTS idx_verses_text ON verses(text)');
        this.db.run('CREATE INDEX IF NOT EXISTS idx_cross_references_source ON cross_references(source_book, source_chapter, source_verse)');
        this.db.run('CREATE INDEX IF NOT EXISTS idx_historical_context_lookup ON historical_context(book, chapter_start, chapter_end)');
        this.db.run('CREATE INDEX IF NOT EXISTS idx_linguistic_analysis_lookup ON linguistic_analysis(book, chapter, verse)');
        this.db.run('CREATE INDEX IF NOT EXISTS idx_theme_verses_lookup ON theme_verses(book, chapter, verse)', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }

  async addVerse(verse: BibleVerse): Promise<void> {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO verses 
        (book, chapter, verse, text, translation, original_hebrew, original_greek, strong_numbers)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run([
        verse.book,
        verse.chapter,
        verse.verse,
        verse.text,
        this.normalizeTranslation(verse.translation),
        verse.originalHebrew || null,
        verse.originalGreek || null,
        verse.strongNumbers ? verse.strongNumbers.join(',') : null
      ], function(err) {
        if (err) reject(err);
        else resolve();
      });
      
      stmt.finalize();
    });
  }

  async addVersesBulk(verses: BibleVerse[]): Promise<void> {
    if (verses.length === 0) return;

    return new Promise((resolve, reject) => {
      let settled = false;
      const finishWithError = (error: Error) => {
        if (settled) return;
        settled = true;
        this.db.run('ROLLBACK', () => reject(error));
      };

      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');
        const stmt = this.db.prepare(`
          INSERT OR REPLACE INTO verses
          (book, chapter, verse, text, translation, original_hebrew, original_greek, strong_numbers)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const verse of verses) {
          stmt.run([
            verse.book,
            verse.chapter,
            verse.verse,
            verse.text,
            this.normalizeTranslation(verse.translation),
            verse.originalHebrew || null,
            verse.originalGreek || null,
            verse.strongNumbers ? verse.strongNumbers.join(',') : null,
          ], (err) => {
            if (err) finishWithError(err);
          });
        }

        stmt.finalize((finalizeError) => {
          if (finalizeError) {
            finishWithError(finalizeError);
            return;
          }

          this.db.run('COMMIT', (commitError) => {
            if (commitError) {
              finishWithError(commitError);
            } else if (!settled) {
              settled = true;
              resolve();
            }
          });
        });
      });
    });
  }

  async countVersesForTranslation(translation: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT COUNT(*) AS count FROM verses WHERE translation = ?',
        [this.normalizeTranslation(translation)],
        (err, row: any) => {
          if (err) reject(err);
          else resolve(Number(row?.count || 0));
        }
      );
    });
  }

  async getAvailableTranslations(): Promise<Array<{ translation: string; verses: number }>> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT translation, COUNT(*) AS verses
         FROM verses
         GROUP BY translation
         ORDER BY translation`,
        [],
        (err, rows: any[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows.map((row) => ({
              translation: row.translation,
              verses: Number(row.verses || 0),
            })));
          }
        }
      );
    });
  }

  private async runStatement(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async addCrossReference(
    sourceBook: string,
    sourceChapter: number,
    sourceVerse: number,
    targetBook: string,
    targetChapter: number,
    targetVerse: number,
    relationship: string,
    theologicalTheme?: string
  ): Promise<void> {
    await this.runStatement(
      `INSERT OR REPLACE INTO cross_references
       (source_book, source_chapter, source_verse, target_book, target_chapter, target_verse, relationship, theological_theme)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [sourceBook, sourceChapter, sourceVerse, targetBook, targetChapter, targetVerse, relationship, theologicalTheme || null]
    );
  }

  async addHistoricalContext(
    book: string,
    chapterStart: number,
    chapterEnd: number,
    period: string,
    culturalBackground: string,
    politicalSituation: string,
    religiousContext: string
  ): Promise<void> {
    await this.runStatement(
      `INSERT OR REPLACE INTO historical_context
       (book, chapter_start, chapter_end, period, cultural_background, political_situation, religious_context)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [book, chapterStart, chapterEnd, period, culturalBackground, politicalSituation, religiousContext]
    );
  }

  async addLinguisticAnalysis(
    book: string,
    chapter: number,
    verse: number,
    wordPosition: number,
    originalLanguage: string,
    originalWord: string,
    transliteration: string,
    strongNumber: string,
    meaning: string,
    usage: string,
    relatedWords: string
  ): Promise<void> {
    await this.runStatement(
      `INSERT OR REPLACE INTO linguistic_analysis
       (book, chapter, verse, word_position, original_language, original_word, transliteration, strong_number, meaning, usage, related_words)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [book, chapter, verse, wordPosition, originalLanguage, originalWord, transliteration, strongNumber, meaning, usage, relatedWords]
    );
  }

  async addTheologicalTheme(name: string, description: string, historicalDevelopment: string): Promise<void> {
    await this.runStatement(
      'INSERT OR REPLACE INTO theological_themes (name, description, historical_development) VALUES (?, ?, ?)',
      [name, description, historicalDevelopment]
    );
  }

  async seedSampleData(options: { force?: boolean } = {}): Promise<{ seeded: boolean; verses: number }> {
    const alreadySeeded = await this.getVerse('John', 3, 16);
    if (alreadySeeded && !options.force) {
      return { seeded: false, verses: 0 };
    }

    for (const verse of SAMPLE_VERSES) {
      await this.addVerse(verse);
    }

    for (const ref of SAMPLE_CROSS_REFERENCES) {
      await this.addCrossReference(
        ref.sourceBook,
        ref.sourceChapter,
        ref.sourceVerse,
        ref.targetBook,
        ref.targetChapter,
        ref.targetVerse,
        ref.relationship,
        ref.theologicalTheme
      );
    }

    for (const context of SAMPLE_HISTORICAL_CONTEXTS) {
      await this.addHistoricalContext(
        context.book,
        context.chapterStart,
        context.chapterEnd,
        context.period,
        context.culturalBackground,
        context.politicalSituation,
        context.religiousContext
      );
    }

    for (const analysis of SAMPLE_LINGUISTIC_ANALYSES) {
      await this.addLinguisticAnalysis(
        analysis.book,
        analysis.chapter,
        analysis.verse,
        analysis.wordPosition,
        analysis.originalLanguage,
        analysis.originalWord,
        analysis.transliteration,
        analysis.strongNumber,
        analysis.meaning,
        analysis.usage,
        analysis.relatedWords
      );
    }

    for (const theme of SAMPLE_THEOLOGICAL_THEMES) {
      await this.addTheologicalTheme(theme.name, theme.description, theme.historicalDevelopment);
    }

    return { seeded: true, verses: SAMPLE_VERSES.length };
  }

  async searchVerses(
    query: string,
    books?: string[],
    limit: number = 50,
    translation?: string,
    options: TranslationLookupOptions = {}
  ): Promise<BibleVerse[]> {
    const preferredTranslation = this.normalizeTranslation(translation);
    const allowFallback = options.fallback ?? true;
    const runSearch = (useTranslationFilter: boolean) => new Promise<BibleVerse[]>((resolve, reject) => {
      const safeLimit = this.clampLimit(limit);
      const safeQuery = String(query || '').slice(0, 8000);
      const safeBooks = books?.slice(0, 12).map((book) => String(book).slice(0, 80)).filter(Boolean);
      let sql = `
        SELECT * FROM verses 
        WHERE text LIKE ?
      `;
      const params: any[] = [`%${safeQuery}%`];

      if (useTranslationFilter) {
        sql += ' AND translation = ?';
        params.push(preferredTranslation);
      }

      if (safeBooks && safeBooks.length > 0) {
        const candidateBooks = [
          ...new Set(safeBooks.flatMap((book) => getBookNameCandidates(book)).map((book) => book.toLowerCase()))
        ];
        sql += ` AND LOWER(book) IN (${candidateBooks.map(() => '?').join(',')})`;
        params.push(...candidateBooks);
      }

      sql += ` ORDER BY book, chapter, verse LIMIT ?`;
      params.push(safeLimit);

      this.db.all(sql, params, (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          const verses = rows.map((row) => this.mapVerseRow(row));
          resolve(verses);
        }
      });
    });

    const preferredResults = await runSearch(true);
    return preferredResults.length > 0 ? preferredResults : allowFallback ? await runSearch(false) : [];
  }

  async getVerse(
    book: string,
    chapter: number,
    verse: number,
    translation?: string,
    options: TranslationLookupOptions = {}
  ): Promise<BibleVerse | null> {
    const preferredTranslation = this.normalizeTranslation(translation);
    const allowFallback = options.fallback ?? true;
    const runLookup = (useTranslationFilter: boolean) => new Promise<BibleVerse | null>((resolve, reject) => {
      const bookFilter = this.bookFilter(book);
      const params: any[] = [...bookFilter.params, chapter, verse];
      let sql = `SELECT * FROM verses WHERE ${bookFilter.clause} AND chapter = ? AND verse = ?`;

      if (useTranslationFilter) {
        sql += ' AND translation = ?';
        params.push(preferredTranslation);
      }

      sql += ' ORDER BY translation = ? DESC, translation LIMIT 1';
      params.push(preferredTranslation);

      this.db.get(
        sql,
        params,
        (err, row: any) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve(this.mapVerseRow(row));
          } else {
            resolve(null);
          }
        }
      );
    });

    const preferredResult = await runLookup(true);
    return preferredResult ?? (allowFallback ? await runLookup(false) : null);
  }

  async getChapter(
    book: string,
    chapter: number,
    translation?: string,
    options: TranslationLookupOptions = {}
  ): Promise<BibleVerse[]> {
    const preferredTranslation = this.normalizeTranslation(translation);
    const allowFallback = options.fallback ?? true;
    const runLookup = (useTranslationFilter: boolean) => new Promise<BibleVerse[]>((resolve, reject) => {
      const bookFilter = this.bookFilter(book);
      const params: any[] = [...bookFilter.params, chapter];
      let sql = `SELECT * FROM verses WHERE ${bookFilter.clause} AND chapter = ?`;

      if (useTranslationFilter) {
        sql += ' AND translation = ?';
        params.push(preferredTranslation);
      }

      sql += ' ORDER BY verse';

      this.db.all(
        sql,
        params,
        (err, rows: any[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows.map((row) => this.mapVerseRow(row)));
          }
        }
      );
    });

    const preferredResults = await runLookup(true);
    return preferredResults.length > 0 ? preferredResults : allowFallback ? await runLookup(false) : [];
  }

  async getPassage(
    book: string,
    chapter: number,
    startVerse: number,
    endVerse: number,
    translation?: string,
    options: TranslationLookupOptions = {}
  ): Promise<BibleVerse[]> {
    const safeStart = Math.max(1, Math.floor(startVerse));
    const safeEnd = Math.min(
      Math.max(safeStart, Math.floor(endVerse)),
      safeStart + this.maxPassageVerses - 1
    );
    const preferredTranslation = this.normalizeTranslation(translation);
    const allowFallback = options.fallback ?? true;
    const runLookup = (useTranslationFilter: boolean) => new Promise<BibleVerse[]>((resolve, reject) => {
      const bookFilter = this.bookFilter(book);
      const params: any[] = [...bookFilter.params, chapter, safeStart, safeEnd];
      let sql = `SELECT * FROM verses
         WHERE ${bookFilter.clause} AND chapter = ? AND verse >= ? AND verse <= ?`;

      if (useTranslationFilter) {
        sql += ' AND translation = ?';
        params.push(preferredTranslation);
      }

      sql += ' ORDER BY verse';

      this.db.all(
        sql,
        params,
        (err, rows: any[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows.map((row) => this.mapVerseRow(row)));
          }
        }
      );
    });

    const preferredResults = await runLookup(true);
    return preferredResults.length > 0 ? preferredResults : allowFallback ? await runLookup(false) : [];
  }

  async getCrossReferences(book: string, chapter: number, verse: number): Promise<CrossReference[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM cross_references 
         WHERE source_book = ? AND source_chapter = ? AND source_verse = ?`,
        [book, chapter, verse],
        async (err, rows: any[]) => {
          if (err) {
            reject(err);
          } else {
            const crossRefs: CrossReference[] = [];
            
            for (const row of rows) {
              const sourceVerse = await this.getVerse(row.source_book, row.source_chapter, row.source_verse);
              const targetVerse = await this.getVerse(row.target_book, row.target_chapter, row.target_verse);
              
              if (sourceVerse && targetVerse) {
                crossRefs.push({
                  verse: sourceVerse,
                  references: [targetVerse],
                  relationship: row.relationship,
                  theologicalTheme: row.theological_theme
                });
              }
            }
            
            resolve(crossRefs);
          }
        }
      );
    });
  }

  async getHistoricalContext(book: string, chapter: number): Promise<HistoricalContext | null> {
    return new Promise((resolve, reject) => {
      const bookFilter = this.bookFilter(book);
      this.db.get(
        `SELECT * FROM historical_context 
         WHERE ${bookFilter.clause} AND (chapter_start IS NULL OR chapter_start <= ?)
         AND (chapter_end IS NULL OR chapter_end >= ?)`,
        [...bookFilter.params, chapter, chapter],
        (err, row: any) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve({
              period: row.period,
              culturalBackground: row.cultural_background,
              politicalSituation: row.political_situation,
              religiousContext: row.religious_context
            });
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  async getLinguisticAnalysis(book: string, chapter: number, verse: number): Promise<LinguisticAnalysis[]> {
    return new Promise((resolve, reject) => {
      const bookFilter = this.bookFilter(book);
      this.db.all(
        `SELECT * FROM linguistic_analysis
         WHERE ${bookFilter.clause} AND chapter = ? AND verse = ?
         ORDER BY word_position`,
        [...bookFilter.params, chapter, verse],
        (err, rows: any[]) => {
          if (err) {
            reject(err);
          } else {
            const analyses = rows.map(row => ({
              originalLanguage: row.original_language as 'hebrew' | 'greek' | 'aramaic',
              originalWord: row.original_word,
              transliteration: row.transliteration,
              strongNumber: row.strong_number,
              meaning: row.meaning,
              usage: row.usage,
              relatedWords: row.related_words ? row.related_words.split(',') : []
            }));
            resolve(analyses);
          }
        }
      );
    });
  }

  async getTheologicalThemes(book?: string, chapter?: number, verse?: number): Promise<TheologicalTheme[]> {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT DISTINCT t.* FROM theological_themes t
        JOIN theme_verses tv ON t.id = tv.theme_id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (book) {
        const bookFilter = this.bookFilter(book);
        sql += ` AND LOWER(tv.book) IN (${bookFilter.params.map(() => '?').join(',')})`;
        params.push(...bookFilter.params);
      }
      if (chapter) {
        sql += ` AND tv.chapter = ?`;
        params.push(chapter);
      }
      if (verse) {
        sql += ` AND tv.verse = ?`;
        params.push(verse);
      }

      this.db.all(sql, params, async (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          const themes: TheologicalTheme[] = [];
          
          for (const row of rows) {
            const keyVersesQuery = `
              SELECT v.* FROM verses v
              JOIN theme_verses tv ON v.book = tv.book AND v.chapter = tv.chapter AND v.verse = tv.verse
              WHERE tv.theme_id = ?
              AND v.translation = ?
              LIMIT 5
            `;
            
            const keyVerses = await new Promise<BibleVerse[]>((versesResolve, versesReject) => {
              this.db.all(keyVersesQuery, [row.id, this.defaultTranslation], (versesErr, versesRows: any[]) => {
                if (versesErr) {
                  versesReject(versesErr);
                } else {
                  versesResolve(versesRows.map((v) => this.mapVerseRow(v)));
                }
              });
            });

            themes.push({
              name: row.name,
              description: row.description,
              keyVerses,
              relatedThemes: [],
              historicalDevelopment: row.historical_development
            });
          }
          
          resolve(themes);
        }
      });
    });
  }

  close(): void {
    this.db.close();
  }

  private mapVerseRow(row: any): BibleVerse {
    return {
      book: row.book,
      chapter: row.chapter,
      verse: row.verse,
      text: row.text,
      translation: row.translation,
      originalHebrew: row.original_hebrew,
      originalGreek: row.original_greek,
      strongNumbers: row.strong_numbers ? row.strong_numbers.split(',') : undefined
    };
  }

  private normalizeTranslation(translation?: string): string {
    return String(translation || this.defaultTranslation || 'WEB').trim().toUpperCase();
  }

  private bookFilter(book: string): { clause: string; params: string[] } {
    const candidates = getBookNameCandidates(book).map((candidate) => candidate.toLowerCase());
    return {
      clause: `LOWER(book) IN (${candidates.map(() => '?').join(',')})`,
      params: candidates,
    };
  }

  private clampLimit(limit: number): number {
    if (!Number.isFinite(limit)) return this.maxSearchLimit;
    return Math.max(1, Math.min(Math.floor(limit), this.maxSearchLimit));
  }
}
