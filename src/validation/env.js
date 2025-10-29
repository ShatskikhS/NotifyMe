import Joi from "joi";
import dotenv from "dotenv";
import { EnvironmentValueError } from "../errors.js";

dotenv.config({ quiet: true });

const envSchema = Joi.object({
  PORT: Joi.alternatives()
    .try(
      Joi.number().port(), // корректное число → число
      Joi.string().valid("").optional() // пустая строка → разрешаем
    )
    .custom((value, helpers) => {
      if (value === "") return undefined; // явно превращаем '' в undefined
      return value;
    }),
  DEBUG: Joi.boolean().falsy(""),
}).unknown();

const result = envSchema.validate(process.env);

const { error, value: envOptions } = result;
if (error) throw new EnvironmentValueError(error.message);

export default envOptions;
