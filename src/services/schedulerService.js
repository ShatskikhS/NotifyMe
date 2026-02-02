import { scheduleJob } from "node-schedule";

import sendNotificationAsync from "./notifyService.js"
import { NotificationSchedulingError } from "../errors.js";
import { SERVICE_NAMES } from "../models/consts/serviceNames.js";


export default class NotificationScheduler {
  /**
   * Main logger instance used to produce typed logs.
   * @type {import("../logger.js").default}
   * @private
   */
  #logger;

  /**
   * Storage manager instance.
   * @type {import("../stores/fsStores.js").default}
   * @private
   */
  #fsManager;

  /**
   * Map of all scheduled tasks, where key is the notification id.
   * @type {Map<number, import("node-schedule").Job>}
   * @private
   */
  #allTasks;

  /**
   * Debug mode flag.
   * @type {boolean}
   * @private
   */
  #debugMode;

  /**
   * Creates a new NotificationScheduler instance.
   *
   * @param {import("../logger.js").default} logger - Logger instance
   * @param {import("../stores/fsStores.js").default} fsManager - Storage manager instance
   * @param {boolean} debugMode - Debug mode flag
   */
  constructor(logger, fsManager, debugMode) {
    this.#logger = logger;
    this.#debugMode = debugMode;
    this.#fsManager = fsManager;
    this.#allTasks = new Map();

    this.#initScheduler();
  }

  /**
   * Initializes the scheduler by loading unsent notifications from storage.
   * @private
   */
  #initScheduler() {
    const notifications = this.#fsManager.findUnsent();
    for (const notification of notifications) {
      try {
        this.schedule(notification);
      } catch (err) {
        this.#logger.error(
          this.#logger.formatMessage(
            SERVICE_NAMES.NOTIFICATION_SCHEDULER,
            "Failed to schedule notification during init",
            { id: notification.id, errorType: err.name, error: err.message }
          )
        );
      }
    }
    this.#logger.info(
      this.#logger.formatMessage(
        SERVICE_NAMES.NOTIFICATION_SCHEDULER,
        "NotificationScheduler initialized",
        { scheduledCount: this.#allTasks.size }
      )
    );
  }

  /**
   * Schedules a notification to be sent at a specific time.
   *
   * @param {import("../models/notificationModel.js").default} notification - The notification to schedule
   * @throws {NotificationSchedulingError} If scheduling fails
   */
  schedule(notification) {
    try {
      const job = scheduleJob(notification.sendAt, async () => {
        await sendNotificationAsync(notification.id, this.#logger, this.#fsManager);
      });

      this.#logger.info(
        this.#logger.formatMessage(
          SERVICE_NAMES.NOTIFICATION_SCHEDULER,
          "Notification Scheduled",
          { id: notification.id }
        )
      );
      this.#allTasks.set(notification.id, job);
    } catch (err) {
      this.#logger.error(
        this.#logger.formatMessage(
          SERVICE_NAMES.NOTIFICATION_SCHEDULER,
          "NotificationSchedulingError",
          { id: notification.id, errorType: err.name, error: err.stack ?? err.message }
        )
      );
      throw new NotificationSchedulingError(`NotificationSchedulingError: id ${notification.id}`);
    }
  }

  /**
   * Reschedules an existing notification.
   *
   * @param {import("../models/notificationModel.js").default} notification - The notification to reschedule
   * @throws {NotificationSchedulingError} If rescheduling fails
   */
  reschedule(notification) {
    const job = this.#allTasks.get(notification.id);
    if (!job) {
      this.#logger.warn(
        this.#logger.formatMessage(
          SERVICE_NAMES.NOTIFICATION_SCHEDULER,
          "Attempted to reschedule non-existent job",
          { id: notification.id }
        )
      );
      return;
    }
    const success = job.reschedule(notification.sendAt);
    if (success) {
      this.#logger.info(
        this.#logger.formatMessage(
          SERVICE_NAMES.NOTIFICATION_SCHEDULER,
          "Notification Rescheduled",
          { id: notification.id }
        )
      );
    } else {
      const errMessage = `Failed to reschedule job: id ${notification.id}`;
      this.#logger.error(
        this.#logger.formatMessage(
          SERVICE_NAMES.NOTIFICATION_SCHEDULER,
          "NotificationSchedulingError",
          { errorType: "NotificationSchedulingError", error: errMessage }
        )
      );
      throw new NotificationSchedulingError(errMessage);
    }
  }

  /**
   * Cancels a scheduled notification.
   *
   * @param {import("../models/notificationModel.js").default} notification - The notification to unschedule
   * @throws {NotificationSchedulingError} If cancellation fails
   */
  unschedule(notification) {
    const job = this.#allTasks.get(notification.id);
    if (!job) {
      this.#logger.warn(
        this.#logger.formatMessage(
          SERVICE_NAMES.NOTIFICATION_SCHEDULER,
          "Attempted to unschedule non-existent job",
          { id: notification.id }
        )
      );
      return;
    }
    const success = job.cancel();
    if (success) {
      this.#logger.info(
        this.#logger.formatMessage(
          SERVICE_NAMES.NOTIFICATION_SCHEDULER,
          "Notification canceled",
          { id: notification.id }
        )
      );
      this.#allTasks.delete(notification.id);
    } else {
      const errMessage = `Failed to cancel job: id ${notification.id}`;
      this.#logger.error(
        this.#logger.formatMessage(
          SERVICE_NAMES.NOTIFICATION_SCHEDULER,
          "NotificationSchedulingError",
          { error: errMessage }
        )
      );
      throw new NotificationSchedulingError(errMessage);
    }
  }
}
