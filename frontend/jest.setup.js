// Patch console.error as early as possible
const originalError = console.error;
console.error = function (...args) {
  const msg = args[0];
  if (
    typeof msg === 'string' &&
    (msg.includes('An empty string'))
  ) {
    return;
  }
  originalError.apply(console, args);
}; 