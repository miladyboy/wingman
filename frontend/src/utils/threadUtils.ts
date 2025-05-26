/**
 * Thread interface for filtering operations.
 */
export interface Thread {
  id: string;
  name?: string;
  [key: string]: any;
}

/**
 * Filters a list of threads by name, using partial and case-insensitive matching.
 *
 * @param threads - List of threads to filter. Each thread must have a 'name' property
 * @param query - Search text
 * @returns Filtered list of threads
 */
export function filterThreadsByName(
  threads: Thread[] | null | undefined,
  query: string | null | undefined
): Thread[] | null | undefined {
  if (!threads) {
    return threads;
  }

  if (!Array.isArray(threads) || typeof query !== "string") {
    return threads;
  }

  const normalizedQuery = query?.trim().toLowerCase();
  if (!normalizedQuery) return threads;

  const filtered = threads.filter(
    (thread) =>
      thread.name && thread.name.toLowerCase().includes(normalizedQuery)
  );
  return filtered;
}
