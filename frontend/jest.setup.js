const { TextEncoder, TextDecoder } = require('util');

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

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