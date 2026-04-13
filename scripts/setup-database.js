import { BibleDatabase } from '../src/database/bible-data.js';
import { BibleVerse } from '../src/types/index.js';

// Sample Bible data for demonstration
const sampleVerses = [
  // John 3:16 - Famous salvation verse
  {
    book: 'John',
    chapter: 3,
    verse: 16,
    text: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
    translation: 'ESV',
    originalGreek: 'Outos gar hégapesen ho theos ton kosmon, hoste ton huion autou ton monogené edoken, hina pas ho pisteuón eis auton mé apolétai all eché zóén aiónion.',
    strongNumbers: ['G3739', 'G25', 'G2316', 'G3588', 'G2889', 'G5620', 'G3588', G5207, 'G846', 'G3439', 'G1325', 'G2443', 'G3956', 'G3588', 'G4100', 'G1519', 'G846', 'G3361', 'G622', 'G235', 'G2192', 'G2222', 'G166', 'G165', 'G2222']
  },
  
  // Matthew 18:21-22 - Forgiveness
  {
    book: 'Matthew',
    chapter: 18,
    verse: 21,
    text: 'Then Peter came up and said to him, "Lord, how often will my brother sin against me, and I forgive him? As many as seven times?"',
    translation: 'ESV'
  },
  {
    book: 'Matthew',
    chapter: 18,
    verse: 22,
    text: 'Jesus said to him, "I do not say to you seven times, but seventy-seven times."',
    translation: 'ESV'
  },

  // Romans 8:28 - God's sovereignty
  {
    book: 'Romans',
    chapter: 8,
    verse: 28,
    text: 'And we know that for those who love God all things work together for good, for those who are called according to his purpose.',
    translation: 'ESV'
  },

  // Psalm 23:1 - Shepherd psalm
  {
    book: 'Psalm',
    chapter: 23,
    verse: 1,
    text: 'The LORD is my shepherd; I shall not want.',
    translation: 'ESV',
    originalHebrew: 'YHWH ro\'i lo echsar.',
    strongNumbers: ['H3068', 'H7462', 'H3808', 'H2637']
  },

  // 1 Corinthians 13:4-7 - Love chapter
  {
    book: '1 Corinthians',
    chapter: 13,
    verse: 4,
    text: 'Love is patient and kind; love does not envy or boast; it is not arrogant.',
    translation: 'ESV'
  },
  {
    book: '1 Corinthians',
    chapter: 13,
    verse: 5,
    text: 'or rude. It does not insist on its own way; it is not irritable or resentful;',
    translation: 'ESV'
  },
  {
    book: '1 Corinthians',
    chapter: 13,
    verse: 6,
    text: 'it does not rejoice at wrongdoing, but rejoices with the truth.',
    translation: 'ESV'
  },
  {
    book: '1 Corinthians',
    chapter: 13,
    verse: 7,
    text: 'Love bears all things, believes all things, hopes all things, endures all things.',
    translation: 'ESV'
  },

  // Hebrews 11:1 - Faith definition
  {
    book: 'Hebrews',
    chapter: 11,
    verse: 1,
    text: 'Now faith is the assurance of things hoped for, the conviction of things not seen.',
    translation: 'ESV'
  },

  // Ephesians 2:8-9 - Grace and salvation
  {
    book: 'Ephesians',
    chapter: 2,
    verse: 8,
    text: 'For by grace you have been saved through faith. And this is not your own doing; it is the gift of God,',
    translation: 'ESV'
  },
  {
    book: 'Ephesians',
    chapter: 2,
    verse: 9,
    text: 'not a result of works, so that no one may boast.',
    translation: 'ESV'
  },

  // Genesis 1:1 - Creation
  {
    book: 'Genesis',
    chapter: 1,
    verse: 1,
    text: 'In the beginning, God created the heavens and the earth.',
    translation: 'ESV',
    originalHebrew: 'Bereshit bara Elohim et hashamayim ve\'et ha\'aretz.',
    strongNumbers: ['H7225', 'H1254', 'H430', 'H853', 'H8064', 'H853', 'H776']
  }
];

// Sample cross-references
const sampleCrossReferences = [
  {
    source_book: 'John',
    source_chapter: 3,
    source_verse: 16,
    target_book: 'Romans',
    target_chapter: 5,
    target_verse: 8,
    relationship: 'theological parallel - God\'s love demonstrated',
    theological_theme: 'love'
  },
  {
    source_book: 'John',
    source_chapter: 3,
    source_verse: 16,
    target_book: '1 John',
    target_chapter: 4,
    target_verse: 9,
    relationship: 'thematic connection - God\'s love as basis for salvation',
    theological_theme: 'love'
  },
  {
    source_book: 'Matthew',
    source_chapter: 18,
    source_verse: 22,
    target_book: 'Luke',
    target_chapter: 17,
    target_verse: 4,
    relationship: 'parallel teaching on forgiveness',
    theological_theme: 'forgiveness'
  },
  {
    source_book: 'Romans',
    source_chapter: 8,
    source_verse: 28,
    target_book: 'Genesis',
    target_chapter: 50,
    target_verse: 20,
    relationship: 'theological connection - God\'s sovereign providence',
    theological_theme: 'providence'
  }
];

// Sample historical context
const sampleHistoricalContext = [
  {
    book: 'John',
    chapter_start: 1,
    chapter_end: 21,
    period: 'Early 1st Century AD',
    cultural_background: 'Greco-Roman world with Jewish religious context. Gospel written for both Jewish and Gentile audiences.',
    political_situation: 'Roman occupation of Judea, tensions between Jewish authorities and Roman government.',
    religious_context: 'Emerging Christianity separating from Judaism, various Jewish sects (Pharisees, Sadducees, Essenes).'
  },
  {
    book: 'Matthew',
    chapter_start: 1,
    chapter_end: 28,
    period: 'Mid-1st Century AD',
    cultural_background: 'Jewish-Christian community transitioning to Gentile inclusion. Strong emphasis on Jewish fulfillment.',
    political_situation: 'Post-Jewish War (70 AD), destruction of Temple, Christian-Jewish separation.',
    religious_context: 'Church defining its identity apart from Judaism, establishing new worship patterns.'
  },
  {
    book: 'Romans',
    chapter_start: 1,
    chapter_end: 16,
    period: 'Mid-1st Century AD',
    cultural_background: 'Urban Roman church with mixed Jewish-Gentile membership. Sophisticated theological environment.',
    political_situation: 'Neronian persecution approaching, tensions in Roman Empire.',
    religious_context: 'Christian theology developing in pagan environment, questions about law and grace.'
  },
  {
    book: 'Genesis',
    chapter_start: 1,
    chapter_end: 50,
    period: 'Patriarchal Period (c. 2000-1800 BC)',
    cultural_background: 'Ancient Near Eastern nomadic and early agricultural societies.',
    political_situation: 'City-states in Mesopotamia and Egypt, tribal confederations in Canaan.',
    religious_context: 'Polytheistic surrounding cultures, emerging monotheism through covenant relationship.'
  }
];

// Sample linguistic analysis
const sampleLinguisticAnalysis = [
  {
    book: 'John',
    chapter: 3,
    verse: 16,
    word_position: 1,
    original_language: 'greek',
    original_word: 'agapé',
    transliteration: 'agape',
    strong_number: 'G26',
    meaning: 'unconditional, selfless love',
    usage: 'Highest form of love, characteristic of God and Christian ethics',
    related_words: ['phileo', 'storge', 'eros']
  },
  {
    book: 'John',
    chapter: 3,
    verse: 16,
    word_position: 2,
    original_language: 'greek',
    original_word: 'pisteuón',
    transliteration: 'pisteuo',
    strong_number: 'G4100',
    meaning: 'to believe, trust, have faith',
    usage: 'Active trust and commitment, not mere intellectual assent',
    related_words: ['pistis', 'apistia']
  },
  {
    book: 'Genesis',
    chapter: 1,
    verse: 1,
    word_position: 1,
    original_language: 'hebrew',
    original_word: 'bereshit',
    transliteration: 'bereshit',
    strong_number: 'H7225',
    meaning: 'in beginning',
    usage: 'Marks absolute beginning, emphasizes God\'s priority in creation',
    related_words: ['rosh', 'rishon']
  },
  {
    book: 'Genesis',
    chapter: 1,
    verse: 1,
    word_position: 2,
    original_language: 'hebrew',
    original_word: 'bara',
    transliteration: 'bara',
    strong_number: 'H1254',
    meaning: 'to create, bring into existence',
    usage: 'Divine creation ex nihilo, used only of God in Hebrew Bible',
    related_words: ['asah', 'yatsar']
  }
];

// Sample theological themes
const sampleTheologicalThemes = [
  {
    name: 'love',
    description: 'God\'s unconditional, sacrificial love that forms the foundation of all relationships',
    historical_development: 'From covenant love in Old Testament to self-giving love in Christ, culminating in the call to love God and neighbor.'
  },
  {
    name: 'faith',
    description: 'Trust in God\'s character and promises that enables relationship with Him',
    historical_development: 'From Abraham\'s faith to New Testament faith in Christ, developing from trust to comprehensive commitment.'
  },
  {
    name: 'grace',
    description: 'God\'s unmerited favor providing salvation and spiritual enablement',
    historical_development: 'From favor in Old Testament to central means of salvation in Christ, contrasting with works-based systems.'
  },
  {
    name: 'salvation',
    description: 'God\'s deliverance from sin and its consequences through Christ\'s sacrifice',
    historical_development: 'From physical deliverance to spiritual salvation, culminating in Christ\'s atoning work.'
  }
];

async function setupDatabase() {
  console.log('Setting up Scripture Intelligence database...');
  
  const db = new BibleDatabase('./scripture_intelligence.db');
  
  try {
    await db.initialize();
    console.log('Database initialized successfully.');
    
    // Add sample verses
    console.log('Adding sample verses...');
    for (const verse of sampleVerses) {
      await db.addVerse(verse);
    }
    console.log(`Added ${sampleVerses.length} verses.`);
    
    // Add sample cross-references
    console.log('Adding sample cross-references...');
    for (const ref of sampleCrossReferences) {
      await new Promise((resolve) => {
        db.getDb().run(
          `INSERT INTO cross_references 
           (source_book, source_chapter, source_verse, target_book, target_chapter, target_verse, relationship, theological_theme)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [ref.source_book, ref.source_chapter, ref.source_verse, ref.target_book, ref.target_chapter, ref.target_verse, ref.relationship, ref.theological_theme],
          resolve
        );
      });
    }
    console.log(`Added ${sampleCrossReferences.length} cross-references.`);
    
    // Add sample historical context
    console.log('Adding sample historical context...');
    for (const context of sampleHistoricalContext) {
      await new Promise((resolve) => {
        db.getDb().run(
          `INSERT INTO historical_context 
           (book, chapter_start, chapter_end, period, cultural_background, political_situation, religious_context)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [context.book, context.chapter_start, context.chapter_end, context.period, context.cultural_background, context.political_situation, context.religious_context],
          resolve
        );
      });
    }
    console.log(`Added ${sampleHistoricalContext.length} historical contexts.`);
    
    // Add sample linguistic analysis
    console.log('Adding sample linguistic analysis...');
    for (const analysis of sampleLinguisticAnalysis) {
      await new Promise((resolve) => {
        db.getDb().run(
          `INSERT INTO linguistic_analysis 
           (book, chapter, verse, word_position, original_language, original_word, transliteration, strong_number, meaning, usage, related_words)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [analysis.book, analysis.chapter, analysis.verse, analysis.word_position, analysis.original_language, analysis.original_word, analysis.transliteration, analysis.strong_number, analysis.meaning, analysis.usage, analysis.related_words.join(',')],
          resolve
        );
      });
    }
    console.log(`Added ${sampleLinguisticAnalysis.length} linguistic analyses.`);
    
    // Add sample theological themes
    console.log('Adding sample theological themes...');
    for (const theme of sampleTheologicalThemes) {
      await new Promise((resolve) => {
        db.getDb().run(
          `INSERT INTO theological_themes (name, description, historical_development) VALUES (?, ?, ?)`,
          [theme.name, theme.description, theme.historical_development],
          resolve
        );
      });
    }
    console.log(`Added ${sampleTheologicalThemes.length} theological themes.`);
    
    console.log('Database setup completed successfully!');
    console.log('Sample data has been loaded for demonstration purposes.');
    
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    db.close();
  }
}

// Helper method to get the raw database instance
BibleDatabase.prototype.getDb = function() {
  return this.db;
};

setupDatabase().catch(console.error);
