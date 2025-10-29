import { test, expect, vi } from "vitest";

const cases = [
  {
    envOptions: { PORT: 3000 },
    cliOptions: { port: 2000 },
    expected: { port: 2000, debug: false },
  },
  { envOptions: {}, cliOptions: {}, expectedError: true },
];

test.each(cases)(
  "test params: %o",
  async ({ envOptions, cliOptions, expected, expectedError }) => {
    vi.resetModules();
    vi.doMock("../../src/validation/cliParams.js", () => ({
      default: cliOptions,
    }));
    vi.doMock("../../src/validation/env.js", () => ({
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
