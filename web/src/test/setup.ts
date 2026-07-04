import "@testing-library/jest-dom/vitest";

// Mock IntersectionObserver for framer-motion whileInView in jsdom
globalThis.IntersectionObserver = class IntersectionObserver {
  root: Element | null = null;
  rootMargin = "";
  thresholds: ReadonlyArray<number> = [];
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
} as unknown as typeof IntersectionObserver;