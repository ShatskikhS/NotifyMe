import { test, expect, vi } from "vitest";

const cases = [
  { envOptions: { port: 3000, debug: true }, cliOptions: { port: 2000, debug: false }, expected: { port: 2000, debug: false } },
  { envOptions: { debug: true }, cliOptions: { port: 2000, debug: false }, expected: { port: 2000, debug: false } },
  { envOptions: { }, cliOptions: { port: 2000, debug: false }, expected: { port: 2000, debug: false } },
  { envOptions: { debug: true }, cliOptions: { port: 2000 }, expected: { port: 2000, debug: true } },
  { envOptions: { }, cliOptions: { port: 2000 }, expected: { port: 2000, debug: false } },
  { envOptions: {}, cliOptions: {}, expectedError: true },
];

test.each(cases)(
  "test params: %o",
  async ({ envOptions, cliOptions, expected, expectedError }) => {
    vi.resetModules();
    vi.doMock("../../src/config/cli.js", () => ({
      default: cliOptions,
    }));
    vi.doMock("../../src/config/env.js", () => ({
      default: envOptions,
    }));
    if (expectedError) {
      await expect(import("../../src/config/config.js")).rejects.toThrow();
    } else {
      const { default: config } = await import("../../src/config/config.js");
      expect(config).toEqual(expected);
    }
  }
);
