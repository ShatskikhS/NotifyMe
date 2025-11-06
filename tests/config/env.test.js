import { test, expect, beforeEach, afterEach, vi } from "vitest";

vi.mock("dotenv", () => ({
  default: { config: vi.fn() }, // Мокаем dotenv.config модуль, чтобы он не подгружал данные из реального файла,
}));

/**
 * @typedef {Object} TestCase
 * @property {Record<string, any>} env
 * @property {Record<string, any>} [expected]
 * @property {boolean} [expectedError]
 * @property {string} [expectedMessage]
 */

/** @type {TestCase[]} */
const cases = [
  { env: { PORT: "3000" }, expected: { port: 3000 } },
  { env: { PORT: "" }, expected: { port: undefined } },
  { env: { DEBUG: true }, expected: { debug: true } },
  {
    env: {
      PORT: "2000",
      DEBUG: true,
      NOTIFICATIONS_FILE: "validFilename.json",
    },
    expected: {
      port: 2000,
      debug: true,
      notificationsFile: "validFilename.json",
    },
  },
  { env: { DEBUG: "" }, expected: { debug: false } },
  {
    env: { NOTIFICATIONS_FILE: "" },
    expected: { notificationsFile: undefined },
  },
  {
    env: { NOTIFICATIONS_FILE: "/data/validPath.json" },
    expected: { notificationsFile: "/data/validPath.json" },
  },
  { env: {}, expected: {} },
  { env: { DEBUG: "abc" }, expectedError: true },
  { env: { PORT: "abc" }, expectedError: true },
  { env: { PORT: "70000" }, expectedError: true },
  { env: { NOTIFICATIONS_FILE: "noExtension" }, expectedError: true },
  { env: { NOTIFICATIONS_FILE: "invalidSymbol?.json" }, expectedError: true },
  { env: { NOTIFICATIONS_FILE: "some:path.json" }, expectedError: true },
];

let OLD_ENV;

beforeEach(() => {
  OLD_ENV = { ...process.env };
});

afterEach(() => {
  process.env = { ...OLD_ENV };
  vi.resetModules();
  vi.clearAllMocks();
});

test.each(cases)(
  "validates environment config with params: $env",
  async ({ env, expected, expectedError }) => {
    process.env = { ...env };
    vi.resetModules();
    if (expectedError) {
      await expect(import("../../src/config/env.js")).rejects.toThrow();
    } else {
      const { default: envOptions } = await import("../../src/config/env.js");
      expect(envOptions).toEqual(expected);
    }
  }
);
