import { describe, test, expect } from "vitest";

import createStorageSchema from "../../src/validation/storageSchema.js";

const validCases = [{
  "2": {
    "id": 2,
    "source": "telegramBot",
    "priority": "low",
    "message": "message 1",
    "channels": [
      "console"
    ],
    "receivedAt": "2025-11-12T01:09:59.032Z",
    "sendAt": null,
    "status": "delivered"
  },
  "3": {
    "id": 3,
    "source": "telegramBot",
    "priority": "low",
    "message": "message 3",
    "channels": [
      "console"
    ],
    "receivedAt": "2025-11-12T01:11:03.693Z",
    "sendAt": "2025-11-12T01:14:10.229Z",
    "status": "delivered"
  },
}];

const invalidCases = [
  {
    name: "invalid main id -> error",
    input: {
      "invalid id": {
        "id": 3,
        "source": "telegramBot",
        "priority": "low",
        "message": "message 3",
        "channels": [
          "console"
        ],
        "receivedAt": "2025-11-12T01:11:03.693Z",
        "sendAt": "2025-11-12T01:14:10.229Z",
        "status": "delivered"
      },
    },
    expectedError: "Field 'invalid id' is not allowed in the request",
  },
  {
    name: "invalid notification object -> error",
    input: {
      "3": "invalid object"
    },
    expectedError: "Value 'invalid object' must be a valid Notification class object",
  },
  {
    name: "invalid notification id -> error",
    input: {
      "3": {
        "id": -1,
        "source": "telegramBot",
        "priority": "low",
        "message": "message 3",
        "channels": [
          "console"
        ],
        "receivedAt": "2025-11-12T01:11:03.693Z",
        "sendAt": "2025-11-12T01:14:10.229Z",
        "status": "delivered"
      },
    },
    expectedError: "\"3.id\" must be greater than or equal to 1",
  },
  {
    name: "invalid source value -> error",
    input: {
      "4": {
        "id": 4,
        "source": "invalidSource",
        "priority": "low",
        "message": "test",
        "channels": ["console"],
        "receivedAt": "2025-11-12T01:11:03.693Z",
        "sendAt": null,
        "status": "delivered"
      }
    },
    expectedError: "\"invalidSource\" is invalid value for \"4.source\". Allowed values are: [telegramBot, discountsScr, urgentExternal, newRoute, backup_script]",
  },
  {
    name: "invalid priority value -> error",
    input: {
      "5": {
        "id": 5,
        "source": "telegramBot",
        "priority": "critical",
        "message": "test",
        "channels": ["console"],
        "receivedAt": "2025-11-12T01:11:03.693Z",
        "sendAt": null,
        "status": "delivered"
      }
    },
    expectedError: "\"critical\" is invalid value for \"5.priority\". Allowed values are: [low, medium, high]",
  },
  {
    name: "duplicate channels -> error",
    input: {
      "6": {
        "id": 6,
        "source": "telegramBot",
        "priority": "low",
        "message": "test",
        "channels": ["console", "console"],
        "receivedAt": "2025-11-12T01:11:03.693Z",
        "sendAt": null,
        "status": "delivered"
      }
    },
    expectedError: "Duplicate values not allowed. Duplicate field: \"6.channels[1]\", value: \"console\".",
  },
  {
    name: "invalid date format -> error",
    input: {
      "7": {
        "id": 7,
        "source": "telegramBot",
        "priority": "low",
        "message": "test",
        "channels": ["console"],
        "receivedAt": "not-a-date",
        "sendAt": null,
        "status": "delivered"
      }
    },
    expectedError: "Date must be in ISO 8601 format (e.g. 2025-10-21T08:00:00Z)",
  },
  {
    name: "missing required field (message) -> error",
    input: {
      "8": {
        "id": 8,
        "source": "telegramBot",
        "priority": "low",
        "channels": ["console"],
        "receivedAt": "2025-11-12T01:11:03.693Z",
        "sendAt": null,
        "status": "delivered"
      }
    },
    expectedError: "\"8.message\" field is required",
  },
];

const storageSchema = createStorageSchema();

describe("storageSchema valid cases", () => {
  test.each(validCases)("some valid case", async (input) => {
    const { error } = storageSchema.validate(input);
    expect(error).toBeUndefined();
  }
)});

describe("storageSchema invalid cases", () => {
  test.each(invalidCases)(
    "$name",
    async ({ input, expectedError }) => {
      const { error } = storageSchema.validate(input);
      expect(error.message).toBe(expectedError);
    }
  )
})
