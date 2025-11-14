import Joi from "joi";
import { SOURCES, CHANNELS, PRIORITIES } from "../models/consts/notificationFields.js"

/**
 * Maximum number of days in the future that a notification can be scheduled.
 * @type {number}
 */
const MAX_FUTURE_DAYS = 30;

/**
 * Detailed error messages for validation errors in debug mode.
 * Provides specific information about what went wrong and how to fix it.
 * @type {Record<string, string>}
 */
const debugMessages = {
  "string.base": "Field must be a string",
  "any.required": "{#label} field is required",
  "any.only":
    '"{#value}" is invalid value for {#label}. Allowed values are: {#valids}',
  "array.base": "Field must be an array",
  "array.min": "Array must contain at least {#limit} item",
  "array.unique": 'Duplicate values not allowed. Duplicate field: {#label}, value: "{#dupeValue}".',
  "date.base": "Field must be a valid date",
  "date.format": "Date must be in ISO 8601 format (e.g. 2025-10-21T08:00:00Z)",
  "date.greater": "Date must be in the future",
  "date.less": `Date cannot be more than ${MAX_FUTURE_DAYS} days in the future`,
  "object.unknown": 'Field "unknownField" is not allowed in the request',
};

/**
 * Generic error messages for validation errors in production mode.
 * Provides minimal information to avoid exposing internal details.
 * @type {Record<string, string>}
 */
const productionMessages = {
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
};

/**
 * Creates a base Joi validation schema for notification fields.
 * This schema defines all possible notification fields with their validation rules,
 * but does not mark any fields as required. It serves as a foundation for creating
 * POST and PATCH request schemas.
 *
 * Field validations:
 * - `source`: Must be one of the valid SOURCES values
 * - `priority`: Must be one of the valid PRIORITIES values
 * - `message`: Must be a string
 * - `channels`: Must be an array with at least 1 item, containing unique CHANNELS values
 * - `sendAt`: Must be a valid ISO 8601 date in the future, but not more than MAX_FUTURE_DAYS days ahead
 *
 * The schema rejects unknown fields (fields not defined in the schema).
 *
 * @returns {import('joi').ObjectSchema} A Joi object schema for notification validation
 */
function getBaseNotificationSchema() {
  return Joi.object({
    source: Joi.string().valid(...Object.values(SOURCES)),
    priority: Joi.string().valid(...Object.values(PRIORITIES)),
    message: Joi.string(),
    channels: Joi.array()
      .items(Joi.string().valid(...Object.values(CHANNELS)))
      .min(1)
      .unique(),
    sendAt: Joi.date()
      .iso()
      .greater("now")
      .less(Date.now() + MAX_FUTURE_DAYS * 24 * 60 * 60 * 1000)
  }).unknown(false);
}

/**
 * Creates a Joi validation schema for POST requests to create notifications.
 *
 * This schema extends the base notification schema by marking the following fields
 * as required: `source`, `message`, and `channels`. All other fields remain optional.
 *
 * Used for validating request bodies in POST '/notifications' endpoint.
 *
 * @param {boolean} [debug=false] - If true, uses detailed error messages for debugging.
 *   If false, uses generic error messages for production.
 * @returns {import('joi').ObjectSchema} A Joi object schema configured for POST request validation
 *
 * @example
 * // Usage in a controller:
 * const schema = createNotificationSchema(config.debug);
 * const { error, value } = schema.validate(req.body);
 *
 * @example
 * // Valid request body:
 * {
 *   "source": "telegramBot",
 *   "message": "Test notification",
 *   "channels": ["telegram", "console"],
 *   "priority": "high",  // optional
 *   "sendAt": "2025-10-21T08:00:00Z"  // optional
 * }
 */
function createNotificationSchema(debug = false) {
  const schema = getBaseNotificationSchema().fork(
    ["source", "message", "channels"],
    (field) => field.required()
  );
  return schema.messages(debug ? debugMessages : productionMessages);
}

/**
 * Creates a Joi validation schema for PATCH requests to update planed notifications.
 *
 * This schema extends the base notification schema by making all fields optional,
 * but requires that at least one field must be present in the request body.
 * This ensures that PATCH requests always update at least one property.
 *
 * Used for validating request bodies in PATCH '/notifications/:id' endpoint.
 *
 * @param {boolean} [debug=false] - If true, uses detailed error messages for debugging.
 *   If false, uses generic error messages for production.
 * @returns {import('joi').ObjectSchema} A Joi object schema configured for PATCH request validation
 *
 * @example
 * // Usage in a controller:
 * const schema = updateNotificationSchema(config.debug);
 * const { error, value } = schema.validate(req.body);
 *
 * @example
 * // Valid request body (at least one field required):
 * {
 *   "priority": "high"  // can update just one field
 * }
 *
 * @example
 * // Valid request body (multiple fields):
 * {
 *   "message": "Updated message",
 *   "priority": "low",
 *   "sendAt": "2025-10-22T10:00:00Z"
 * }
 */
function updateNotificationSchema(debug = false) {
  const messages = debug ? debugMessages : productionMessages;

  return getBaseNotificationSchema()
    .fork(["source", "message", "channels", "priority", "sendAt"], (field) =>
      field.optional()
    )
    .min(1)
    .messages({
      ...messages,
      "object.min": debug
        ? "PATCH body must contain at least one updatable field"
        : "Invalid request payload"
    });
}


export { createNotificationSchema as default, updateNotificationSchema };
