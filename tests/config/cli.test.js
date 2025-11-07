import { test, expect, beforeEach, afterEach, vi } from "vitest";

/**
 * @typedef {Object} ValidTestCase
 * @property {string} name - Test case name
 * @property {string[]} input - Command line arguments array
 * @property {Object} expected - Expected parsed options object
 * @property {boolean} [expected.debug] - Expected debug flag value
 * @property {number} [expected.port] - Expected port number
 * @property {string} [expected.notificationsFile] - Expected notifications file path
 */

/**
 * @typedef {Object} InvalidTestCase
 * @property {string} name - Test case name
 * @property {string[]} input - Command line arguments array
 * @property {boolean} expectedError - Whether an error is expected
 */

/**
 * Test cases for CLI argument parsing.
 * @type {{valid: ValidTestCase[], invalid: InvalidTestCase[]}}
 */
const cases = {
  valid: [
    {
      name: "all options",
      input: ["-d", "-p", "3000", "--notifications-file", "validFilename.json"],
      expected: {
        debug: true,
        port: 3000,
        notificationsFile: "validFilename.json",
      },
    },
    { name: "no options", input: [], expected: {} },
    { name: "debug option", input: ["-d"], expected: { debug: true } },
    {
      name: "debug long option",
      input: ["--debug"],
      expected: { debug: true },
    },
    {
      name: "port short option",
      input: ["-p", "3000"],
      expected: { port: 3000 },
    },
    {
      name: "port long option",
      input: ["--port", "3000"],
      expected: { port: 3000 },
    },
    {
      name: "valid notifications file",
      input: ["--notifications-file", "validFilename.json"],
      expected: { notificationsFile: "validFilename.json" },
    },
    {
      name: "valid notifications file with path",
      input: ["--notifications-file", "/data/validPath.json"],
      expected: { notificationsFile: "/data/validPath.json" },
    },
  ],
  invalid: [
    {
      name: "invalid port",
      input: ["-d", "-p", "abc"],
      expectedError: true,
    },
    {
      name: "port number too high",
      input: ["-d", "-p", "70000"],
      expectedError: true,
    },
    {
      name: "missing notifications file argument",
      input: ["--notifications-file"],
      expectedError: true,
    },
    {
      name: "notifications file without extension",
      input: ["--notifications-file", "noExtension"],
      expectedError: true,
    },
    {
      name: "notifications file with invalid symbol",
      input: ["--notifications-file", "invalidSymbol?.json"],
      expectedError: true,
    },
    {
      name: "notifications file with colon in path",
      input: ["--notifications-file", "some:path.json"],
      expectedError: true,
    },
  ],
};

/** @type {string[]} Original process.argv saved before each test */
let OLD_ARGV;

beforeEach(() => {
  OLD_ARGV = [...process.argv];
});

afterEach(() => {
  process.argv = [...OLD_ARGV];
  vi.resetModules();
  vi.clearAllMocks();
});

test.each([...cases.valid, ...cases.invalid])(
  "$name",
  async ({ input, expected, expectedError }) => {
    // Preserve first two elements (node executable and script path) from original argv and append test input
    process.argv = [OLD_ARGV[0], OLD_ARGV[1] || "node", ...input];
    vi.resetModules();
    if (expectedError) {
      await expect(import("../../src/config/cli.js")).rejects.toThrow();
    } else {
      const { default: options } = await import("../../src/config/cli.js");
      expect(options).toEqual(expected);
    }
  }
);
