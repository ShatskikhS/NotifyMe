import Joi from "joi";

const PROHIBITED_SYMBOLS = ["?", "*", ":", "|", "<", ">"];
const JSON_EXTENSION = ".json";

/**
 * @typedef {Object} AppOptions
 * @property {number|undefined} port - Server port number
 * @property {boolean} debug - Debug mode flag
 * @property {string|undefined} notificationsFile - Path to notification storage file
 */

/**
 * Validation schema for application options
 * @type {Joi.ObjectSchema<AppOptions>}
 */
const optionsSchema = Joi.object({
  port: Joi.alternatives()
    .try(
      Joi.number().port(), // valid port number
      Joi.string().valid("").optional() // empty string allowed
    )
    .custom((value, helpers) => {
      if (value === "") return undefined; // convert empty string to undefined
      return value;
    }),

  debug: Joi.boolean().falsy(""),

  notificationsFile: Joi.alternatives()
    .try(
      Joi.string().valid("").optional(), // empty string allowed
      Joi.string() // regular string - validated below
    )
    .custom((value, helpers) => {
      if (value === "") return undefined;
      if (!value.endsWith(JSON_EXTENSION)) {
        return helpers.error("any.invalid", {
          message: "file must have a .json extension",
        });
      }
      if (PROHIBITED_SYMBOLS.some((s) => value.includes(s))) {
        return helpers.error("any.invalid", {
          message: "prohibited symbols: ? * : | < >",
        });
      }
      return value;
    })
    .optional(),

}).unknown();

export default optionsSchema;
