import createIdSchema from "../validation/idSchema.js";
import { IdValidationError} from "../errors.js";

/**
 * Middleware for validating notification ID parameter from route.
 *
 * Validates the `:id` parameter from req.params.id using Joi schema.
 * If validation succeeds, replaces req.params.id with the validated number value.
 * If validation fails, throws IdValidationError which should be caught by error handler.
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @param {import('../config/config.js').default} config - Application configuration
 *   instance containing settings (e.g., debug mode)
 * @param {import('../logger.js').default} logger - MainLogger instance for logging
 *
 * @throws {IdValidationError} When the ID parameter validation fails (invalid format,
 *   not a number, or less than 1)
 *
 * @example
 * // Usage in router:
 * router.get("/:id", validateIdMiddleware(config, logger), getIdController);
 */
export default function validateIdMiddleware(config, logger) {
  return (req, res, next) => {
    try {
      const idSchema = createIdSchema(config.debug);

      /**
       * Validation result containing error (if any) and validated value.
       * @type {{error?: import('joi').ValidationError, value: number}}
       */
      const { error, value: validatedId } = idSchema.validate(req.params.id);

      if (error) {
        throw new IdValidationError(error);
      }

      req.params.id = validatedId;

      next();
    } catch (err) {
      next(err);
    }
  };
}

