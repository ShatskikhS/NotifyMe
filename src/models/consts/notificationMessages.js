/**
 * Detailed error messages for validation errors in debug mode.
 * Provides specific information about what went wrong and how to fix it.
 * @type {Record<string, string>}
 */
const DEBUG_MESSAGES = {
  "string.base": "Field must be a string",
  "any.required": "{#label} field is required",
  "any.only": '"{#value}" is invalid value for {#label}. Allowed values are: {#valids}',
  "array.base": "Field must be an array",
  "array.min": "Array must contain at least {#limit} item",
  "array.unique": 'Duplicate values not allowed. Duplicate field: {#label}, value: "{#dupeValue}".',
  "date.base": "Field must be a valid date",
  "date.format": "Date must be in ISO 8601 format (e.g. 2025-10-21T08:00:00Z)",
  "date.greater": "Date must be in the future",
  "object.unknown": "Field '{#key}' is not allowed in the request",
  "object.base": "Value '{#value}' must be a valid Notification class object",
  "number.min": '{#label} must be greater than or equal to {#limit}',
};

/**
 * Generic error messages for validation errors in production mode.
 * Provides minimal information to avoid exposing internal details.
 * @type {Record<string, string>}
 */
const PRODUCTION_MESSAGES = {
  "string.base": "Invalid format",
  "any.required": "Required field missing",
  "any.only": "Invalid value",
  "array.base": "Invalid format",
  "array.min": "Invalid value",
  "array.unique": "Duplicate values not allowed",
  "date.base": "Invalid date",
  "date.format": "Invalid date format",
  "date.greater": "Invalid date",
  "date.less": "Invalid date",
  "object.unknown": "Invalid request structure",
  "number.min": "Invalid value",
};

export { DEBUG_MESSAGES, PRODUCTION_MESSAGES };
