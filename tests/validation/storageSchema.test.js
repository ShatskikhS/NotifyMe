import { describe, test, expect } from "vitest";

import createStorageSchema from "../../src/validation/storageSchema.js";

import { validStorageCases, invalidStorageCases } from "../fixtures/storageCases.js"

const storageSchema = createStorageSchema();

describe("storageSchema", () => {
  test.each([...validStorageCases, ...invalidStorageCases])(
    "$name",
    async ({ input, expected, expectedError }) => {
      const { error } = storageSchema.validate(input);
      if (expected) {
        expect(error).toBeUndefined();
      }
      if (expectedError) {
        expect(error.message).toBe(expectedError);
      }
    }
  )
})
