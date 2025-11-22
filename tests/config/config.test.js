import { test, expect, vi } from "vitest";

const cases = [
  { 
    envOptions: { port: 3000, debug: true, notificationsFile: "data/notifications.json" }, 
    cliOptions: { port: 2000, debug: false, notificationsFile: "data/allNotifications.json" }, 
    expected: { port: 2000, debug: false, notificationsFile: "data/allNotifications.json" } 
  },
  { 
    envOptions: { debug: true }, 
    cliOptions: { port: 2000, debug: false }, 
    expected: { port: 2000, debug: false } 
  },
  {
    envOptions: { }, 
    cliOptions: { port: 2000, debug: false, notificationsFile: "data/notifications.json" }, 
    expected: { port: 2000, debug: false, notificationsFile: "data/notifications.json" } },
  {
    envOptions: { debug: true }, 
    cliOptions: { port: 2000 }, 
    expected: { port: 2000, debug: true }
  },
  {
    envOptions: { }, 
    cliOptions: { port: 2000 },
    expected: { port: 2000, debug: false }
  },
  {
    envOptions: {}, 
    cliOptions: {}, 
    expectedError: true 
  },
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
    const { default: Config } = await import("../../src/config/config.js");
    if (expectedError) {
      expect(() => {const config = new Config()}).toThrow();
    } else {
      const config = new Config();
      expect(config).toMatchObject(expected);
    }
  }
);
