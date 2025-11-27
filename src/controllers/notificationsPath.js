import { updateNotificationSchema } from "../validation/notifySchema.js";
import { NotificationValidationError, NotScheduledNotificationError } from "../errors.js";
import { SERVICE_NAMES } from "../models/consts/serviceNames.js";

/**
 * Express controller middleware factory for handling requests to update
 * a notification by ID.
 *
 * Returns a controller that updates notification fields in storage. The ID parameter
 * is already validated by validateIdMiddleware before reaching this controller.
 *
 * Route: PATCH '/notifications/:id'
 *
 * @param {import('../config/config.js').default} config - Application configuration
 *   instance containing settings (e.g., debug mode)
 * @param {import('../logger.js').default} logger - MainLogger instance for logging
 *   operations and errors during request processing
 * @param {import('../stores/fsStores.js').default} fsManager - FsNotifications
 *   instance for managing local JSON storage of notifications
 * @param {import('../services/schedulerService.js').default} scheduler - NotificationScheduler
 * instance for scheduling notifications
 * @returns {function(import('express').Request, import('express').Response, import('express').NextFunction): Promise<void>}
 *   Express controller middleware function
 *
 * @throws {NotificationValidationError} When the request body validation fails
 * @throws {NotScheduledNotificationError} When sendAt time already passed
 *
 * @example
 * // In router:
 * router.patch("/:id", validateIdMiddleware(config, logger), pathController(config, logger, fsManager));
 */
export default function pathController(config, logger, fsManager, scheduler) {
  return async (req, res, next) => {
    try {
      const currentId = req.params.id;

      const notificationSchema = updateNotificationSchema(config.debug);
      const { error: notificationError, value: fieldsToUpdate } =
        notificationSchema.validate(req.body);
      if (notificationError) {
        throw new NotificationValidationError(notificationError);
      }

      const notification = await fsManager.findByIdAsync(currentId);

      if (!notification.sendAt || (new Date(notification.sendAt) <= new Date())) {
        const message = config.debug
          ? `The attempt to update unscheduled id ${currentId} notification has been rejected`
          : "Invalid request";
        throw new NotScheduledNotificationError(currentId, message);
      }

      Object.assign(notification, fieldsToUpdate);
      if ("sendAt" in fieldsToUpdate) {
        scheduler.reschedule(notification)
      }
      await fsManager.updateAsync(notification);
      logger.info(
        logger.formatMessage(
          SERVICE_NAMES.NOTIFICATION_CONTROLLER,
          "Notification updated",
          { id: notification.id }
        )
      );

      res.status(200).json({
        status: "ok",
        time: new Date(),
        updated: notification,
      });

    } catch (err) {
      next(err);
    }
  };
}
