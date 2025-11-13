import createIdSchema from "../validation/idSchema.js";
import { IdValidationError, NotScheduledNotificationError } from "../errors.js";

/**
 * DELETE request controller for handling requests to delete planned notification by ID.
 *
 * Validates the notification ID parameter from the route and deletes it from the
 * storage. Handles validation errors, not found cases and not scheduled cases
 * by throwing appropriate exceptions that are caught and passed to the error handler.
 *
 * Route: DELETE '/notifications/:id'
 *
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
 *
 * @throws {IdValidationError} When the ID parameter validation fails (invalid format,
 *   not a number, or less than 1)
 * @throws {NotScheduledNotificationError} When sendAt time already passed or missing
 *   sendAt field
 *
 * @returns {void}
 *
 * @example
 * // DELETE request to /notifications/42
 * // Returns: { "status": "ok", "time": "2025-11-13T01:10:20.038Z" }
 */
export default async function deleteIdController(
  req,
  res,
  next,
  config,
  logger,
  fsManager
) {
  try {
    const idSchema = createIdSchema(config.debug);

    /**
     * Validation result containing error (if any) and validated value.
     * @type {{error?: import('joi').ValidationError, value: number}}
     */
    const { error, value: currentId } = idSchema.validate(req.params.id);

    if (error) {
      logger.warn(
        `id parameter validation error. Request: DELETE /notifications/${req.params.id}`
      );
      throw new IdValidationError(
        error,
        `/notifications/${req.params.id}`,
        req.method
      );
    }

    const notification = await fsManager.findByIdAsync(currentId);

    if (!notification.sendAt) {
      throw new NotScheduledNotificationError(
        currentId,
        "missing sendAt field"
      );
    }

    if (new Date(notification.sendAt) <= new Date()) {
      throw new NotScheduledNotificationError(
        currentId,
        "sendAt time already passed"
      );
    }

    await fsManager.deleteAsync(currentId);

    logger.info(`Notification id: ${currentId} has been successfully removed.`);

    res.status(200).json({ status: "ok", time: new Date() });
  } catch (err) {
    next(err);
  }
}
