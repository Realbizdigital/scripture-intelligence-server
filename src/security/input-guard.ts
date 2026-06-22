export const SECURITY_LIMITS = {
  maxStringLength: 8000,
  maxPromptArgumentLength: 2000,
  maxArrayLength: 100,
  maxObjectKeys: 64,
  maxObjectDepth: 5,
  maxSearchLimit: 50,
  maxPassageVerses: 200,
  maxResourceUriLength: 2048,
  maxResponseCharacters: 250000,
} as const;

export class UserInputError extends Error {
  readonly code: string;

  constructor(message: string, code = 'INVALID_INPUT') {
    super(message);
    this.name = 'UserInputError';
    this.code = code;
  }
}

export type SanitizedArgs = Record<string, unknown>;

// eslint-disable-next-line no-control-regex
const CONTROL_CHARS_EXCEPT_WHITESPACE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const SAFE_KEY = /^[A-Za-z0-9_.:-]{1,64}$/;

export function sanitizeText(value: unknown, maxLength: number = SECURITY_LIMITS.maxStringLength): string {
  const text = String(value ?? '')
    .normalize('NFC')
    .replace(CONTROL_CHARS_EXCEPT_WHITESPACE, ' ')
    .trim();

  return text.length > maxLength ? text.slice(0, maxLength) : text;
}

export function sanitizeToolArgs(args: unknown): SanitizedArgs {
  if (args === undefined || args === null) return {};
  if (typeof args !== 'object' || Array.isArray(args)) {
    throw new UserInputError('Tool arguments must be a JSON object.');
  }

  return sanitizeObject(args as Record<string, unknown>, 0);
}

export function sanitizePromptArgs(args: unknown): SanitizedArgs {
  const sanitized = sanitizeToolArgs(args);
  return Object.fromEntries(
    Object.entries(sanitized).map(([key, value]) => [
      key,
      typeof value === 'string'
        ? sanitizeText(value, SECURITY_LIMITS.maxPromptArgumentLength)
        : value,
    ])
  );
}

function sanitizeObject(value: Record<string, unknown>, depth: number): SanitizedArgs {
  if (depth > SECURITY_LIMITS.maxObjectDepth) {
    throw new UserInputError('Input is nested too deeply.');
  }

  const entries = Object.entries(value).slice(0, SECURITY_LIMITS.maxObjectKeys);
  return entries.reduce<SanitizedArgs>((result, [key, entryValue]) => {
    const safeKey = sanitizeText(key, 64);
    if (!SAFE_KEY.test(safeKey)) return result;
    result[safeKey] = sanitizeValue(entryValue, depth + 1);
    return result;
  }, {});
}

function sanitizeValue(value: unknown, depth: number): unknown {
  if (value === null || value === undefined) return undefined;

  if (typeof value === 'string') return sanitizeText(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new UserInputError('Numbers must be finite.');
    return value;
  }
  if (typeof value === 'boolean') return value;

  if (Array.isArray(value)) {
    return value
      .slice(0, SECURITY_LIMITS.maxArrayLength)
      .map((entry) => sanitizeValue(entry, depth + 1));
  }

  if (typeof value === 'object') {
    return sanitizeObject(value as Record<string, unknown>, depth);
  }

  return undefined;
}

export function clampPositiveInteger(
  value: unknown,
  fallback: number,
  max: number = SECURITY_LIMITS.maxSearchLimit
): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(1, Math.min(Math.floor(numeric), max));
}

export function clampVerseRange(startVerse: number, endVerse: number): { startVerse: number; endVerse: number } {
  const start = clampPositiveInteger(startVerse, 1, 200);
  const end = clampPositiveInteger(endVerse, start, 200);
  const lower = Math.min(start, end);
  const upper = Math.max(start, end);

  return {
    startVerse: lower,
    endVerse: Math.min(upper, lower + SECURITY_LIMITS.maxPassageVerses - 1),
  };
}

export function sanitizeResourceUri(uri: unknown): string {
  if (typeof uri !== 'string') {
    throw new UserInputError('Resource URI must be a string.');
  }

  if (uri.length > SECURITY_LIMITS.maxResourceUriLength) {
    throw new UserInputError('Resource URI is too long.');
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(sanitizeText(uri, SECURITY_LIMITS.maxResourceUriLength));
  } catch {
    throw new UserInputError('Resource URI contains malformed escape sequences.');
  }

  if (!decoded.startsWith('scripture://')) {
    throw new UserInputError('Only scripture:// resources are supported.');
  }

  if (decoded.includes('\\') || decoded.includes('..')) {
    throw new UserInputError('Resource URI contains unsafe path tokens.');
  }

  return decoded;
}

export function publicErrorPayload(error: unknown): Record<string, unknown> {
  if (error instanceof UserInputError) {
    return {
      error: {
        code: error.code,
        message: error.message,
        recoverable: true,
      },
    };
  }

  return {
    error: {
      code: 'REQUEST_FAILED',
      message: 'The request could not be completed safely. Check the input and try again.',
      recoverable: true,
    },
  };
}

export function attachStudySafety<T extends Record<string, unknown>>(payload: T): T & {
  safety: Record<string, unknown>;
} {
  return {
    ...payload,
    safety: {
      interpretation: 'Read every passage in literary, historical, canonical, and covenant context.',
      accessibility: 'Inputs are gently normalized and capped for reliability without blocking ordinary Bible-study use.',
      copyright: 'Respect copyright and quotation limits for modern Bible translations; prefer public-domain text for extensive quoting.',
      pastoralCare: 'This server supports study and reflection but does not replace pastoral, legal, medical, or emergency care.',
    },
  };
}

export function safeJson(value: unknown): string {
  const json = JSON.stringify(value, null, 2);
  if (json.length <= SECURITY_LIMITS.maxResponseCharacters) return json;

  return JSON.stringify(
    attachStudySafety({
      truncated: true,
      message: 'The response exceeded the configured size cap and was shortened.',
      preview: json.slice(0, SECURITY_LIMITS.maxResponseCharacters),
    }),
    null,
    2
  );
}
