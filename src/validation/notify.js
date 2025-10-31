import Joi from "joi";

/** Validates incoming notification request
 * @param {Object} data
 * @param {string} data.source - Source of notification
 * @param {string} [data.priority] - Priority level
 * @param {string} data.message - Notification message
 * @param {Array<string>} data.channels - Channels to send the notification
 * @param {Date} [data.sendAt] - Optional send time in ISO 8601 format (e.g. 2025-10-21T08:00:00Z)
 */

const SOURCES = Object.freeze({
  TELEGRAM_BOT: 'telegramBot',
  DISCOUNTS_SCR: 'discountsScr', 
  URGENT_EXTERNAL: 'urgentExternal',
  NEW_ROUTE: 'newRoute',
  BACKUP_SCRIPT: 'backup_script'
});

const CHANNELS = Object.freeze({
  TELEGRAM: 'telegram',
  LOGFILE: 'logfile',
  CONSOLE: 'console'
});

const PRIORITIES = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
});

const MAX_FUTURE_DAYS = 30; // максимум 30 дней вперед

const debugMessages = {
  'string.base': 'Field must be a string',
  'any.required': 'Field is required',
  'any.only': (context) => {
    const field = context.key;
    const validValues = Array.isArray(context.valids) 
      ? context.valids.join(', ') 
      : Object.values(context.valids).join(', ');
    return `Invalid ${field}. Allowed values are: ${validValues}`;
  },
  'array.base': 'Field must be an array',
  'array.min': 'Array must contain at least {#limit} item',
  'array.unique': 'Array items must be unique',
  'date.base': 'Field must be a valid date',
  'date.format': 'Date must be in ISO 8601 format (e.g. 2025-10-21T08:00:00Z)',
  'date.greater': 'Date must be in the future',
  'date.less': `Date cannot be more than ${MAX_FUTURE_DAYS} days in the future`
};

const productionMessages = {
  'string.base': 'Invalid format',
  'any.required': 'Required field missing',
  'any.only': 'Invalid value',
  'array.base': 'Invalid format',
  'array.min': 'Invalid value',
  'array.unique': 'Duplicate values not allowed',
  'date.base': 'Invalid date',
  'date.format': 'Invalid date format',
  'date.greater': 'Invalid date',
  'date.less': 'Invalid date'
};

const createValidationSchema = (debug = false) => {
  const messages = debug ? debugMessages : productionMessages;

  return Joi.object({
    source: Joi.string()
      .valid(...Object.values(SOURCES))
      .required()
      .messages(messages),
    priority: Joi.string()
      .valid(...Object.values(PRIORITIES))
      .optional()
      .messages(messages),
    message: Joi.string()
      .required()
      .messages(messages),
    channels: Joi.array()
      .items(Joi.string().valid(...Object.values(CHANNELS)))
      .min(1)
      .unique()
      .required()
      .messages(messages),
    sendAt: Joi.date()
      .iso()
      .greater("now")
      .less(Date.now() + (MAX_FUTURE_DAYS * 24 * 60 * 60 * 1000))
      .timestamp("javascript")
      .optional()
      .messages(messages),
  });
};

export {
  createValidationSchema as default,
  SOURCES,
  CHANNELS,
  PRIORITIES
};
