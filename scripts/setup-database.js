import { BibleDatabase } from '../dist/database/bible-data.js';

const dbPath = process.env.SCRIPTURE_DB_PATH || './scripture_intelligence.db';
const quiet = process.argv.includes('--quiet') || process.env.SCRIPTURE_SEED_QUIET === '1';
const log = (...args) => {
  if (!quiet) {
    console.log(...args);
  }
};

const sampleVerses = [
  {
    book: 'John',
    chapter: 3,
    verse: 16,
    text: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
    translation: 'ESV',
    originalGreek: 'Outos gar egapesen ho theos ton kosmon, hoste ton huion autou ton monogene edoken, hina pas ho pisteuon eis auton me apoletai all eche zoen aionion.',
    strongNumbers: ['G3739', 'G25', 'G2316', 'G3588', 'G2889', 'G5620', 'G3588', 'G5207', 'G846', 'G3439', 'G1325', 'G2443', 'G3956', 'G3588', 'G4100', 'G1519', 'G846', 'G3361', 'G622', 'G235', 'G2192', 'G2222', 'G166', 'G165', 'G2222'],
  },
  {
    book: 'Romans',
    chapter: 5,
    verse: 8,
    text: 'but God shows his love for us in that while we were still sinners, Christ died for us.',
    translation: 'ESV',
  },
  {
    book: '1 John',
    chapter: 4,
    verse: 9,
    text: 'In this the love of God was made manifest among us, that God sent his only Son into the world, so that we might live through him.',
    translation: 'ESV',
  },
  {
    book: 'Matthew',
    chapter: 18,
    verse: 21,
    text: 'Then Peter came up and said to him, "Lord, how often will my brother sin against me, and I forgive him? As many as seven times?"',
    translation: 'ESV',
  },
  {
    book: 'Matthew',
    chapter: 18,
    verse: 22,
    text: 'Jesus said to him, "I do not say to you seven times, but seventy-seven times."',
    translation: 'ESV',
  },
  {
    book: 'Luke',
    chapter: 17,
    verse: 4,
    text: 'and if he sins against you seven times in the day, and turns to you seven times, saying, "I repent," you must forgive him.',
    translation: 'ESV',
  },
  {
    book: 'Romans',
    chapter: 8,
    verse: 28,
    text: 'And we know that for those who love God all things work together for good, for those who are called according to his purpose.',
    translation: 'ESV',
  },
  {
    book: 'Genesis',
    chapter: 50,
    verse: 20,
    text: 'As for you, you meant evil against me, but God meant it for good.',
    translation: 'ESV',
  },
  {
    book: 'Psalm',
    chapter: 23,
    verse: 1,
    text: 'The LORD is my shepherd; I shall not want.',
    translation: 'ESV',
    originalHebrew: "YHWH ro'i lo echsar.",
    strongNumbers: ['H3068', 'H7462', 'H3808', 'H2637'],
  },
  {
    book: '1 Corinthians',
    chapter: 13,
    verse: 4,
    text: 'Love is patient and kind; love does not envy or boast; it is not arrogant.',
    translation: 'ESV',
  },
  {
    book: '1 Corinthians',
    chapter: 13,
    verse: 5,
    text: 'or rude. It does not insist on its own way; it is not irritable or resentful;',
    translation: 'ESV',
  },
  {
    book: '1 Corinthians',
    chapter: 13,
    verse: 6,
    text: 'it does not rejoice at wrongdoing, but rejoices with the truth.',
    translation: 'ESV',
  },
  {
    book: '1 Corinthians',
    chapter: 13,
    verse: 7,
    text: 'Love bears all things, believes all things, hopes all things, endures all things.',
    translation: 'ESV',
  },
  {
    book: 'Hebrews',
    chapter: 11,
    verse: 1,
    text: 'Now faith is the assurance of things hoped for, the conviction of things not seen.',
    translation: 'ESV',
  },
  {
    book: 'Ephesians',
    chapter: 2,
    verse: 8,
    text: 'For by grace you have been saved through faith. And this is not your own doing; it is the gift of God,',
    translation: 'ESV',
  },
  {
    book: 'Ephesians',
    chapter: 2,
    verse: 9,
    text: 'not a result of works, so that no one may boast.',
    translation: 'ESV',
  },
  {
    book: 'Genesis',
    chapter: 1,
    verse: 1,
    text: 'In the beginning, God created the heavens and the earth.',
    translation: 'ESV',
    originalHebrew: "Bereshit bara Elohim et hashamayim ve'et ha'aretz.",
    strongNumbers: ['H7225', 'H1254', 'H430', 'H853', 'H8064', 'H853', 'H776'],
  },
];

const sampleCrossReferences = [
  ['John', 3, 16, 'Romans', 5, 8, "theological parallel - God's love demonstrated", 'love'],
  ['John', 3, 16, '1 John', 4, 9, "thematic connection - God's love as basis for salvation", 'love'],
  ['Matthew', 18, 22, 'Luke', 17, 4, 'parallel teaching on forgiveness', 'forgiveness'],
  ['Romans', 8, 28, 'Genesis', 50, 20, "theological connection - God's sovereign providence", 'providence'],
];

const sampleHistoricalContext = [
  ['John', 1, 21, 'Early 1st Century AD', 'Greco-Roman world with Jewish religious context. Gospel written for both Jewish and Gentile audiences.', 'Roman occupation of Judea, with tensions between Jewish authorities and Roman government.', 'Emerging Christianity separating from Judaism amid diverse Jewish sects.'],
  ['Matthew', 1, 28, 'Mid-1st Century AD', 'Jewish-Christian community emphasizing Jesus as the fulfillment of Scripture.', 'Roman rule and post-Temple Jewish identity questions shaped the audience.', 'The church was defining its worship, mission, and relation to Israel.'],
  ['Romans', 1, 16, 'Mid-1st Century AD', 'Urban Roman church with mixed Jewish-Gentile membership.', 'Neronian persecution was approaching within the Roman Empire.', 'Christian theology was developing in a pagan environment, especially around law and grace.'],
  ['Genesis', 1, 50, 'Patriarchal Period', 'Ancient Near Eastern nomadic and early agricultural societies.', 'City-states in Mesopotamia and Egypt influenced the world of the patriarchs.', 'Polytheistic surrounding cultures contrasted with covenant monotheism.'],
];

const sampleLinguisticAnalysis = [
  ['John', 3, 16, 1, 'greek', 'agape', 'agape', 'G26', 'unconditional, selfless love', 'Highest form of love, characteristic of God and Christian ethics', 'phileo,storge,eros'],
  ['John', 3, 16, 2, 'greek', 'pisteuon', 'pisteuo', 'G4100', 'to believe, trust, have faith', 'Active trust and commitment, not mere intellectual assent', 'pistis,apistia'],
  ['Genesis', 1, 1, 1, 'hebrew', 'bereshit', 'bereshit', 'H7225', 'in beginning', "Marks the beginning and emphasizes God's priority in creation", 'rosh,rishon'],
  ['Genesis', 1, 1, 2, 'hebrew', 'bara', 'bara', 'H1254', 'to create, bring into existence', 'Divine creation, used of God in the Hebrew Bible', 'asah,yatsar'],
];

const sampleTheologicalThemes = [
  ['love', "God's unconditional, sacrificial love that forms the foundation of all relationships", 'From covenant love in the Old Testament to self-giving love in Christ.'],
  ['faith', "Trust in God's character and promises that enables relationship with Him", "From Abraham's faith to New Testament faith in Christ."],
  ['grace', "God's unmerited favor providing salvation and spiritual enablement", 'From favor language in the Old Testament to salvation by grace in Christ.'],
  ['salvation', "God's deliverance from sin and its consequences through Christ's sacrifice", "From physical deliverance to spiritual salvation culminating in Christ's atoning work."],
];

async function setupDatabase() {
  log(`Setting up Scripture Intelligence database at ${dbPath}...`);

  const db = new BibleDatabase(dbPath);

  try {
    await db.initialize();

    const alreadySeeded = await db.getVerse('John', 3, 16);
    const forceSeed = process.env.FORCE_SCRIPTURE_SEED === '1' || process.env.FORCE_SCRIPTURE_SEED === 'true';

    if (alreadySeeded && !forceSeed) {
      log('Database already contains seed data. Set FORCE_SCRIPTURE_SEED=1 to refresh sample content.');
      return;
    }

    if (typeof db.seedSampleData === 'function') {
      const result = await db.seedSampleData({ force: forceSeed });
      log(`Loaded ${result.verses} sample verses through the shared database seeder.`);
      return;
    }

    for (const verse of sampleVerses) {
      await db.addVerse(verse);
    }

    for (const ref of sampleCrossReferences) {
      await db.addCrossReference(...ref);
    }

    for (const context of sampleHistoricalContext) {
      await db.addHistoricalContext(...context);
    }

    for (const analysis of sampleLinguisticAnalysis) {
      await db.addLinguisticAnalysis(...analysis);
    }

    for (const theme of sampleTheologicalThemes) {
      await db.addTheologicalTheme(...theme);
    }

    log(`Loaded ${sampleVerses.length} verses, ${sampleCrossReferences.length} cross-references, ${sampleHistoricalContext.length} context records, ${sampleLinguisticAnalysis.length} language records, and ${sampleTheologicalThemes.length} themes.`);
  } finally {
    db.close();
  }
}

setupDatabase().catch((error) => {
  console.error('Error setting up database:', error);
  process.exitCode = 1;
});
