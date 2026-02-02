import sendConsoleNotificationAsync from "./channels/console.js";
import sendEmailNotificationAsync from "./channels/email.js";
import sendLogfileNotificationAsync from "./channels/logfile.js";
import sendTelegramNotificationAsync from "./channels/telegram.js";
import { STATUSES } from "../models/consts/notificationFields.js"
import { SERVICE_NAMES } from "../models/consts/serviceNames.js";

const CHANNELS_METHODS = Object.freeze({
  console: sendConsoleNotificationAsync,
  telegram: sendTelegramNotificationAsync,
  logfile: sendLogfileNotificationAsync,
  email: sendEmailNotificationAsync,
});

/**
 * Sends a notification to all configured channels.
 *
 * Retrieves the notification by ID, iterates through its channels, and attempts
 * to send the message. Updates the notification status based on delivery success.
 *
 * @param {number} id - The ID of the notification to send
 * @param {import("../logger.js").default} logger - Logger instance
 * @param {import("../stores/fsStores.js").default} fsManager - Storage manager instance
 * @returns {Promise<void>}
 */
export default async function sendNotificationAsync(id, logger, fsManager) {
  const notification = await fsManager.findByIdAsync(id);
  let isDelivered = true;
  for (const channel of notification.channels) {
    try {
      await CHANNELS_METHODS[channel](notification.message);
      logger.debug(
        logger.formatMessage(SERVICE_NAMES.NOTIFICATION_SERVICE, "Notification sent", {
          id: notification.id,
          channel,
        })
      );
    } catch (err) {
      logger.error(
        logger.formatMessage(SERVICE_NAMES.NOTIFICATION_SERVICE, "Error sending notification", {
          errorType: err.name,
          error: err.stack ?? err.message,
        })
      );
      isDelivered = false;
    }
  }
  if (isDelivered) {
    notification.status = STATUSES.DELIVERED;
    logger.info(
      logger.formatMessage(
        SERVICE_NAMES.NOTIFICATION_SERVICE,
        "Notification sent to all channels",
        { id: notification.id }
      )
    );
  } else {
    notification.status = STATUSES.DELIVERY_ERROR;
  }
  await fsManager.updateAsync(notification);
}
