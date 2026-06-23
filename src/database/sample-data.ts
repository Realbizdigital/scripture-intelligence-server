import type { BibleVerse } from '../types/index.js';

export const SAMPLE_VERSES: BibleVerse[] = [
  {
    book: 'John',
    chapter: 3,
    verse: 16,
    text: 'For God so loved the world, that he gave his only born Son, that whoever believes in him should not perish, but have eternal life.',
    translation: 'WEB',
    originalGreek: 'Outos gar egapesen ho theos ton kosmon, hoste ton huion autou ton monogene edoken, hina pas ho pisteuon eis auton me apoletai all eche zoen aionion.',
    strongNumbers: ['G3739', 'G25', 'G2316', 'G3588', 'G2889', 'G5620', 'G3588', 'G5207', 'G846', 'G3439', 'G1325', 'G2443', 'G3956', 'G3588', 'G4100', 'G1519', 'G846', 'G3361', 'G622', 'G235', 'G2192', 'G2222', 'G166', 'G165', 'G2222'],
  },
  {
    book: 'Romans',
    chapter: 5,
    verse: 8,
    text: 'But God commends his own love toward us, in that while we were yet sinners, Christ died for us.',
    translation: 'WEB',
  },
  {
    book: '1 John',
    chapter: 4,
    verse: 9,
    text: "By this God's love was revealed in us, that God has sent his one and only Son into the world that we might live through him.",
    translation: 'WEB',
  },
  {
    book: 'Matthew',
    chapter: 18,
    verse: 21,
    text: 'Then Peter came and said to him, "Lord, how often shall my brother sin against me, and I forgive him? Until seven times?"',
    translation: 'WEB',
  },
  {
    book: 'Matthew',
    chapter: 18,
    verse: 22,
    text: 'Jesus said to him, "I don\'t tell you until seven times, but, until seventy times seven."',
    translation: 'WEB',
  },
  {
    book: 'Luke',
    chapter: 17,
    verse: 4,
    text: 'If he sins against you seven times in the day, and seven times returns, saying, "I repent," you shall forgive him.',
    translation: 'WEB',
  },
  {
    book: 'Romans',
    chapter: 8,
    verse: 28,
    text: 'We know that all things work together for good for those who love God, for those who are called according to his purpose.',
    translation: 'WEB',
  },
  {
    book: 'Genesis',
    chapter: 50,
    verse: 20,
    text: 'As for you, you meant evil against me, but God meant it for good, to bring to pass, as it is today, to save many people alive.',
    translation: 'WEB',
  },
  {
    book: 'Psalms',
    chapter: 23,
    verse: 1,
    text: 'Yahweh is my shepherd; I shall lack nothing.',
    translation: 'WEB',
    originalHebrew: "YHWH ro'i lo echsar.",
    strongNumbers: ['H3068', 'H7462', 'H3808', 'H2637'],
  },
  {
    book: '1 Corinthians',
    chapter: 13,
    verse: 4,
    text: "Love is patient and is kind. Love doesn't envy. Love doesn't brag, is not proud,",
    translation: 'WEB',
  },
  {
    book: '1 Corinthians',
    chapter: 13,
    verse: 5,
    text: "doesn't behave itself inappropriately, doesn't seek its own way, is not provoked, takes no account of evil;",
    translation: 'WEB',
  },
  {
    book: '1 Corinthians',
    chapter: 13,
    verse: 6,
    text: "doesn't rejoice in unrighteousness, but rejoices with the truth;",
    translation: 'WEB',
  },
  {
    book: '1 Corinthians',
    chapter: 13,
    verse: 7,
    text: 'bears all things, believes all things, hopes all things, and endures all things.',
    translation: 'WEB',
  },
  {
    book: 'Hebrews',
    chapter: 11,
    verse: 1,
    text: 'Now faith is assurance of things hoped for, proof of things not seen.',
    translation: 'WEB',
  },
  {
    book: 'Ephesians',
    chapter: 2,
    verse: 8,
    text: 'for by grace you have been saved through faith, and that not of yourselves; it is the gift of God,',
    translation: 'WEB',
  },
  {
    book: 'Ephesians',
    chapter: 2,
    verse: 9,
    text: 'not of works, that no one would boast.',
    translation: 'WEB',
  },
  {
    book: 'Genesis',
    chapter: 1,
    verse: 1,
    text: 'In the beginning, God created the heavens and the earth.',
    translation: 'WEB',
    originalHebrew: "Bereshit bara Elohim et hashamayim ve'et ha'aretz.",
    strongNumbers: ['H7225', 'H1254', 'H430', 'H853', 'H8064', 'H853', 'H776'],
  },
];

export const SAMPLE_CROSS_REFERENCES = [
  { sourceBook: 'John', sourceChapter: 3, sourceVerse: 16, targetBook: 'Romans', targetChapter: 5, targetVerse: 8, relationship: "theological parallel - God's love demonstrated", theologicalTheme: 'love' },
  { sourceBook: 'John', sourceChapter: 3, sourceVerse: 16, targetBook: '1 John', targetChapter: 4, targetVerse: 9, relationship: "thematic connection - God's love as basis for salvation", theologicalTheme: 'love' },
  { sourceBook: 'Matthew', sourceChapter: 18, sourceVerse: 22, targetBook: 'Luke', targetChapter: 17, targetVerse: 4, relationship: 'parallel teaching on forgiveness', theologicalTheme: 'forgiveness' },
  { sourceBook: 'Romans', sourceChapter: 8, sourceVerse: 28, targetBook: 'Genesis', targetChapter: 50, targetVerse: 20, relationship: "theological connection - God's sovereign providence", theologicalTheme: 'providence' },
];

export const SAMPLE_HISTORICAL_CONTEXTS = [
  {
    book: 'John',
    chapterStart: 1,
    chapterEnd: 21,
    period: 'Early 1st Century AD',
    culturalBackground: 'Greco-Roman world with Jewish religious context. Gospel written for both Jewish and Gentile audiences.',
    politicalSituation: 'Roman occupation of Judea, with tensions between Jewish authorities and Roman government.',
    religiousContext: 'Emerging Christianity separating from Judaism amid diverse Jewish sects.',
  },
  {
    book: 'Matthew',
    chapterStart: 1,
    chapterEnd: 28,
    period: 'Mid-1st Century AD',
    culturalBackground: 'Jewish-Christian community emphasizing Jesus as the fulfillment of Scripture.',
    politicalSituation: 'Roman rule and post-Temple Jewish identity questions shaped the audience.',
    religiousContext: 'The church was defining its worship, mission, and relation to Israel.',
  },
  {
    book: 'Romans',
    chapterStart: 1,
    chapterEnd: 16,
    period: 'Mid-1st Century AD',
    culturalBackground: 'Urban Roman church with mixed Jewish-Gentile membership.',
    politicalSituation: 'Neronian persecution was approaching within the Roman Empire.',
    religiousContext: 'Christian theology was developing in a pagan environment, especially around law and grace.',
  },
  {
    book: 'Genesis',
    chapterStart: 1,
    chapterEnd: 50,
    period: 'Patriarchal Period',
    culturalBackground: 'Ancient Near Eastern nomadic and early agricultural societies.',
    politicalSituation: 'City-states in Mesopotamia and Egypt influenced the world of the patriarchs.',
    religiousContext: 'Polytheistic surrounding cultures contrasted with covenant monotheism.',
  },
];

export const SAMPLE_LINGUISTIC_ANALYSES = [
  { book: 'John', chapter: 3, verse: 16, wordPosition: 1, originalLanguage: 'greek', originalWord: 'agape', transliteration: 'agape', strongNumber: 'G26', meaning: 'unconditional, selfless love', usage: 'Highest form of love, characteristic of God and Christian ethics', relatedWords: 'phileo,storge,eros' },
  { book: 'John', chapter: 3, verse: 16, wordPosition: 2, originalLanguage: 'greek', originalWord: 'pisteuon', transliteration: 'pisteuo', strongNumber: 'G4100', meaning: 'to believe, trust, have faith', usage: 'Active trust and commitment, not mere intellectual assent', relatedWords: 'pistis,apistia' },
  { book: 'Genesis', chapter: 1, verse: 1, wordPosition: 1, originalLanguage: 'hebrew', originalWord: 'bereshit', transliteration: 'bereshit', strongNumber: 'H7225', meaning: 'in beginning', usage: "Marks the beginning and emphasizes God's priority in creation", relatedWords: 'rosh,rishon' },
  { book: 'Genesis', chapter: 1, verse: 1, wordPosition: 2, originalLanguage: 'hebrew', originalWord: 'bara', transliteration: 'bara', strongNumber: 'H1254', meaning: 'to create, bring into existence', usage: 'Divine creation, used of God in the Hebrew Bible', relatedWords: 'asah,yatsar' },
];

export const SAMPLE_THEOLOGICAL_THEMES = [
  { name: 'love', description: "God's unconditional, sacrificial love that forms the foundation of all relationships", historicalDevelopment: 'From covenant love in the Old Testament to self-giving love in Christ.' },
  { name: 'faith', description: "Trust in God's character and promises that enables relationship with Him", historicalDevelopment: "From Abraham's faith to New Testament faith in Christ." },
  { name: 'grace', description: "God's unmerited favor providing salvation and spiritual enablement", historicalDevelopment: 'From favor language in the Old Testament to salvation by grace in Christ.' },
  { name: 'salvation', description: "God's deliverance from sin and its consequences through Christ's sacrifice", historicalDevelopment: "From physical deliverance to spiritual salvation culminating in Christ's atoning work." },
];
