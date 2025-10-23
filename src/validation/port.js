import Joi from "joi";

export default function parsePort(value, customError) {
  const schema = Joi.number().port();
  const { error, value: validated } = schema.validate(value, { convert: true });

  if (error) {
    throw customError || new Error(`Invalid port number: ${value}`);
  }

  return validated;
}
