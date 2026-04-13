export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
  originalHebrew?: string;
  originalGreek?: string;
  strongNumbers?: string[];
}

export interface CrossReference {
  verse: BibleVerse;
  references: BibleVerse[];
  relationship: string;
  theologicalTheme?: string;
}

export interface HistoricalContext {
  period: string;
  culturalBackground: string;
  politicalSituation: string;
  religiousContext: string;
}

export interface LinguisticAnalysis {
  originalLanguage: 'hebrew' | 'greek' | 'aramaic';
  originalWord: string;
  transliteration: string;
  strongNumber: string;
  meaning: string;
  usage: string;
  relatedWords: string[];
}

export interface TheologicalTheme {
  name: string;
  description: string;
  keyVerses: BibleVerse[];
  relatedThemes: string[];
  historicalDevelopment: string;
}

export interface Devotional {
  id: string;
  title: string;
  scripture: BibleVerse[];
  reflection: string;
  prayer: string;
  application: string;
  date: string;
  theme?: string;
}

export interface QueryResult {
  verses: BibleVerse[];
  explanation: string;
  context: HistoricalContext;
  crossReferences: CrossReference[];
  linguisticInsights: LinguisticAnalysis[];
  theologicalThemes: TheologicalTheme[];
  relatedDevotionals: Devotional[];
}

export interface NaturalLanguageQuery {
  text: string;
  intent: 'search' | 'explain' | 'compare' | 'apply' | 'devotional';
  entities: {
    books?: string[];
    chapters?: number[];
    verses?: number[];
    topics?: string[];
    themes?: string[];
  };
  context?: string;
}

export interface ScriptureIntelligenceConfig {
  databasePath: string;
  defaultTranslation: string;
  enableOriginalLanguages: boolean;
  enableHistoricalContext: boolean;
  enableTheologicalAnalysis: boolean;
  cacheSize: number;
}
