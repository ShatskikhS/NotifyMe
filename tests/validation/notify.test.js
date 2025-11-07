import { test, expect, describe } from "vitest";
import createValidationSchema from "../../src/validation/notify.js";
import { CHANNELS, SOURCES, PRIORITIES } from "../../src/models/consts/notificationFields.js";

const testDate = new Date(Date.now() + 60 * 1000);

const validCases = [
  {
    input: {
      source: "telegramBot",
      priority: "medium",
      message: "test message",
      channels: ["telegram", "console"],
      sendAt: testDate,
    },
    expected: {
      source: "telegramBot",
      priority: "medium",
      message: "test message",
      channels: ["telegram", "console"],
      sendAt: testDate,
    },
  },
  {
    input: {
      source: "discountsScr",
      message: "test message",
      channels: ["telegram", "console"],
    },
    expected: {
      source: "discountsScr",
      message: "test message",
      channels: ["telegram", "console"],
    },
  },
];

const errorCases = [
  {
    input: {
      source: "wrong source",
      message: "test message",
      channels: ["telegram", "console"],
    },
    expectedMessages: {
      prod: "Invalid value",
      debug: `"wrong source" is invalid value for "source". Allowed values are: [${Object.values(SOURCES).join(', ')}]`,
    },
  },
  {
    input: {
      source: 1,
      message: "test message",
      channels: ["telegram", "console"],
    },
    expectedMessages: {
      prod: "Invalid value",
      debug: `"1" is invalid value for "source". Allowed values are: [${Object.values(SOURCES).join(', ')}]`,
    },
  },
  {
    input: {
      message: "test message",
      channels: ["telegram", "console"],
    },
    expectedMessages: {
      prod: "Required field missing",
      debug: '"source" field is required',
    },
  },
  {
    input: {
      source: "telegramBot",
      priority: "wrong priority",
      message: "test message",
      channels: ["telegram", "console"],
    },
    expectedMessages: {
      prod: "Invalid value",
      debug: `"wrong priority" is invalid value for "priority". Allowed values are: [${Object.values(PRIORITIES).join(', ')}]`,
    },
  },
  {
    input: {
      source: "telegramBot",
      message: "",
      channels: ["telegram", "console"],
    },
    expectedMessages: {
      prod: '"message" is not allowed to be empty',
      debug: '"message" is not allowed to be empty',
    },
  },
  {
    input: {
      source: "telegramBot",
      channels: ["telegram", "console"],
    },
    expectedMessages: {
      prod: "Required field missing",
      debug: '"message" field is required',
    },
  },
  {
    input: {
      source: "telegramBot",
      message: "test message",
      channels: ["invalid chanel"],
    },
    expectedMessages: {
      prod: "Invalid value",
      debug: `"invalid chanel" is invalid value for "channels[0]". Allowed values are: [${Object.values(CHANNELS).join(', ')}]`,
    },
  },
  {
    input: {
      source: "telegramBot",
      message: "test message",
      channels: [],
    },
    expectedMessages: {
      prod: "Invalid value",
      debug: "Array must contain at least 1 item",
    },
  },
  {
    input: {
      source: "telegramBot",
      message: "test message",
    },
    expectedMessages: {
      prod: "Required field missing",
      debug: '"channels" field is required',
    },
  },
  {
    input: {
      source: "telegramBot",
      message: "test message",
      channels: ["telegram", "console"],
      sendAt: "wrong date",
    },
    expectedMessages: {
      prod: "Invalid date format",
      debug: "Date must be in ISO 8601 format (e.g. 2025-10-21T08:00:00Z)",
    },
  },
  {
    input: {
      source: "telegramBot",
      message: "test message",
      channels: ["telegram", "console"],
      sendAt: new Date(),
    },
    expectedMessages: {
      prod: "Invalid date",
      debug: "Date must be in the future",
    },
  },
  {
    input: {
      source: "telegramBot",
      message: "test message",
      channels: ["telegram", "telegram"],
    },
    expectedMessages: {
      prod: "Duplicate values not allowed",
      debug: 'Duplicate values not allowed. Duplicate field: "channels[1]", value: "telegram".',
    },
  },
  {
    input: {
      source: "telegramBot",
      message: "test message",
      channels: ["telegram"],
      unknownField: "value",
    },
    expectedMessages: {
      prod: "Invalid request structure",
      debug: 'Field "unknownField" is not allowed in the request',
    },
  },
];

/**
 * Test suite for notification request validation
 * @group validation
 * @group notifications
 */
describe("Notification Validation", () => {
  describe("When DEBUG = false (production mode)", () => {
    const prodSchema = createValidationSchema();
    test.each(validCases)("Valid input: %o", ({ input, expected }) => {
      const { error, value: result } = prodSchema.validate(input);
      expect(result, "Validated object should match expected").toEqual(expected);
      expect(error, "Should not return validation error").toBeUndefined();
    });

    test.each(errorCases)(
      "Invalid input: %o",
      ({ input, expectedMessages }) => {
        const { error } = prodSchema.validate(input);
        expect(error.message).toBe(expectedMessages.prod);
      }
    );
  });

  describe("When DEBUG = true (development mode)", () => {
    const debugSchema = createValidationSchema(true);
    test.each(validCases)("Valid input: %o", ({ input, expected }) => {
      const { error, value: result } = debugSchema.validate(input);
      expect(result).toEqual(expected);
      expect(error).toBeUndefined();
    });

    test.each(errorCases)(
      "Invalid input: %o",
      ({ input, expectedMessages }) => {
        const { error } = debugSchema.validate(input);
        expect(error.message).toBe(expectedMessages.debug);
      }
    );
  });
});
