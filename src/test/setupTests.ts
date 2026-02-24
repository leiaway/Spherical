import "@testing-library/jest-dom";
import "whatwg-fetch";
import { beforeAll, afterEach, afterAll } from "vitest";
import { server } from "./msw/server";

class TestResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Polyfill for Radix UI components that rely on ResizeObserver in jsdom
if (typeof (globalThis as any).ResizeObserver === "undefined") {
  (globalThis as any).ResizeObserver = TestResizeObserver;
}

// Global MSW lifecycle hooks for all tests. Individual test files can
// use server.use(...) to add scenario-specific handlers.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

