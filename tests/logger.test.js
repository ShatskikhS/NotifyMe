// tests/logger.test.js
import { test, expect, vi, beforeEach } from "vitest";

// Мокаем winston
vi.mock("winston", () => {
  const fakeCreateLogger = vi.fn(() => ({
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  }));

  const fakeTransports = {
    File: vi.fn(),
    Console: vi.fn(),
  };

  const fakeFormat = {
    combine: vi.fn(),
    timestamp: vi.fn(),
    printf: vi.fn(),
    colorize: vi.fn(),
    errors: vi.fn(),
    json: vi.fn(),
  };

  return {
    default: {
      createLogger: fakeCreateLogger,
      transports: fakeTransports,
      format: fakeFormat,
    },
  };
});

beforeEach(() => {
  vi.resetModules();
});

test("logger uses debug level when config.debug = true", async () => {
  // мок config перед импортом logger.js
  vi.doMock("../../src/config/config.js", () => ({
    default: { debug: true },
  }));

  const winston = await import("winston");
  await import("../../src/logger.js");

  expect(winston.default.createLogger).toHaveBeenCalledWith(
    expect.objectContaining({
      level: "debug",
    })
  );
});

test.skip("logger uses info level when config.debug = false", async () => {
  vi.doMock("../../src/config/config.js", () => ({
    default: { debug: false },
  }));

  const winston = await import("winston");
  await import("../../src/logger.js");

  expect(winston.default.createLogger).toHaveBeenCalledWith(
    expect.objectContaining({
      level: "info",
    })
  );
});
