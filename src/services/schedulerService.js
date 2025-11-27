import { scheduleJob } from "node-schedule";

import sendNotificationAsync from "./notifyService.js"
import { NotificationSchedulingError } from "../errors.js";


export default class NotificationScheduler {
  /**
   * Main logger instance used to produce typed logs.
   *
   * @type {import("../logger.js").default}
   * @private
   */
  #logger;

  /**
   * 
   * @type {import ("../stores/fsStores.js").default}
   */
  #fsManager;

  /**
   * Map of all scheduled tasks, where key is the notification id.
   * 
   * @type {Map<number, import("node-schedule").Job>}
   * @private
   */
  #allTasks;

  /**
   * true when server is running in debug mode
   *
   * @type {boolean}
   * @private
   */
  #debugMode;

  constructor(logger, fsManager, debugMode) {
    this.#logger = logger;
    this.#debugMode = debugMode;
    this.#fsManager = fsManager;
    this.#allTasks = new Map();

    this.#initScheduler();
  }

  #initScheduler() {
    const notifications = this.#fsManager.findUnsent();
    for (const notification of notifications) {
      try {
        this.schedule(notification);
      } catch (err) {
        this.#logger.error(`Failed to schedule notification during init: id ${notification.id} | ${err.message}`);
      }
    }
    this.#logger.info(`NotificationScheduler initialized. ${this.#allTasks.size} notifications scheduled.`)
  }

  /**
   * Schedule the notification at notification.sendAt time
   * 
   * @param {import("../models/notificationModel.js").default} notification 
   */
  schedule(notification) {
    try {
      const job = scheduleJob(notification.sendAt, async () => {
        await sendNotificationAsync(notification.id, this.#logger, this.#fsManager);
      });

      this.#logger.info(`Notification Scheduled: id ${notification.id}`);
      this.#allTasks.set(notification.id, job);
    } catch (err) {
      this.#logger.error(`NotificationSchedulingError: id ${notification.id} | details ${err.stack ?? err.message}`);
      throw new NotificationSchedulingError(`NotificationSchedulingError: id ${notification.id}`);
    }
  }

  /**
   * Reschedule the notification at notification.sendAt time
   * 
   * @param {import("../models/notificationModel.js").default} notification 
   */
  reschedule(notification) {
    const job = this.#allTasks.get(notification.id);
    if (!job) {
      this.#logger.warn(`Attempted to reschedule non-existent job: id ${notification.id}`);
      return;
    }
    const success = job.reschedule(notification.sendAt);
    if (success) {
      this.#logger.info(`Notification Rescheduled: id ${notification.id}`);
    } else {
      const errMessage = `Failed to reschedule job: id ${notification.id}`;
      this.#logger.error(`NotificationSchedulingError: ${errMessage}`);
      throw new NotificationSchedulingError(errMessage);
    }
  }

  /**
   * Unschedule the notification
   * 
   * @param {import("../models/notificationModel.js").default} notification 
   */
  unschedule(notification) {
    const job = this.#allTasks.get(notification.id);
    if (!job) {
      this.#logger.warn(`Attempted to unschedule non-existent job: id ${notification.id}`);
      return;
    }
    const success = job.cancel();
    if (success) {
      this.#logger.info(`Notification canceled: id ${notification.id}`);
      this.#allTasks.delete(notification.id);
    } else {
      const errMessage = `Failed to cancel job: id ${notification.id}`;
      this.#logger.error(`NotificationSchedulingError: ${errMessage}`);
      throw new NotificationSchedulingError(errMessage);
    }
  }
}
