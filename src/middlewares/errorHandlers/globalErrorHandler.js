import { NotifyMeError } from "../../errors.js";
import { STATUS_TEXT } from "../../models/consts/statusTexts.js";
import { SERVICE_NAMES } from "../../models/consts/serviceNames.js";

/**
 * Express error handler middleware factory for global error handling.
 *
 * Returns the global error handler. It is assumed that all known error classes
 * will be handled beforehand by other error handlers in the middleware chain.
 *
 * @param {import('../../config/config.js').default} config - Application configuration
 *   instance containing settings (e.g., debug mode)
 * @param {import('../../logger.js').default} logger - MainLogger instance for logging
 *   operations and errors during request processing
 * @returns {function(Error, import('express').Request, import('express').Response, import('express').NextFunction): void}
 *   Express error handler middleware function
 *
 * @example
 * // In app.js
 * app.use(globalErrorHandler(config, mainLogger));
 */
export default function globalErrorHandler(config, logger) {
  return (err, req, res, _) => {
    const tag = err instanceof NotifyMeError ? "NotifyMeError" : "UnknownError";
    logger.error(
      logger.formatMessage(SERVICE_NAMES.SERVER, "Unhandled exception", {
        tag,
        errorType: err.name,
        method: req.method,
        url: req.originalUrl,
        error: err.stack || err.message,
      })
    );

    res.status(err.status ?? 500).json({
      status: `${STATUS_TEXT[err.status ?? 500]}`,
      message: err.message,
      ...(config.debug && {
        request: {
          path: req.originalUrl,
          method: req.method,
          params: req.params,
          query: req.query,
        },
        time: new Date(),
      }),
    });
  };
}
