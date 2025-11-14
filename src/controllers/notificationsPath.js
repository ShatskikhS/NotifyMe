import { updateNotificationSchema } from "../validation/notifySchema.js";
import createIdSchema from "../validation/idSchema.js";
import { IdValidationError, NotificationValidationError } from "../errors.js";

/**
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
 */
export default async function pathController(
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
    const { error: idError, value: currentId } = idSchema.validate(
      req.params.id
    );

    if (idError) {
      logger.warn(
        `id parameter validation error. Request: ${req.method} /notifications/${req.params.id}`
      );
      throw new IdValidationError(
        idError,
        `/notifications/${req.params.id}`,
        req.method
      );
    }

    const notificationSchema = updateNotificationSchema(config.debug);
    const { error: notificationError, value: fieldsToUpdate } =
      notificationSchema.validate(req.body);
    if (notificationError) {
      logger.warn(
        `Request body validation error. Request: ${req.method} /notifications/${req.params.id}`
      );
      throw new NotificationValidationError(notificationError);
    }

    if ("sendAt" in fieldsToUpdate) {
      //TODO: Добавить изменение данных в планировщике.
    } else {
      const notification = await fsManager.findByIdAsync(currentId);
      Object.assign(notification, fieldsToUpdate);
      await fsManager.updateAsync(notification);

      logger.info(`Controller: Notification id: ${notification.id} successfully updated.`);

      res.status(200).json({
        status: "ok",
        time: new Date(),
        updated: notification,
      });
    }
  } catch (err) {
    next(err);
  }
}
