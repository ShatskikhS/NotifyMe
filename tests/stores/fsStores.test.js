import { describe, test, expect, vi } from "vitest";

import { validStorageCases, invalidStorageCases } from "../fixtures/storageCases.js"

const mockedLogger = {
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  http: vi.fn(),
  debug: vi.fn(),
  silly: vi.fn(),
};

describe("storage initialization", () => {
  test.each([...validStorageCases, ...invalidStorageCases])(
    "$name",
    async ({ input, expected, expectedError }) => {
      vi.resetModules();
      vi.doMock("node:fs", () => ({
        default: {
          existsSync: () => true,
          readFileSync: () => JSON.stringify(input),
        }
      }));
      const { default: FsNotifications } = await import("../../src/stores/fsStores.js");
      if (expectedError) {
        expect(() => { new FsNotifications("", mockedLogger, true) }).toThrow(expectedError);
      }
      if (expected) {
        expect(new FsNotifications("", mockedLogger, true)).toBeInstanceOf(FsNotifications);
      }
    }
  )
})
