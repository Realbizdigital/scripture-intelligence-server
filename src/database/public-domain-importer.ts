import { strFromU8, unzipSync } from 'fflate';
import { BibleVerse } from '../types/index.js';
import { BibleDatabase } from './bible-data.js';
import { getBookSortOrder, getCanonicalBookNameFromUsfmCode } from './book-names.js';

export type PublicDomainTranslationSource = {
  id: string;
  name: string;
  sourceUrl: string;
  detailUrl: string;
  copyright: string;
};

export const PUBLIC_DOMAIN_TRANSLATIONS: PublicDomainTranslationSource[] = [
  {
    id: 'WEB',
    name: 'World English Bible Classic',
    sourceUrl: 'https://ebible.org/Scriptures/eng-web_usfm.zip',
    detailUrl: 'https://ebible.org/find/details.php?id=eng-web',
    copyright: 'Public domain. World English Bible is a trademark of eBible.org.',
  },
  {
    id: 'KJV',
    name: 'King James Version 1769',
    sourceUrl: 'https://ebible.org/Scriptures/eng-kjv_usfm.zip',
    detailUrl: 'https://ebible.org/find/details.php?id=eng-kjv',
    copyright: 'Public domain outside the United Kingdom; UK printing rights are restricted by royal letters patent.',
  },
  {
    id: 'ASV',
    name: 'American Standard Version 1901',
    sourceUrl: 'https://ebible.org/Scriptures/eng-asv_usfm.zip',
    detailUrl: 'https://ebible.org/find/details.php?id=eng-asv',
    copyright: 'Public domain.',
  },
];

type ImportOptions = {
  translations?: string[];
  force?: boolean;
  timeoutMs?: number;
  log?: (message: string) => void;
};

type ImportResult = {
  translation: string;
  imported: boolean;
  verses: number;
  sourceUrl: string;
};

export async function importPublicDomainTranslations(
  db: BibleDatabase,
  options: ImportOptions = {}
): Promise<ImportResult[]> {
  const selectedIds = new Set(
    (options.translations?.length ? options.translations : PUBLIC_DOMAIN_TRANSLATIONS.map((source) => source.id))
      .map((translation) => translation.toUpperCase())
  );
  const results: ImportResult[] = [];

  for (const source of PUBLIC_DOMAIN_TRANSLATIONS.filter((candidate) => selectedIds.has(candidate.id))) {
    const existingCount = await db.countVersesForTranslation(source.id);
    if (existingCount >= 30000 && !options.force) {
      results.push({ translation: source.id, imported: false, verses: existingCount, sourceUrl: source.sourceUrl });
      options.log?.(`Skipped ${source.id}; ${existingCount} verses already loaded.`);
      continue;
    }

    options.log?.(`Downloading ${source.id} from ${source.sourceUrl}...`);
    const archive = await fetchArchive(source.sourceUrl, options.timeoutMs ?? 120000);
    const verses = parseUsfmArchive(archive, source.id);

    if (verses.length < 30000) {
      throw new Error(`Parsed only ${verses.length} verses for ${source.id}; refusing to import an incomplete corpus.`);
    }

    await db.addVersesBulk(verses);
    results.push({ translation: source.id, imported: true, verses: verses.length, sourceUrl: source.sourceUrl });
    options.log?.(`Imported ${verses.length} ${source.id} verses.`);
  }

  return results;
}

async function fetchArchive(sourceUrl: string, timeoutMs: number): Promise<Uint8Array> {
  const response = await fetchWithRetry(sourceUrl, timeoutMs);
  if (!response.ok) {
    throw new Error(`Failed to download ${sourceUrl}: HTTP ${response.status}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

async function fetchWithRetry(sourceUrl: string, timeoutMs: number): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await fetch(sourceUrl, { signal: AbortSignal.timeout(timeoutMs) });
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`Failed to download ${sourceUrl}`);
}

export function parseUsfmArchive(archive: Uint8Array, translation: string): BibleVerse[] {
  const files = unzipSync(archive);
  const verses: BibleVerse[] = [];

  for (const [filename, content] of Object.entries(files)) {
    if (!filename.toLowerCase().endsWith('.usfm')) continue;

    const usfm = strFromU8(content);
    const parsed = parseUsfmBook(usfm, translation);
    verses.push(...parsed);
  }

  return verses.sort((a, b) => (
    getBookSortOrder(a.book) - getBookSortOrder(b.book)
    || a.chapter - b.chapter
    || a.verse - b.verse
  ));
}

function parseUsfmBook(usfm: string, translation: string): BibleVerse[] {
  const idMatch = usfm.match(/\\id\s+([1-3]?[A-Z]{2,3})\b/u);
  const book = idMatch ? getCanonicalBookNameFromUsfmCode(idMatch[1]) : undefined;
  if (!book) return [];

  const withoutNotes = usfm
    .replace(/\\f\s[\s\S]*?\\f\*/gu, ' ')
    .replace(/\\x\s[\s\S]*?\\x\*/gu, ' ')
    .replace(/\\rem\s+.*$/gmu, ' ');

  const verses: BibleVerse[] = [];
  let chapter = 0;
  let verse = 0;
  let textParts: string[] = [];

  const flushVerse = () => {
    if (chapter > 0 && verse > 0) {
      const text = normalizeVerseText(textParts.join(' '));
      if (text) {
        verses.push({ book, chapter, verse, text, translation });
      }
    }
    textParts = [];
  };

  for (const rawLine of withoutNotes.split(/\r?\n/u)) {
    const line = rawLine.replace(/^\uFEFF/u, '').trim();
    if (!line) continue;

    const chapterMatch = line.match(/^\\c\s+(\d+)/u);
    if (chapterMatch) {
      flushVerse();
      chapter = Number.parseInt(chapterMatch[1], 10);
      verse = 0;
      continue;
    }

    const verseMatch = line.match(/^\\v\s+(\d+)(?:[-,\w]*)?\s*(.*)$/u);
    if (verseMatch) {
      flushVerse();
      verse = Number.parseInt(verseMatch[1], 10);
      const verseText = cleanUsfmInlineText(verseMatch[2]);
      if (verseText) textParts.push(verseText);
      continue;
    }

    if (verse > 0) {
      const continuation = cleanUsfmInlineText(line);
      if (continuation) textParts.push(continuation);
    }
  }

  flushVerse();
  return verses;
}

function cleanUsfmInlineText(value: string): string {
  return value
    .replace(/\\\+?w\s+([^|\\]+)\|[^\\]*\\\+?w\*/gu, '$1')
    .replace(/\\fig\s[\s\S]*?\\fig\*/gu, ' ')
    .replace(/\\z[a-z0-9-]+(?:\s+[^\\]*)?/giu, ' ')
    .replace(/\\\+?[a-z0-9]+(?:-[a-z0-9]+)?\*/giu, '')
    .replace(/\\\+?[a-z0-9]+(?:-[a-z0-9]+)?\s*/giu, ' ')
    .replace(/[¶]/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
}

function normalizeVerseText(value: string): string {
  return value
    .replace(/\s+([,.;:?!])/gu, '$1')
    .replace(/[ \t]+/gu, ' ')
    .trim();
}
