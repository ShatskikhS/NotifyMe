import Joi from 'joi';

const envSchema = Joi.object({
  PORT: Joi.alternatives()
    .try(
      Joi.number().port(),           // корректное число → число
      Joi.string().valid('').optional() // пустая строка → разрешаем
    )
    .custom((value, helpers) => {
      if (value === '') return undefined; // явно превращаем '' в undefined
      return value;
    }),
  DEBUG: Joi.boolean().falsy('').default(false)
}).unknown();

export default envSchema;
