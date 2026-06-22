import { BibleVerse, CrossReference } from '../types/index.js';
import { BibleDatabase } from '../database/bible-data.js';

export class CrossReferenceEngine {
  private db: BibleDatabase;

  constructor(db: BibleDatabase) {
    this.db = db;
  }

  async findCrossReferences(verse: BibleVerse): Promise<CrossReference[]> {
    const directRefs = await this.db.getCrossReferences(verse.book, verse.chapter, verse.verse);
    const thematicRefs = await this.findThematicReferences(verse);
    const semanticRefs = await this.findSemanticReferences(verse);

    // Combine and deduplicate references
    const allRefs = [...directRefs, ...thematicRefs, ...semanticRefs];
    const uniqueRefs = this.deduplicateReferences(allRefs);

    return uniqueRefs.sort((a, b) => this.calculateRelevanceScore(b) - this.calculateRelevanceScore(a));
  }

  private async findThematicReferences(verse: BibleVerse): Promise<CrossReference[]> {
    const themes = await this.db.getTheologicalThemes(verse.book, verse.chapter, verse.verse);
    const references: CrossReference[] = [];

    for (const theme of themes) {
      // Find other verses with the same theological theme
      for (const keyVerse of theme.keyVerses) {
        if (this.isDifferentVerse(keyVerse, verse)) {
          references.push({
            verse,
            references: [keyVerse],
            relationship: `theological theme: ${theme.name}`,
            theologicalTheme: theme.name
          });
        }
      }
    }

    return references;
  }

  private async findSemanticReferences(verse: BibleVerse): Promise<CrossReference[]> {
    // Extract key concepts from the verse text
    const concepts = this.extractKeyConcepts(verse.text);
    const references: CrossReference[] = [];

    for (const concept of concepts) {
      // Search for verses containing similar concepts
      const similarVerses = await this.db.searchVerses(concept, undefined, 10);
      
      for (const similarVerse of similarVerses) {
        if (this.isDifferentVerse(similarVerse, verse)) {
          const similarity = this.calculateSemanticSimilarity(verse.text, similarVerse.text);
          
          if (similarity > 0.3) { // Threshold for semantic similarity
            references.push({
              verse,
              references: [similarVerse],
              relationship: `semantic similarity: ${concept}`,
              theologicalTheme: concept
            });
          }
        }
      }
    }

    return references;
  }

  private extractKeyConcepts(text: string): string[] {
    // Common biblical concepts and keywords
    const biblicalConcepts = [
      'love', 'faith', 'hope', 'grace', 'mercy', 'forgiveness', 'salvation', 'redemption',
      'sin', 'righteousness', 'holiness', 'prayer', 'worship', 'trinity', 'christ', 'jesus',
      'god', 'holy spirit', 'kingdom', 'heaven', 'judgment', 'creation', 'covenant', 'law',
      'prophecy', 'church', 'baptism', 'marriage', 'suffering', 'joy', 'peace', 'wisdom',
      'truth', 'light', 'evil', 'miracles', 'resurrection', 'eternal life', 'commandment',
      'sabbath', 'temple', 'altar', 'sacrifice', 'offering', 'priest', 'prophet', 'apostle',
      'disciple', 'gospel', 'scripture', 'word', 'spirit', 'flesh', 'soul', 'heart', 'mind',
      'strength', 'power', 'glory', 'honor', 'praise', 'blessing', 'curse', 'temptation',
      'trial', 'tribulation', 'perseverance', 'patience', 'kindness', 'goodness'
    ];

    const foundConcepts: string[] = [];
    const words = text.toLowerCase().split(/\s+/);

    for (const concept of biblicalConcepts) {
      if (words.some(word => word.includes(concept) || concept.includes(word))) {
        foundConcepts.push(concept);
      }
    }

    return foundConcepts;
  }

  private calculateSemanticSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 2));
    const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 2));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private calculateRelevanceScore(ref: CrossReference): number {
    let score = 0;

    // Direct cross-references get highest score
    if (ref.relationship.includes('direct') || ref.relationship.includes('quot')) {
      score += 10;
    }

    // Theological themes get medium score
    if (ref.relationship.includes('theological')) {
      score += 7;
    }

    // Semantic similarity gets lower score
    if (ref.relationship.includes('semantic')) {
      score += 3;
    }

    // Boost score for New Testament references to Old Testament (fulfillment)
    if (this.isOldTestament(ref.verse.book) && 
        ref.references.some(r => this.isNewTestament(r.book))) {
      score += 5;
    }

    return score;
  }

  private deduplicateReferences(refs: CrossReference[]): CrossReference[] {
    const seen = new Set<string>();
    const unique: CrossReference[] = [];

    for (const ref of refs) {
      for (const reference of ref.references) {
        const key = `${reference.book}:${reference.chapter}:${reference.verse}`;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(ref);
          break; // Only add the cross-reference once even if it has multiple target verses
        }
      }
    }

    return unique;
  }

  private isDifferentVerse(verse1: BibleVerse, verse2: BibleVerse): boolean {
    return verse1.book !== verse2.book || 
           verse1.chapter !== verse2.chapter || 
           verse1.verse !== verse2.verse;
  }

  private isOldTestament(book: string): boolean {
    const otBooks = [
      'genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy',
      'joshua', 'judges', 'ruth', '1 samuel', '2 samuel', '1 kings', '2 kings',
      '1 chronicles', '2 chronicles', 'ezra', 'nehemiah', 'esther',
      'job', 'psalms', 'proverbs', 'ecclesiastes', 'song of solomon',
      'isaiah', 'jeremiah', 'lamentations', 'ezekiel', 'daniel',
      'hosea', 'joel', 'amos', 'obadiah', 'jonah', 'micah', 'nahum', 
      'habakkuk', 'zephaniah', 'haggai', 'zechariah', 'malachi'
    ];
    return otBooks.includes(book.toLowerCase());
  }

  private isNewTestament(book: string): boolean {
    const ntBooks = [
      'matthew', 'mark', 'luke', 'john', 'acts',
      'romans', '1 corinthians', '2 corinthians', 'galatians', 'ephesians', 
      'philippians', 'colossians', '1 thessalonians', '2 thessalonians',
      '1 timothy', '2 timothy', 'titus', 'philemon', 'hebrews', 'james',
      '1 peter', '2 peter', '1 john', '2 john', '3 john', 'jude', 'revelation'
    ];
    return ntBooks.includes(book.toLowerCase());
  }

  async findParallelPassages(verse: BibleVerse): Promise<CrossReference[]> {
    // Find parallel passages in the Gospels
    if (this.isGospel(verse.book)) {
      return this.findGospelParallels(verse);
    }

    // Find parallel passages in Kings/Chronicles
    if (verse.book.toLowerCase().includes('kings') || verse.book.toLowerCase().includes('chronicles')) {
      return this.findKingsChroniclesParallels(verse);
    }

    return [];
  }

  private isGospel(book: string): boolean {
    const gospels = ['matthew', 'mark', 'luke', 'john'];
    return gospels.includes(book.toLowerCase());
  }

  private async findGospelParallels(verse: BibleVerse): Promise<CrossReference[]> {
    const parallels: CrossReference[] = [];
    const gospels = ['matthew', 'mark', 'luke', 'john'].filter(g => g !== verse.book.toLowerCase());

    // Search for similar content in other Gospels
    const concepts = this.extractKeyConcepts(verse.text);
    
    for (const gospel of gospels) {
      const similarVerses = await this.db.searchVerses(concepts.join(' '), [gospel], 5);
      
      for (const similarVerse of similarVerses) {
        const similarity = this.calculateSemanticSimilarity(verse.text, similarVerse.text);
        
        if (similarity > 0.4) {
          parallels.push({
            verse,
            references: [similarVerse],
            relationship: 'gospel parallel'
          });
        }
      }
    }

    return parallels;
  }

  private async findKingsChroniclesParallels(verse: BibleVerse): Promise<CrossReference[]> {
    const parallels: CrossReference[] = [];
    const isKings = verse.book.toLowerCase().includes('kings');
    const isChronicles = verse.book.toLowerCase().includes('chronicles');
    
    if (isKings) {
      // Search in Chronicles
      const chroniclesBooks = ['1 chronicles', '2 chronicles'];
      const similarVerses = await this.db.searchVerses(verse.text, chroniclesBooks, 3);
      
      for (const similarVerse of similarVerses) {
        parallels.push({
          verse,
          references: [similarVerse],
          relationship: 'kings-chronicles parallel'
        });
      }
    } else if (isChronicles) {
      // Search in Kings
      const kingsBooks = ['1 kings', '2 kings'];
      const similarVerses = await this.db.searchVerses(verse.text, kingsBooks, 3);
      
      for (const similarVerse of similarVerses) {
        parallels.push({
          verse,
          references: [similarVerse],
          relationship: 'chronicles-kings parallel'
        });
      }
    }

    return parallels;
  }
}
