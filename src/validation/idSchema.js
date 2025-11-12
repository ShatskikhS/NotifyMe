import Joi from "joi";

const debugMessages = {
  "number.base": "id must be a number. Got: '{#value}'",
  "number.integer": "id must be an integer. Got: '{#value}'",
  "number.min": "id must be greater than 0. Got '{#value}'",
};

const productionMessages = {
  "number.base": "Invalid format",
  "number.integer": "Invalid value",
  "number.min": "Invalid value",
};

export default function createIdSchema(isDebug = false) {
  return Joi.number()
    .integer()
    .min(1)
    .messages(isDebug ? debugMessages : productionMessages);
}
