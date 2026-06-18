const BAD_VALUES = new Set(['', 'string', 'null', 'undefined']);

/** Returns `url` if it looks like a real URL, otherwise returns `fallback`. */
export function safeUrl(url: string | null | undefined, fallback: string): string {
  return (url && !BAD_VALUES.has(url.toLowerCase().trim())) ? url : fallback;
}
