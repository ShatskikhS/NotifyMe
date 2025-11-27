import { SERVICE_NAMES } from "../models/consts/serviceNames.js";

/**
 * Express controller middleware factory for handling requests to retrieve
 * a specific notification by ID.
 *
 * Returns a controller that retrieves the notification from storage and returns
 * it as JSON. The ID parameter is already validated by validateIdMiddleware
 * before reaching this controller.
 *
 * Route: GET '/notifications/:id'
 *
 * @param {import('../config/config.js').default} config - Application configuration
 *   instance containing settings (e.g., debug mode)
 * @param {import('../logger.js').default} logger - MainLogger instance for logging
 *   operations and errors during request processing
 * @param {import('../stores/fsStores.js').default} fsManager - FsNotifications
 *   instance for managing local JSON storage of notifications
 * @returns {function(import('express').Request, import('express').Response, import('express').NextFunction): Promise<void>}
 *   Express controller middleware function
 *
 * @throws {RecordNotFoundError} When a notification with the specified ID is not found
 *
 * @example
 * // In router:
 * router.get("/:id", validateIdMiddleware(config, logger), getIdController(config, logger, fsManager));
 *
 * // GET request to /notifications/42
 * // Returns: { id: 42, source: "system", message: "...", ... }
 */
export default function getIdController(config, logger, fsManager) {
  return async (req, res, next) => {
    try {
      const currentId = req.params.id;

      logger.debug(
        logger.formatMessage(
          SERVICE_NAMES.NOTIFICATION_CONTROLLER,
          "Processing request to receive notification",
          { id: currentId }
        )
      );

      const notification = await fsManager.findByIdAsync(currentId);
      res.status(200).json(notification);
    } catch (err) {
      next(err);
    }
  };
}
