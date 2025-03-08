import '@testing-library/jest-dom';

// Поліфіл для TextEncoder/TextDecoder
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
  global.ArrayBuffer = ArrayBuffer;
  global.Uint8Array = Uint8Array;
}

// Додаємо поліфіл для URL
if (typeof global.URL === 'undefined') {
  const { URL } = require('url');
  global.URL = URL;
}

// Додаємо поліфіл для fetch
if (typeof global.fetch === 'undefined') {
  require('whatwg-fetch');
}

// Мокаємо window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
}); 