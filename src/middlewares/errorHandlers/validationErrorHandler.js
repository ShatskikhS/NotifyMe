import { ValidationError } from "../../errors.js";
import { STATUS_TEXT } from "../../models/consts/statusTexts.js";
import { SERVICE_NAMES } from "../../models/consts/serviceNames.js";

/**
 * Express error handler middleware factory for validation errors.
 *
 * Returns an error handler that specifically handles ValidationError instances.
 * If the error is not a ValidationError, it passes it to the next error handler
 * in the middleware chain.
 *
 * @param {import('../../config/config.js').default} config - Application configuration
 *   instance containing settings (e.g., debug mode)
 * @param {import('../../logger.js').default} logger - MainLogger instance for logging
 *   operations and errors during request processing (used for debug-level logging when
 *   validation errors are handled)
 * @returns {function(Error, import('express').Request, import('express').Response, import('express').NextFunction): void}
 *   Express error handler middleware function
 *
 * @example
 * // In app.js
 * app.use(validationErrorHandler(config, mainLogger));
 */
export default function validationErrorHandler(config, logger) {
  return (err, req, res, next) => {
    if (!(err instanceof ValidationError)) return next(err);

    const clientIp = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    logger.warn(
      logger.formatMessage(SERVICE_NAMES.VALIDATION, `${err.name} handled`, {
        status: err.status,
        statusText: STATUS_TEXT[err.status],
        method: req.method,
        url: req.originalUrl,
        client: clientIp,
        userAgent: userAgent,
      })
    );

    res.status(err.status).json({
      status: `${STATUS_TEXT[err.status]}`,
      message: err.message,
      ...(config.debug && {
        details: err.details,
        time: new Date(),
      }),
    });
  };
}
