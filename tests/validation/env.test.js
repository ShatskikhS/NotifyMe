import { test, expect, beforeEach, afterEach, vi } from "vitest";

vi.mock("dotenv", () => ({
  default: { config: vi.fn() }, // Мокаем dotenv.config модуль, чтобы он не подгружал данные из реального файла,
}));

const cases = [
  { env: { PORT: "3000" }, expected: { PORT: 3000 } },
  { env: { DEBUG: true }, expected: { DEBUG: true } },
  { env: { PORT: "2000", DEBUG: true }, expected: { PORT: 2000, DEBUG: true } },
  { env: { DEBUG: "" }, expected: { DEBUG: false } },
  { env: {}, expected: {} },
  { env: { DEBUG: "abc" }, expectedError: true },
  { env: { PORT: "abc" }, expectedError: true },
  { env: { PORT: "70000" }, expectedError: true },
];

let OLD_ENV;

beforeEach(() => {
  OLD_ENV = { ...process.env };
});

afterEach(() => {
  process.env = { ...OLD_ENV };
});

test.each(cases)(
  "env params validation %o",
  async ({ env, expected, expectedError }) => {
    process.env = { ...env };
    vi.resetModules();
    if (expectedError) {
      await expect(import("../../src/validation/env.js")).rejects.toThrow();
    } else {
      const { default: envOptions } = await import(
        "../../src/validation/env.js"
      );
      expect(envOptions).toEqual(expected);
    }
  }
);
