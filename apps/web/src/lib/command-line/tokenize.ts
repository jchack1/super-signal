// Splits a string into tokens on whitespace, but treats "…" / '…' as a single
// token so names with spaces survive (`mv "Super Signal/general" projects`).
// Used only for the multi-argument commands (mv/cp); cd/ls/find take their whole
// remainder as one path, so they don't need this.
export function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let quote: '"' | "'" | null = null;
  // Tracks whether the current token has started, so an empty quoted "" still
  // counts as a (deliberately empty) token rather than vanishing.
  let started = false;

  for (const char of input) {
    if (quote) {
      if (char === quote) quote = null;
      else current += char;
    } else if (char === '"' || char === "'") {
      quote = char;
      started = true;
    } else if (/\s/.test(char)) {
      if (started) {
        tokens.push(current);
        current = '';
        started = false;
      }
    } else {
      current += char;
      started = true;
    }
  }

  if (started) tokens.push(current);
  return tokens;
}
