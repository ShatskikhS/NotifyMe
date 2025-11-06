import { describe, test, expect } from "vitest";
import optionsSchema from "../../src/validation/appOptionsSchema.js";

const cases = [
  {
    name: "string port -> number, string debug true -> boolean, file ok",
    input: {
      port: "2000",
      debug: "true",
      notificationsFile: "validFilename.json",
    },
    expected: {
      port: 2000,
      debug: true,
      notificationsFile: "validFilename.json",
    },
  },
  {
    name: "empty debug -> false",
    input: { debug: "" },
    expected: { debug: false },
  },
  {
    name: 'string "false" debug -> false',
    input: { debug: "false" },
    expected: { debug: false },
  },
  {
    name: "notificationsFile relative path",
    input: { notificationsFile: "validFilename.json" },
    expected: { notificationsFile: "validFilename.json" },
  },
  {
    name: "notificationsFile absolute path",
    input: { notificationsFile: "/data/validPath.json" },
    expected: { notificationsFile: "/data/validPath.json" },
  },
  {
    name: "empty notificationsFile -> omitted",
    input: { notificationsFile: "" },
    expected: {},
  },
  {
    name: "empty input -> {}",
    input: {},
    expected: {},
  },
  {
    name: "port out of range -> error",
    input: { port: "70000" },
    expectedError: true,
  },
  {
    name: "port non-numeric -> error",
    input: { port: "abc" },
    expectedError: true,
  },
  {
    name: "debug invalid -> error",
    input: { debug: "abc" },
    expectedError: true,
  },
  {
    name: "notificationsFile missing extension -> error",
    input: { notificationsFile: "noExtension" },
    expectedError: true,
  },
  {
    name: "notificationsFile prohibited symbol -> error",
    input: { notificationsFile: "invalidSymbol?.json" },
    expectedError: true,
  },
  {
    name: 'notificationsFile contains ":" (prohibited) -> error',
    input: { notificationsFile: "some:path.json" },
    expectedError: true,
  },
];

describe("optionsSchema", () => {
  test.each(cases)("$name", ({ input, expected, expectedError }) => {
    const { error, value: result } = optionsSchema.validate(input, {
      convert: true,
      abortEarly: false,
    });

    if (expectedError) {
      expect(error).toBeDefined();
      return;
    }

    expect(error).toBeUndefined();
    expect(result).toEqual(expected);

    if (expected && Object.keys(expected).length === 0) {
      expect(result).not.toHaveProperty("notificationsFile");
    }
  });
});
