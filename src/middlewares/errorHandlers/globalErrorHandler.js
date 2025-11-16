import { NotifyMeError } from "../../errors.js";
import { STATUS_TEXT } from "../../models/consts/statusTexts.js";

/**
 * The global error handler. It is assumed that all known error classes will be
 * handled beforehand.
 *
 * @param {Error | NotifyMeError} err
 * @param {import('express').Request} req - Express request object containing the
 *   notification ID in req.params.id
 * @param {import('express').Response} res - Express response object for sending
 *   the HTTP response
 * @param {import('express').NextFunction} next - Express next middleware function
 *   for error handling (unused in final handler, kept for Express compatibility)
 * @param {import('../../config/config.js').default} config - Application configuration
 *   instance containing settings (e.g., debug mode)
 * @param {import('../../logger.js').default} logger - MainLogger instance for logging
 *   operations and errors during request processing
 */
export default function createGlobalErrorHandler(config, logger) {
  return function globalErrorHandler(err, req, res, _) {
    const tag = err instanceof NotifyMeError ? "NotifyMeError" : "UnknownError";
    logger.error(
      `[${tag}] ${req.method} ${req.originalUrl}\n${err.stack || err.message}`
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
