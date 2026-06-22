import { BibleVerse, LinguisticAnalysis } from '../types/index.js';
import { BibleDatabase } from '../database/bible-data.js';

export class OriginalLanguagesProcessor {
  private db: BibleDatabase;

  constructor(db: BibleDatabase) {
    this.db = db;
  }

  async getOriginalLanguageInsights(verse: BibleVerse): Promise<{
    hebrewInsights?: LinguisticAnalysis[];
    greekInsights?: LinguisticAnalysis[];
    keyWords: string[];
    wordStudies: Array<{
      word: string;
      original: string;
      transliteration: string;
      strongNumber: string;
      meaning: string;
      theologicalSignificance: string;
    }>;
  }> {
    const linguisticAnalysis = await this.db.getLinguisticAnalysis(verse.book, verse.chapter, verse.verse);
    
    const hebrewInsights = linguisticAnalysis.filter(analysis => analysis.originalLanguage === 'hebrew');
    const greekInsights = linguisticAnalysis.filter(analysis => analysis.originalLanguage === 'greek');
    
    const keyWords = this.extractKeyWords(verse, linguisticAnalysis);
    const wordStudies = await this.generateWordStudies(keyWords, linguisticAnalysis);
    
    return {
      hebrewInsights: hebrewInsights.length > 0 ? hebrewInsights : undefined,
      greekInsights: greekInsights.length > 0 ? greekInsights : undefined,
      keyWords,
      wordStudies
    };
  }

  async explainHebrewWord(word: string, _context?: string): Promise<{
    word: string;
    transliteration: string;
    strongNumber: string;
    meaning: string;
    usage: string;
    theologicalSignificance: string;
    relatedWords: string[];
    bibleUsage: Array<{
      reference: string;
      context: string;
      significance: string;
    }>;
  }> {
    const hebrewLexicon = this.getHebrewLexicon();
    const wordInfo = hebrewLexicon[word.toLowerCase()] || hebrewLexicon[this.findSimilarHebrewWord(word)];
    
    if (!wordInfo) {
      throw new Error(`Hebrew word "${word}" not found in lexicon`);
    }

    const bibleUsage = await this.findBibleUsage(word, 'hebrew');
    
    return {
      word,
      transliteration: wordInfo.transliteration,
      strongNumber: wordInfo.strongNumber,
      meaning: wordInfo.meaning,
      usage: wordInfo.usage,
      theologicalSignificance: wordInfo.theologicalSignificance,
      relatedWords: wordInfo.relatedWords,
      bibleUsage
    };
  }

  async explainGreekWord(word: string, _context?: string): Promise<{
    word: string;
    transliteration: string;
    strongNumber: string;
    meaning: string;
    usage: string;
    theologicalSignificance: string;
    relatedWords: string[];
    bibleUsage: Array<{
      reference: string;
      context: string;
      significance: string;
    }>;
  }> {
    const greekLexicon = this.getGreekLexicon();
    const wordInfo = greekLexicon[word.toLowerCase()] || greekLexicon[this.findSimilarGreekWord(word)];
    
    if (!wordInfo) {
      throw new Error(`Greek word "${word}" not found in lexicon`);
    }

    const bibleUsage = await this.findBibleUsage(word, 'greek');
    
    return {
      word,
      transliteration: wordInfo.transliteration,
      strongNumber: wordInfo.strongNumber,
      meaning: wordInfo.meaning,
      usage: wordInfo.usage,
      theologicalSignificance: wordInfo.theologicalSignificance,
      relatedWords: wordInfo.relatedWords,
      bibleUsage
    };
  }

  async compareTranslations(verseReference: string): Promise<{
    reference: string;
    translations: Array<{
      name: string;
      text?: string;
      available: boolean;
      note?: string;
      characteristics: string;
      originalLanguageInsights: string[];
    }>;
    keyDifferences: string[];
    theologicalImplications: string;
  }> {
    const { book, chapter, verse } = this.parseReference(verseReference);
    if (!book || !chapter || !verse) {
      throw new Error('Invalid verse reference');
    }

    // This would ideally query multiple translation databases
    // For now, we'll simulate with common translations
    const translations = [
      {
        name: 'ESV',
        text: await this.getTranslationText(book, chapter, verse, 'ESV'),
        available: false,
        characteristics: 'Essentially literal translation, emphasizing word-for-word accuracy while maintaining readability',
        originalLanguageInsights: ['Maintains Hebrew/Greek word order', 'Emphasizes theological precision']
      },
      {
        name: 'NIV',
        text: await this.getTranslationText(book, chapter, verse, 'NIV'),
        available: false,
        characteristics: 'Dynamic equivalence translation, balancing accuracy with contemporary readability',
        originalLanguageInsights: ['Focuses on meaning over form', 'Uses contemporary idioms']
      },
      {
        name: 'KJV',
        text: await this.getTranslationText(book, chapter, verse, 'KJV'),
        available: false,
        characteristics: 'Formal equivalence translation using traditional language, influential in English-speaking Christianity',
        originalLanguageInsights: ['Preserves traditional renderings', 'Uses formal language structure']
      }
    ].map((translation) => ({
      ...translation,
      available: Boolean(translation.text),
      note: translation.text ? undefined : 'This translation text is not loaded in the local database. Add a licensed or public-domain translation dataset to compare wording directly.',
    }));

    const keyDifferences = this.identifyTranslationDifferences(translations);
    const theologicalImplications = this.analyzeTheologicalImplications(keyDifferences);

    return {
      reference: verseReference,
      translations,
      keyDifferences,
      theologicalImplications
    };
  }

  private extractKeyWords(verse: BibleVerse, linguisticAnalysis: LinguisticAnalysis[]): string[] {
    const keyWords: string[] = [];
    
    // Extract words with strong theological significance
    const theologicalWords = [
      'love', 'faith', 'hope', 'grace', 'mercy', 'salvation', 'redemption', 'sin',
      'righteousness', 'holiness', 'peace', 'joy', 'wisdom', 'truth', 'light', 'life',
      'spirit', 'soul', 'heart', 'mind', 'glory', 'power', 'kingdom', 'covenant',
      'law', 'gospel', 'christ', 'god', 'lord', 'father', 'son', 'holy spirit'
    ];

    const verseWords = verse.text.toLowerCase().split(/\s+/);
    
    for (const word of verseWords) {
      if (theologicalWords.includes(word) || word.length > 6) {
        keyWords.push(word);
      }
    }

    // Add words from linguistic analysis
    linguisticAnalysis.forEach(analysis => {
      keyWords.push(analysis.originalWord);
    });

    return [...new Set(keyWords)].slice(0, 10); // Return top 10 unique keywords
  }

  private async generateWordStudies(keyWords: string[], linguisticAnalysis: LinguisticAnalysis[]): Promise<Array<{
    word: string;
    original: string;
    transliteration: string;
    strongNumber: string;
    meaning: string;
    theologicalSignificance: string;
  }>> {
    const wordStudies: Array<{
      word: string;
      original: string;
      transliteration: string;
      strongNumber: string;
      meaning: string;
      theologicalSignificance: string;
    }> = [];

    for (const word of keyWords.slice(0, 5)) { // Limit to top 5 for brevity
      const analysis = linguisticAnalysis.find(a => 
        a.originalWord.toLowerCase().includes(word.toLowerCase()) ||
        word.toLowerCase().includes(a.originalWord.toLowerCase())
      );

      if (analysis) {
        wordStudies.push({
          word,
          original: analysis.originalWord,
          transliteration: analysis.transliteration,
          strongNumber: analysis.strongNumber,
          meaning: analysis.meaning,
          theologicalSignificance: this.generateTheologicalSignificance(analysis)
        });
      } else {
        // Generate basic word study from lexicon
        const lexiconEntry = this.getLexiconEntry(word);
        if (lexiconEntry) {
          wordStudies.push({
            word,
            original: lexiconEntry.original,
            transliteration: lexiconEntry.transliteration,
            strongNumber: lexiconEntry.strongNumber,
            meaning: lexiconEntry.meaning,
            theologicalSignificance: lexiconEntry.theologicalSignificance
          });
        }
      }
    }

    return wordStudies;
  }

  private generateTheologicalSignificance(analysis: LinguisticAnalysis): string {
    const significanceMap: Record<string, string> = {
      'love': 'Divine love (agape) is selfless, sacrificial, and unconditional, reflecting God\'s nature and the foundation of Christian ethics',
      'faith': 'Biblical faith (pistis) involves trust, commitment, and reliance on God\'s character and promises, not mere intellectual assent',
      'hope': 'Christian hope (elpis) is confident expectation based on God\'s faithfulness, not wishful thinking',
      'grace': 'Grace (charis) is God\'s unmerited favor and empowering presence, the basis of salvation and Christian living',
      'mercy': 'Mercy (eleos) is God\'s compassion toward the suffering and His forgiveness toward the repentant',
      'peace': 'Peace (eirene) is not just absence of conflict but wholeness and well-being from right relationship with God',
      'joy': 'Joy (chara) is deep-seated gladness rooted in God\'s presence and salvation, independent of circumstances',
      'wisdom': 'Wisdom (sophia/chokmah) is practical insight for living according to God\'s design, not just intellectual knowledge',
      'truth': 'Truth (aletheia/emeth) is reality as God defines it, absolute and unchanging, the foundation for faith and life'
    };

    const key = analysis.originalWord.toLowerCase();
    return significanceMap[key] || 
           `This word contributes to the passage's theological meaning by revealing aspects of God's character and His relationship with humanity`;
  }

  private getHebrewLexicon(): Record<string, any> {
    return {
      'agape': {
        transliteration: 'ahavah',
        strongNumber: 'H160',
        meaning: 'love, affection, devotion',
        usage: 'Used for divine love, human love, and covenant loyalty',
        theologicalSignificance: 'Represents God\'s covenant love and the model for human relationships',
        relatedWords: ['chesed', 'rachamim']
      },
      'chesed': {
        transliteration: 'chesed',
        strongNumber: 'H2617',
        meaning: 'loving-kindness, mercy, steadfast love',
        usage: 'Describes God\'s covenant faithfulness and loyal love',
        theologicalSignificance: 'Central to understanding God\'s character and His relationship with Israel',
        relatedWords: ['agape', 'rachamim']
      },
      'emunah': {
        transliteration: 'emunah',
        strongNumber: 'H530',
        meaning: 'faith, faithfulness, steadfastness',
        usage: 'Describes both faith in God and God\'s faithfulness to His promises',
        theologicalSignificance: 'Foundation of covenant relationship and trust in divine providence',
        relatedWords: ['batach', 'yachal']
      },
      'shalom': {
        transliteration: 'shalom',
        strongNumber: 'H7965',
        meaning: 'peace, completeness, wholeness',
        usage: 'More than absence of conflict - includes well-being, prosperity, and harmony',
        theologicalSignificance: 'Represents the comprehensive blessing God intends for creation',
        relatedWords: ['eirene', 'shalem']
      },
      'torah': {
        transliteration: 'torah',
        strongNumber: 'H8451',
        meaning: 'law, instruction, guidance',
        usage: 'God\'s revealed will and instruction for righteous living',
        theologicalSignificance: 'Reveals God\'s character and standards for human flourishing',
        relatedWords: ['mitzvah', 'choq']
      }
    };
  }

  private getGreekLexicon(): Record<string, any> {
    return {
      'agape': {
        transliteration: 'agape',
        strongNumber: 'G26',
        meaning: 'unconditional, selfless love',
        usage: 'Highest form of love, characteristic of God and Christian ethics',
        theologicalSignificance: 'Defines God\'s essential nature and the supreme Christian virtue',
        relatedWords: ['phileo', 'storge', 'eros']
      },
      'pistis': {
        transliteration: 'pistis',
        strongNumber: 'G4102',
        meaning: 'faith, trust, belief',
        usage: 'Trust in God\'s character and promises, basis of relationship with Him',
        theologicalSignificance: 'The means by which humans receive salvation and please God',
        relatedWords: ['pisteuo', 'apistia']
      },
      'charis': {
        transliteration: 'charis',
        strongNumber: 'G5485',
        meaning: 'grace, favor, gift',
        usage: 'God\'s unmerited favor and empowering presence',
        theologicalSignificance: 'Foundation of salvation and Christian living, opposed to works',
        relatedWords: ['charisma', 'eucharistia']
      },
      'eirene': {
        transliteration: 'eirene',
        strongNumber: 'G1515',
        meaning: 'peace, harmony, wholeness',
        usage: 'Inner tranquility and right relationship with God and others',
        theologicalSignificance: 'Result of justification and fruit of the Spirit',
        relatedWords: ['shalom', 'pauro']
      },
      'logos': {
        transliteration: 'logos',
        strongNumber: 'G3056',
        meaning: 'word, reason, message',
        usage: 'Divine communication and rational principle governing reality',
        theologicalSignificance: 'Christ as the eternal Word through whom God created and reveals Himself',
        relatedWords: ['rema', 'rhema']
      }
    };
  }

  private findSimilarHebrewWord(word: string): string {
    const lexicon = this.getHebrewLexicon();
    const wordLower = word.toLowerCase();
    
    for (const key of Object.keys(lexicon)) {
      if (key.includes(wordLower) || wordLower.includes(key)) {
        return key;
      }
    }
    
    return word;
  }

  private findSimilarGreekWord(word: string): string {
    const lexicon = this.getGreekLexicon();
    const wordLower = word.toLowerCase();
    
    for (const key of Object.keys(lexicon)) {
      if (key.includes(wordLower) || wordLower.includes(key)) {
        return key;
      }
    }
    
    return word;
  }

  private getLexiconEntry(word: string): any {
    const hebrewLexicon = this.getHebrewLexicon();
    const greekLexicon = this.getGreekLexicon();
    
    return hebrewLexicon[word.toLowerCase()] || 
           greekLexicon[word.toLowerCase()] || 
           hebrewLexicon[this.findSimilarHebrewWord(word)] ||
           greekLexicon[this.findSimilarGreekWord(word)];
  }

  private async findBibleUsage(word: string, _language: 'hebrew' | 'greek'): Promise<Array<{
    reference: string;
    context: string;
    significance: string;
  }>> {
    // This would ideally search the database for all occurrences
    // For now, we'll provide representative examples
    const usageExamples: Record<string, Array<{
      reference: string;
      context: string;
      significance: string;
    }>> = {
      'agape': [
        {
          reference: 'John 3:16',
          context: 'God so loved the world',
          significance: 'Demonstrates divine love as motivation for salvation'
        },
        {
          reference: '1 Corinthians 13',
          context: 'Love chapter describing supreme virtue',
          significance: 'Defines agape as the greatest spiritual gift'
        }
      ],
      'pistis': [
        {
          reference: 'Hebrews 11:1',
          context: 'Faith is the substance of things hoped for',
          significance: 'Provides classic definition of biblical faith'
        },
        {
          reference: 'Romans 3:28',
          context: 'Justified by faith apart from works',
          significance: 'Central to Reformation doctrine of justification'
        }
      ],
      'charis': [
        {
          reference: 'Ephesians 2:8',
          context: 'For by grace you have been saved',
          significance: 'Foundation of salvation theology'
        },
        {
          reference: '2 Corinthians 12:9',
          context: 'My grace is sufficient for you',
          significance: 'Grace as divine empowerment in weakness'
        }
      ]
    };

    return usageExamples[word.toLowerCase()] || [{
      reference: 'Various passages',
      context: 'Used throughout Scripture',
      significance: 'Important theological concept in biblical revelation'
    }];
  }

  private parseReference(reference: string): { book?: string; chapter?: number; verse?: number } {
    const match = reference.match(/^(.+?)\s+(\d+):(\d+)$/);
    if (match) {
      return { book: match[1], chapter: parseInt(match[2]), verse: parseInt(match[3]) };
    }
    return {};
  }

  private async getTranslationText(book: string, chapter: number, verse: number, translation: string): Promise<string | undefined> {
    const localVerse = await this.db.getVerse(book, chapter, verse);
    if (localVerse?.translation.toUpperCase() === translation.toUpperCase()) {
      return localVerse.text;
    }
    return undefined;
  }

  private identifyTranslationDifferences(translations: Array<{
    name: string;
    text?: string;
    characteristics: string;
  }>): string[] {
    const differences: string[] = [];
    const availableTranslations = translations.filter((translation) => translation.text);

    if (availableTranslations.length < 2) {
      return [
        'Direct wording comparison requires at least two loaded translation texts. The server currently reports availability honestly instead of fabricating comparison text.',
      ];
    }
    
    // Compare word choices between translations
    for (let i = 0; i < availableTranslations.length; i++) {
      for (let j = i + 1; j < availableTranslations.length; j++) {
        const words1 = availableTranslations[i].text!.split(/\s+/);
        const words2 = availableTranslations[j].text!.split(/\s+/);
        
        const differentWords = words1.filter(word => !words2.includes(word));
        
        if (differentWords.length > 0) {
          differences.push(
            `${availableTranslations[i].name} uses "${differentWords.join(', ')}" while ${availableTranslations[j].name} uses different wording`
          );
        }
      }
    }
    
    return differences;
  }

  private analyzeTheologicalImplications(differences: string[]): string {
    if (differences.length === 0) {
      return 'All translations convey essentially the same theological meaning with minor stylistic differences.';
    }
    
    return `Translation differences reflect various approaches to balancing literal accuracy with readability. These variations can influence emphasis and interpretation but generally maintain the core theological message. Understanding these differences helps readers appreciate the richness of the original text and the challenges of translation.`;
  }
}
