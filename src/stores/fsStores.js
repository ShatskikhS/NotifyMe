import fs from "node:fs";
import path from "node:path";
import { promises as fsPromises } from "node:fs";

import {
  DuplicateIdError,
  RecordNotFoundError,
  InvalidStorageFileError,
} from "../errors.js";

/**
 * File system storage for notifications.
 * Manages persistence of Notification objects in a JSON file.
 *
 * @class FsNotifications
 */
export default class FsNotifications {
  /**
   * Main logger instance used to produce typed logs.
   *
   * @type {import('../logger.js').default}
   * @private
   */
  #logger;

  /**
   * Cached list of all existing IDs in the storage.
   * Used for validation in saveAsync, updateAsync, and deleteAsync.
   *
   * @type {number[]}
   * @private
   */
  #allIDs;

  /**
   * Creates a new FsNotifications instance.
   *
   * @param {string} storagePath - Path to the JSON storage file
   * @param {import('../logger.js').default} logger - MainLogger instance for logging
   */
  constructor(storagePath, logger) {
    this.path = path.normalize(storagePath);
    this.#logger = logger;

    this.#initStorage();

    const rawData = fs.readFileSync(this.path);
    this.#allIDs = Object.keys(JSON.parse(rawData)).map(Number);
    this.#logger.debug(
      `Storage initialized with ${this.#allIDs.length} records.`
    );
  }

  /**
   * Initializes the storage file if it doesn't exist.
   * Creates an empty JSON object file.
   *
   * @private
   */
  #initStorage() {
    if (!fs.existsSync(this.path)) {
      fs.writeFileSync(this.path, JSON.stringify({}), { flag: "w" });
      this.#logger.info(
        `Storage file '${this.path}' not found — created new empty JSON storage.`
      );
    } else {
      // TODO: validate existing file.
      this.#logger.info(`Existing storage file '${this.path}' loaded.`);
    }
  }

  /**
   * Generates and returns the next available notification ID.
   * Increments the internal maxId counter.
   *
   * @returns {number} The next available notification ID
   */
  getNextId() {
    return this.#allIDs.length === 0 ? 1 : Math.max(...this.#allIDs) + 1;
  }

  /**
   * Saves a Notification object to the storage.
   *
   * @param {import('../models/notificationModel.js').default} notification - Notification instance to save
   * @returns {Promise<void>}
   * @throws {DuplicateIdError} If the notification cannot be saved cause duplicated id
   */
  async saveAsync(notification) {
    if (notification.id && this.#allIDs.includes(notification.id)) {
      this.#logger.warn(`Attempt to save duplicate ID ${notification.id}.`);
      throw new DuplicateIdError(notification.id);
    }

    this.#logger.info(`Saving new notification...`);

    const allNotifications = await this.findAllAsync();

    if (!notification.id) {
      notification.id = this.getNextId();
      this.#logger.debug(`Generated new ID: ${notification.id}`);
    }

    allNotifications[notification.id] = notification;
    await fsPromises.writeFile(
      this.path,
      JSON.stringify(allNotifications, null, 2)
    );
    this.#allIDs.push(notification.id);

    this.#logger.info(`Notification ${notification.id} saved.`);
  }

  /**
   * Finds a notification by its ID.
   *
   * @param {number} id - The notification ID to search for
   * @returns {Promise<import('../models/notificationModel.js').default|null>} Notification instance if found, null otherwise
   * @throws {RecordNotFoundError} If a record with the required ID is not found.
   */
  async findByIdAsync(id) {
    if (!this.#allIDs.includes(id)) {
      this.#logger.warn(`Attempted to find non-existent record ID ${id}.`);
      throw new RecordNotFoundError(id);
    }

    this.#logger.debug(`Finding notification with ID ${id}.`);
    const allNotifications = await this.findAllAsync();
    return allNotifications[id];
  }

  /**
   * Retrieves all notifications from storage.
   * Returns an object where keys are notification IDs and values are Notification instances.
   * Note: The ID is stored both as the key and within the notification object itself.
   *
   * @returns {Promise<Object<number, import('../models/notificationModel.js').default>>} Object mapping notification IDs to Notification instances
   */
  async findAllAsync() {
    this.#logger.debug(`Reading all notifications from '${this.path}'.`);
    const rawData = await fsPromises.readFile(this.path);
    return JSON.parse(rawData);
  }

  /**
   * Updates an existing notification in storage.
   *
   * @param {import('../models/notificationModel.js').default} notification - Notification instance with updated data
   * @returns {Promise<void>}
   * @throws {RecordNotFoundError} If a record with the required ID is not found.
   */
  async updateAsync(notification) {
    if (!this.#allIDs.includes(notification.id)) {
      this.#logger.warn(
        `Attempted to update missing record ID ${notification.id}.`
      );
      throw new RecordNotFoundError(notification.id);
    }

    this.#logger.info(`Updating notification ${notification.id}.`);
    const allNotifications = await this.findAllAsync();
    allNotifications[notification.id] = notification;
    await fsPromises.writeFile(
      this.path,
      JSON.stringify(allNotifications, null, 2)
    );

    this.#logger.debug(`Notification ${notification.id} updated successfully.`);
  }

  /**
   * Deletes a notification from storage by ID.
   *
   * @param {number} id - The notification ID to delete
   * @returns {Promise<void>}
   * @throws {RecordNotFoundError} If a record with the required ID is not found.
   */
  async deleteAsync(id) {
    if (!this.#allIDs.includes(id)) {
      this.#logger.warn(`Attempted to delete missing record ID ${id}.`);
      throw new RecordNotFoundError(id);
    }

    this.#logger.info(`Deleting notification ${id}.`);
    const allNotifications = await this.findAllAsync();
    delete allNotifications[id];
    await fsPromises.writeFile(
      this.path,
      JSON.stringify(allNotifications, null, 2)
    );

    this.#allIDs.splice(this.#allIDs.indexOf(id), 1);
    this.#logger.debug(
      `Notification ${id} deleted. Remaining count: ${this.#allIDs.length}`
    );
  }
}
