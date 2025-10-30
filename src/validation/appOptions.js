import Joi from "joi";

const optionsSchema = Joi.object({
  port: Joi.alternatives()
    .try(
      Joi.number().port(), // корректное число → число
      Joi.string().valid("").optional() // пустая строка → разрешаем
    )
    .custom((value, helpers) => {
      if (value === "") return undefined; // явно превращаем '' в undefined
      return value;
    }),
  debug: Joi.boolean().falsy(""),
}).unknown();

export default optionsSchema;