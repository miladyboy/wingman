/**
 * Filtra una lista de threads por nombre, usando coincidencia parcial e insensible a mayúsculas/minúsculas.
 * @param {Array} threads - Lista de threads a filtrar. Cada thread debe tener una propiedad 'name'.
 * @param {string} query - Texto de búsqueda.
 * @returns {Array} Lista filtrada de threads.
 */
export function filterThreadsByName(threads, query) {
  if (!Array.isArray(threads) || typeof query !== 'string') {
    return threads;
  }
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return threads;
  const filtered = threads.filter(thread =>
    thread.name && thread.name.toLowerCase().includes(normalizedQuery)
  );
  return filtered;
} 