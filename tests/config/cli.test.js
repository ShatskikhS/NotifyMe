import { test, expect, beforeEach, afterEach, vi } from "vitest";

const cases = [
  { input: ["-d", "-p", "3000"], expected: { debug: true, port: 3000 } },
  { input: [], expected: {} },
  { input: ["-d"], expected: { debug: true } },
  { input: ["--debug"], expected: { debug: true } },
  { input: ["-p", "3000"], expected: { port: 3000 } },
  { input: ["--port", "3000"], expected: { port: 3000 } },
  { input: ["-d", "-p", "abc"], expectedError: true },
  { input: ["-d", "-p", "70000"], expectedError: true },
];

let OLD_ARGV;

beforeEach(() => {
  OLD_ARGV = [...process.argv];
});

afterEach(() => {
  process.argv = [...OLD_ARGV];
});

test.each(cases)(
  "cli params validation %o",
  async ({ input, expected, expectedError }) => {
    process.argv = process.argv.concat(input);
    vi.resetModules();
    if (expectedError) {
      await expect(import("../../src/config/cli.js")).rejects.toThrow();
    } else {
      const { default: options } = await import(
        "../../src/config/cli.js"
      );
      expect(options).toEqual(expected);
    }
  }
);
