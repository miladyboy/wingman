let apiBase = '';
try {
  apiBase = import.meta.env.VITE_BACKEND_URL || '';
} catch {
  apiBase = '';
}
export default apiBase; 