import { DomainError } from "../../errors.js";
import { STATUS_TEXT } from "../../models/consts/statusTexts.js";

/**
 * Creates an Express error handler middleware for domain errors.
 *
 * This factory function returns an error handler that specifically handles
 * DomainError instances. If the error is not a DomainError, it passes
 * it to the next error handler in the middleware chain.
 *
 * @param {import('../../config/config.js').default} config - Application configuration
 *   instance containing settings (e.g., debug mode)
 * @param {import('../../logger.js').default} logger - MainLogger instance for logging
 *   operations and errors during request processing (used for debug-level logging when
 *   domain errors are handled)
 * @returns {function(Error, import('express').Request, import('express').Response, import('express').NextFunction): void}
 *   Express error handler middleware function
 *
 * @example
 * // In app.js
 * app.use(createDomainErrorHandler(config, mainLogger));
 */
export default function createDomainErrorHandler(config, logger) {
  /**
   * Express error handler middleware for domain errors.
   *
   * Handles DomainError instances by converting them into HTTP responses
   * with appropriate status codes and error messages. In debug mode, includes
   * additional details and timestamp.
   *
   * @param {Error | DomainError} err - The error object to handle
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object for sending
   *   the HTTP response
   * @param {import('express').NextFunction} next - Express next middleware function
   *   for error handling (used to pass non-domain errors to the next handler)
   */
  return function domainErrorHandler(err, req, res, next) {
    if (!(err instanceof DomainError)) return next(err);

    logger.debug(
      `Domain error handled: ${err.status} ${STATUS_TEXT[err.status]} - ${req.method} ${req.originalUrl}`
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
