import parsePort from "../../src/validation/port.js";
import { test, expect } from "vitest";

const cases = [
  { input: 8080, expected: 8080 },
  { input: "3000", expected: 3000 },
  { input: "65535", expected: 65535 },
  { input: 0, expected: 0 },
  { input: 70000, expectedError: true },
  { input: "abc", expectedError: true },
  { input: null, expectedError: true },
];

test.each(cases)("port validation %o", (currentCase) => {
  const { input, expected, expectedError } = currentCase;
  if ("expectedError" in currentCase && expectedError)
    expect(() => {
      parsePort(input);
    }).toThrow();
  else expect(parsePort(input)).toBe(expected);
});
