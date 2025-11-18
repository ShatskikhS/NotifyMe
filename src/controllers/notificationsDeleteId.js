import { NotScheduledNotificationError } from "../errors.js";

/**
 * Express controller middleware factory for handling requests to delete
 * a planned notification by ID.
 *
 * Returns a controller that deletes the notification from storage. The ID parameter
 * is already validated by validateIdMiddleware before reaching this controller.
 *
 * Route: DELETE '/notifications/:id'
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
 * @throws {NotScheduledNotificationError} When sendAt time already passed
 *
 * @example
 * // In router:
 * router.delete("/:id", validateIdMiddleware(config, logger), deleteIdController(config, logger, fsManager));
 *
 * // DELETE request to /notifications/42
 * // Returns: { "status": "ok", "time": "2025-11-13T01:10:20.038Z" }
 */
export default function deleteIdController(config, logger, fsManager) {
  return async (req, res, next) => {
    try {
      const currentId = req.params.id;

      const notification = await fsManager.findByIdAsync(currentId);

      if (!notification.sendAt || (new Date(notification.sendAt) <= new Date())) {
        const clientIp = req.ip || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';
        logger.warn(
          `NotScheduledNotificationError error handled: 409 Conflict - ${req.method} ${req.originalUrl} | Client: ${clientIp} | User-Agent: ${userAgent}`
        );
        const message = config.debug
          ? `The attempt to delete unscheduled id ${currentId} notification has been rejected.`
          : "Invalid request";
        throw new NotScheduledNotificationError(currentId, message);
      }

      await fsManager.deleteAsync(currentId);

      logger.info(`Notification id: ${currentId} has been successfully removed.`);

      res.status(200).json({ status: "ok", time: new Date() });
    } catch (err) {
      next(err);
    }
  };
}
