import '@testing-library/jest-dom';
import 'whatwg-fetch';

if (typeof window.TextEncoder === 'undefined') {
  (window as any).TextEncoder = TextEncoder;
  (window as any).TextDecoder = TextDecoder;
}

if (typeof window.URL === 'undefined') {
  (window as any).URL = URL;
}

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