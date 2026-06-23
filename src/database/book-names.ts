export type CanonicalBook = {
  code: string;
  name: string;
  aliases: string[];
};

export const CANONICAL_BOOKS: CanonicalBook[] = [
  { code: 'GEN', name: 'Genesis', aliases: ['gen', 'ge', 'gn'] },
  { code: 'EXO', name: 'Exodus', aliases: ['ex', 'exo'] },
  { code: 'LEV', name: 'Leviticus', aliases: ['lev', 'lv'] },
  { code: 'NUM', name: 'Numbers', aliases: ['num', 'nm'] },
  { code: 'DEU', name: 'Deuteronomy', aliases: ['deut', 'dt'] },
  { code: 'JOS', name: 'Joshua', aliases: ['josh', 'jos'] },
  { code: 'JDG', name: 'Judges', aliases: ['judg', 'jdg'] },
  { code: 'RUT', name: 'Ruth', aliases: ['rut', 'rth'] },
  { code: '1SA', name: '1 Samuel', aliases: ['1 sam', '1sam', 'i samuel', 'first samuel'] },
  { code: '2SA', name: '2 Samuel', aliases: ['2 sam', '2sam', 'ii samuel', 'second samuel'] },
  { code: '1KI', name: '1 Kings', aliases: ['1 kgs', '1kgs', '1ki', 'i kings', 'first kings'] },
  { code: '2KI', name: '2 Kings', aliases: ['2 kgs', '2kgs', '2ki', 'ii kings', 'second kings'] },
  { code: '1CH', name: '1 Chronicles', aliases: ['1 chr', '1chr', '1ch', 'i chronicles', 'first chronicles'] },
  { code: '2CH', name: '2 Chronicles', aliases: ['2 chr', '2chr', '2ch', 'ii chronicles', 'second chronicles'] },
  { code: 'EZR', name: 'Ezra', aliases: ['ezr'] },
  { code: 'NEH', name: 'Nehemiah', aliases: ['neh'] },
  { code: 'EST', name: 'Esther', aliases: ['esth', 'est'] },
  { code: 'JOB', name: 'Job', aliases: ['job'] },
  { code: 'PSA', name: 'Psalms', aliases: ['psalm', 'ps', 'psa', 'pss'] },
  { code: 'PRO', name: 'Proverbs', aliases: ['prov', 'pr', 'pro'] },
  { code: 'ECC', name: 'Ecclesiastes', aliases: ['eccl', 'ecc', 'qoheleth'] },
  { code: 'SNG', name: 'Song of Solomon', aliases: ['song', 'song of songs', 'canticles', 'sos', 'sng'] },
  { code: 'ISA', name: 'Isaiah', aliases: ['isa', 'is'] },
  { code: 'JER', name: 'Jeremiah', aliases: ['jer'] },
  { code: 'LAM', name: 'Lamentations', aliases: ['lam'] },
  { code: 'EZK', name: 'Ezekiel', aliases: ['ezek', 'eze', 'ezk'] },
  { code: 'DAN', name: 'Daniel', aliases: ['dan', 'dn'] },
  { code: 'HOS', name: 'Hosea', aliases: ['hos'] },
  { code: 'JOL', name: 'Joel', aliases: ['joe', 'jol'] },
  { code: 'AMO', name: 'Amos', aliases: ['amo'] },
  { code: 'OBA', name: 'Obadiah', aliases: ['obad', 'oba'] },
  { code: 'JON', name: 'Jonah', aliases: ['jon'] },
  { code: 'MIC', name: 'Micah', aliases: ['mic'] },
  { code: 'NAM', name: 'Nahum', aliases: ['nah', 'nam'] },
  { code: 'HAB', name: 'Habakkuk', aliases: ['hab'] },
  { code: 'ZEP', name: 'Zephaniah', aliases: ['zeph', 'zep'] },
  { code: 'HAG', name: 'Haggai', aliases: ['hag'] },
  { code: 'ZEC', name: 'Zechariah', aliases: ['zech', 'zec'] },
  { code: 'MAL', name: 'Malachi', aliases: ['mal'] },
  { code: 'MAT', name: 'Matthew', aliases: ['matt', 'mat', 'mt'] },
  { code: 'MRK', name: 'Mark', aliases: ['mrk', 'mk'] },
  { code: 'LUK', name: 'Luke', aliases: ['luk', 'lk'] },
  { code: 'JHN', name: 'John', aliases: ['jhn', 'jn'] },
  { code: 'ACT', name: 'Acts', aliases: ['act', 'ac'] },
  { code: 'ROM', name: 'Romans', aliases: ['rom', 'ro'] },
  { code: '1CO', name: '1 Corinthians', aliases: ['1 cor', '1cor', 'i corinthians', 'first corinthians'] },
  { code: '2CO', name: '2 Corinthians', aliases: ['2 cor', '2cor', 'ii corinthians', 'second corinthians'] },
  { code: 'GAL', name: 'Galatians', aliases: ['gal'] },
  { code: 'EPH', name: 'Ephesians', aliases: ['eph'] },
  { code: 'PHP', name: 'Philippians', aliases: ['phil', 'php'] },
  { code: 'COL', name: 'Colossians', aliases: ['col'] },
  { code: '1TH', name: '1 Thessalonians', aliases: ['1 thess', '1thess', '1th', 'i thessalonians', 'first thessalonians'] },
  { code: '2TH', name: '2 Thessalonians', aliases: ['2 thess', '2thess', '2th', 'ii thessalonians', 'second thessalonians'] },
  { code: '1TI', name: '1 Timothy', aliases: ['1 tim', '1tim', '1ti', 'i timothy', 'first timothy'] },
  { code: '2TI', name: '2 Timothy', aliases: ['2 tim', '2tim', '2ti', 'ii timothy', 'second timothy'] },
  { code: 'TIT', name: 'Titus', aliases: ['tit'] },
  { code: 'PHM', name: 'Philemon', aliases: ['philem', 'phm'] },
  { code: 'HEB', name: 'Hebrews', aliases: ['heb'] },
  { code: 'JAS', name: 'James', aliases: ['jas', 'jam'] },
  { code: '1PE', name: '1 Peter', aliases: ['1 pet', '1pet', '1pe', 'i peter', 'first peter'] },
  { code: '2PE', name: '2 Peter', aliases: ['2 pet', '2pet', '2pe', 'ii peter', 'second peter'] },
  { code: '1JN', name: '1 John', aliases: ['1 jn', '1jn', 'i john', 'first john'] },
  { code: '2JN', name: '2 John', aliases: ['2 jn', '2jn', 'ii john', 'second john'] },
  { code: '3JN', name: '3 John', aliases: ['3 jn', '3jn', 'iii john', 'third john'] },
  { code: 'JUD', name: 'Jude', aliases: ['jud'] },
  { code: 'REV', name: 'Revelation', aliases: ['rev', 're', 'apocalypse'] },
];

const aliasToCanonical = new Map<string, string>();
const codeToCanonical = new Map<string, string>();
const canonicalOrder = new Map<string, number>();

CANONICAL_BOOKS.forEach((book, index) => {
  const names = [book.name, book.code, ...book.aliases];
  canonicalOrder.set(book.name, index + 1);
  codeToCanonical.set(book.code, book.name);

  for (const name of names) {
    aliasToCanonical.set(normalizeKey(name), book.name);
  }
});

function normalizeKey(value: string): string {
  return String(value || '')
    .toLowerCase()
    .replace(/\./gu, '')
    .replace(/\s+/gu, ' ')
    .trim();
}

export function normalizeBookName(book: string): string {
  const trimmed = String(book || '').replace(/\s+/gu, ' ').trim();
  return aliasToCanonical.get(normalizeKey(trimmed)) || trimmed;
}

export function getBookNameCandidates(book: string): string[] {
  const trimmed = String(book || '').replace(/\s+/gu, ' ').trim();
  const canonical = normalizeBookName(trimmed);
  const candidates = [trimmed, canonical];

  if (canonical === 'Psalms') {
    candidates.push('Psalm');
  }

  return [...new Set(candidates.filter(Boolean))];
}

export function getCanonicalBookNameFromUsfmCode(code: string): string | undefined {
  return codeToCanonical.get(String(code || '').toUpperCase());
}

export function getBookSortOrder(book: string): number {
  return canonicalOrder.get(normalizeBookName(book)) || 999;
}
