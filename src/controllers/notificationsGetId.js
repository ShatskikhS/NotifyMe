import createIdSchema from "../validation/idSchema.js";
import { IdValidationError } from "../errors.js";

/**
 * GET request controller for handling requests to retrieve a specific notification by ID.
 *
 * Validates the notification ID parameter from the route, retrieves the notification
 * from storage, and returns it as JSON. Handles validation errors and not found cases
 * by throwing appropriate exceptions that are caught and passed to the error handler.
 *
 * Route: GET '/notifications/:id'
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
 * @throws {RecordNotFoundError} When a notification with the specified ID is not found
 *
 * @returns {void}
 *
 * @example
 * // GET request to /notifications/42
 * // Returns: { id: 42, source: "system", message: "...", ... }
 */
export default async function getIdController(
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
        `id parameter validation error. Request: GET /notifications/${req.params.id}`
      );
      throw new IdValidationError(
        error,
        `/notifications/${req.params.id}`,
        req.method
      );
    }

    logger.debug(
      `Processing a request to receive notification with id: ${currentId}.`
    );

    const notification = await fsManager.findByIdAsync(currentId);
    res.status(200).json(notification);
  } catch (err) {
    next(err);
  }
}
