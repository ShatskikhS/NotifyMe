import { SERVICE_NAMES } from "../models/consts/serviceNames.js";

/**
 * Express controller middleware factory for handling requests to receive
 * information about all notifications.
 *
 * Returns a controller that retrieves all notifications from storage and
 * returns them as JSON.
 *
 * Route: GET '/notifications'
 *
 * @param {import('../logger.js').default} logger - MainLogger instance for
 *   logging operations and errors during request processing
 * @param {import('../stores/fsStores.js').default} fsManager - FsNotifications
 *   instance for managing local JSON storage of notifications
 * @returns {function(import('express').Request, import('express').Response, import('express').NextFunction): Promise<void>}
 *   Express controller middleware function
 *
 * @example
 * // In router:
 * router.get("/", getController(logger, fsManager));
 */
export default function getController(logger, fsManager) {
  return async (req, res, next) => {
    try {
      logger.debug(
        logger.formatMessage(
          SERVICE_NAMES.NOTIFICATION_CONTROLLER,
          "Processing request to receive all notifications"
        )
      );
      const notifications = await fsManager.findAllAsync();
      res.status(200).json(notifications);
    } catch (err) {
      next(err);
    }
  };
}
