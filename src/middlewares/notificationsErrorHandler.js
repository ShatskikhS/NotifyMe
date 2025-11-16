import {
  NotificationValidationError,
  IdValidationError,
  SerializationError,
  DeserializationError,
  DuplicateIdError,
  RecordNotFoundError,
  InvalidStorageFileError,
  NotScheduledNotificationError,
} from "../errors.js";

/**
 *
 * @param {any} err
 * @param {import('express').Request} req - Express request object containing the
 *   notification ID in req.params.id
 * @param {import('express').Response} res - Express response object for sending
 *   the HTTP response
 * @param {import('express').NextFunction} next - Express next middleware function
 *   for error handling
 * @param {import('../config/config.js').default} config - Application configuration
 *   instance containing settings (e.g., debug mode)
 * @param {import('../logger.js').default} logger - MainLogger instance for logging
 *   operations and errors during request processing
 * @param {import('../stores/fsStores.js').default} fsManager - FsNotifications
 *   instance for managing local JSON storage of notifications
 */
export default async function errorHandlerAsync(
  err,
  req,
  res,
  next,
  config,
  logger,
  fsManager
) {
  if (err instanceof NotificationValidationError) {
    logger.error(
      `Request: ${req.method} ${req.originalUrl} Message: ${err.message}`
    );
    return config.debug
      ? res.status(err.status).json({
          status: "Bad Request",
          message: err.message,
          details: err.details,
          time: new Date(),
        })
      : res.status(err.status).json({
        status: "Bad Request",
        message: err.message,
      });
  }
  next(err);
}
