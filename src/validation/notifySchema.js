import Joi from "joi";
import { SOURCES, CHANNELS, PRIORITIES } from "../models/consts/notificationFields.js"

/** Validates incoming notification request
 * @param {Object} data
 * @param {string} data.source - Source of notification
 * @param {string} [data.priority] - Priority level
 * @param {string} data.message - Notification message
 * @param {Array<string>} data.channels - Channels to send the notification
 * @param {Date} [data.sendAt] - Optional send time in ISO 8601 format (e.g. 2025-10-21T08:00:00Z)
 */

const MAX_FUTURE_DAYS = 30;

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
};

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
};

const createNotificationSchema = (debug = false) => {
  const messages = debug ? debugMessages : productionMessages;

  return Joi.object({
    source: Joi.string()
      .valid(...Object.values(SOURCES))
      .required(),
    priority: Joi.string()
      .valid(...Object.values(PRIORITIES))
      .optional(),
    message: Joi.string().required(),
    channels: Joi.array()
      .items(Joi.string().valid(...Object.values(CHANNELS)))
      .min(1)
      .unique()
      .required(),
    sendAt: Joi.date()
      .iso()
      .greater("now")
      .less(Date.now() + MAX_FUTURE_DAYS * 24 * 60 * 60 * 1000)
      .optional()
  })
    .unknown(false) // явно запрещаем неизвестные поля
    .messages({
      ...messages,
      'object.unknown': debug 
        ? 'Field "{#key}" is not allowed in the request'
        : 'Invalid request structure'
    });
};

export { createNotificationSchema as default, SOURCES, CHANNELS, PRIORITIES };
