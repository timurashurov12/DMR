import '@testing-library/jest-dom/vitest';

const mockIntersectionObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(() => callback([{ isIntersecting: true }])),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: mockIntersectionObserver,
});
