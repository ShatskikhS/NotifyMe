import createValidationSchema from "../validation/notifySchema.js";
import { NotificationValidationError } from "../errors.js";
import Notification from "../models/notificationModel.js";
import { CHANNELS, STATUSES } from "../models/consts/notificationFields.js";
import sendConsoleNotificationAsync from "../services/channels/console.js";

/**
 * POST request controller for handling notification creation requests.
 *
 * Validates incoming notification data, creates a Notification instance,
 * and processes it according to the application logic. Handles validation
 * errors and throws appropriate exceptions.
 *
 * Route: POST '/notifications'
 *
 * @param {import('express').Request} req - Express request object containing
 *   the notification data in req.body
 * @param {import('express').Response} res - Express response object for
 *   sending the HTTP response
 * @param {import('../config/config.js').default} config - Application
 *   configuration instance containing settings (e.g., debug mode)
 * @param {import('../logger.js').default} logger - MainLogger instance for
 *   logging operations and errors during request processing
 * @param {import('../stores/fsStores.js').default} fsManager - FsNotifications
 *   instance for managing local JSON storage of notifications
 *
 * @throws {NotificationValidationError} When request body validation fails
 *   (invalid fields, missing required fields, or invalid values)
 * @throws {DeserializationError} When notification data cannot be properly
 *   deserialized into a Notification instance
 *
 * @returns {void}
 *
 * @example
 * // Request body:
 * // {
 * //   "source": "system",
 * //   "message": "Test notification",
 * //   "channels": ["console", "file"],
 * //   "priority": "high",
 * //   "sendAt": "2025-10-21T08:00:00Z"
 * // }
 */
export default async function postController(
  req,
  res,
  next,
  config,
  logger,
  fsManager
) {
  try {
    /**
     * Joi validation schema for notification request body.
     * @type {import('joi').ObjectSchema}
     */
    const schema = createValidationSchema(config.debug);

    /**
     * Validation result containing error (if any) and validated value.
     * @type {{error?: import('joi').ValidationError, value: Object}}
     */
    const { error, value: rawNotification } = schema.validate(req.body);

    if (error) {
      logger.warn(
        `POST notification params validation error. Route: ${req.baseUrl}, params: ${req.params}`
      );
      throw new NotificationValidationError(error);
    }

    /**
     * Notification instance created from validated request data.
     * @type {import("../models/notificationModel.js").default}
     */
    const notification = Notification.fromJSON(rawNotification);

    await fsManager.saveAsync(notification);

    if (!notification.sendAt) {
      if (notification.channels.includes(CHANNELS.CONSOLE)) {
        await sendConsoleNotificationAsync(
          notification.message,
          notification.source
        );
        logger.info(`Notification id:${notification.id} sent to console`);
      }
      if (notification.channels.includes(CHANNELS.LOGFILE)) {
        logger.info(`New logfile notification: ${notification.message}`);
      }
      // TODO: Add code to send notifications to other controllers.
      if (notification.channels.includes(CHANNELS.EMAIL)) {
      }
      if (notification.channels.includes(CHANNELS.TELEGRAM)) {
      }
      notification.status = STATUSES.DELIVERED;
      await fsManager.updateAsync(notification);
      res.status(200).json({
        status: notification.status,
        notificationId: notification.id,
        time: Date.now(),
      });
    }
  } catch (err) {
    next(err);
  }
}
