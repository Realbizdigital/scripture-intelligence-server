import { Database } from 'sqlite3';
import { BibleVerse, CrossReference, HistoricalContext, LinguisticAnalysis, TheologicalTheme } from '../types/index.js';

export class BibleDatabase {
  private db: Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
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
        `, (err) => {
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
        verse.translation,
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

  async searchVerses(query: string, books?: string[], limit: number = 50): Promise<BibleVerse[]> {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT * FROM verses 
        WHERE text LIKE ? 
      `;
      const params: any[] = [`%${query}%`];

      if (books && books.length > 0) {
        sql += ` AND book IN (${books.map(() => '?').join(',')})`;
        params.push(...books);
      }

      sql += ` ORDER BY book, chapter, verse LIMIT ?`;
      params.push(limit);

      this.db.all(sql, params, (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          const verses = rows.map(row => ({
            book: row.book,
            chapter: row.chapter,
            verse: row.verse,
            text: row.text,
            translation: row.translation,
            originalHebrew: row.original_hebrew,
            originalGreek: row.original_greek,
            strongNumbers: row.strong_numbers ? row.strong_numbers.split(',') : undefined
          }));
          resolve(verses);
        }
      });
    });
  }

  async getVerse(book: string, chapter: number, verse: number): Promise<BibleVerse | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM verses WHERE book = ? AND chapter = ? AND verse = ?',
        [book, chapter, verse],
        (err, row: any) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve({
              book: row.book,
              chapter: row.chapter,
              verse: row.verse,
              text: row.text,
              translation: row.translation,
              originalHebrew: row.original_hebrew,
              originalGreek: row.original_greek,
              strongNumbers: row.strong_numbers ? row.strong_numbers.split(',') : undefined
            });
          } else {
            resolve(null);
          }
        }
      );
    });
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
      this.db.get(
        `SELECT * FROM historical_context 
         WHERE book = ? AND (chapter_start IS NULL OR chapter_start <= ?) 
         AND (chapter_end IS NULL OR chapter_end >= ?)`,
        [book, chapter, chapter],
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
      this.db.all(
        'SELECT * FROM linguistic_analysis WHERE book = ? AND chapter = ? AND verse = ? ORDER BY word_position',
        [book, chapter, verse],
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
        sql += ` AND tv.book = ?`;
        params.push(book);
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
              LIMIT 5
            `;
            
            const keyVerses = await new Promise<BibleVerse[]>((versesResolve, versesReject) => {
              this.db.all(keyVersesQuery, [row.id], (versesErr, versesRows: any[]) => {
                if (versesErr) {
                  versesReject(versesErr);
                } else {
                  versesResolve(versesRows.map(v => ({
                    book: v.book,
                    chapter: v.chapter,
                    verse: v.verse,
                    text: v.text,
                    translation: v.translation
                  })));
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
}
