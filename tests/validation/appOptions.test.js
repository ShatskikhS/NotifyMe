import { test, expect, vi } from "vitest";
import optionsSchema from "../../src/validation/appOptions.js";
import { error } from "winston";

const cases = [
    { input: { port: "2000", debug: "true" }, expected: { port: 2000, debug: true } },
    { input: { debug: "" }, expected: { debug: false } },
    { input: { debug: "false" }, expected: { debug: false } },
    { input: {}, expected: {} },
    { input: { port: "70000" }, expectedError: true },
    { input: { port: "abc" }, expectedError: true },
    { input: { debug: "abc" }, expectedError: true },
];

test.each(cases)("test data %o", ({input, expected, expectedError}) => {
    const { error, "value": result } = optionsSchema.validate(input);
    if (expectedError) {
        expect(error).toBeDefined();
    } else {
        expect(result).toEqual(expected);
    }
});
