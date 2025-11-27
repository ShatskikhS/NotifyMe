import fs from "node:fs";
import path from "node:path";
import { promises as fsPromises } from "node:fs";

import createStorageSchema from "../validation/storageSchema.js";
import Notification from "../models/notificationModel.js"
import { STATUSES } from "../models/consts/notificationFields.js"
import {
  DuplicateIdError,
  RecordNotFoundError,
  InvalidStorageFileError,
  DeserializationError,
} from "../errors.js";
import { SERVICE_NAMES } from "../models/consts/serviceNames.js";

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
   * true when server is running in debug mode
   *
   * @type {boolean}
   * @private
   */
  #debugMode;

  /**
   * Validated storage path
   * 
   * @type {string}
   * @private
   */
  #path;

  /**
   * Creates a new FsNotifications instance.
   *
   * @param {string} storagePath - Path to the JSON storage file
   * @param {import('../logger.js').default} logger - MainLogger instance for logging
   */
  constructor(storagePath, logger, debugMode) {
    this.#path = path.normalize(storagePath);
    this.#logger = logger;
    this.#debugMode = debugMode;

    this.#initStorage();
  }

  /**
   * Initializes the storage file if it doesn't exist.
   * Creates an empty JSON object file.
   *
   * @private
   */
  #initStorage() {
    if (!fs.existsSync(this.#path)) {
      fs.writeFileSync(this.#path, JSON.stringify({}), { flag: "w" });
      this.#logger.info(
        this.#logger.formatMessage(
          SERVICE_NAMES.FILE_STORAGE,
          `Storage file '${this.#path}' not found — created new empty JSON storage.`
        )
      );
    } else {
      this.#logger.info(
        this.#logger.formatMessage(
          SERVICE_NAMES.FILE_STORAGE,
          `Loading existing storage file`,
          { path: this.#path }
        )
      );
      const storageData = JSON.parse(fs.readFileSync(this.#path, "utf-8"));
      const storageSchema = createStorageSchema();
      const { error } = storageSchema.validate(storageData);
      if (error) {
        throw new InvalidStorageFileError(`${error.message} | path: ${this.#path}`);
      }
      this.#allIDs = Object.keys(storageData).map(Number);
      this.#logger.debug(
        this.#logger.formatMessage(
          SERVICE_NAMES.FILE_STORAGE,
          `Storage initialized`,
          { recordCount: this.#allIDs.length }
        )
      );
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
   * @returns {Promise<number>}
   * @throws {DuplicateIdError} If the notification cannot be saved cause duplicated id
   */
  async saveAsync(notification) {
    if (notification.id && this.#allIDs.includes(notification.id)) {
      this.#logger.warn(
        this.#logger.formatMessage(
          SERVICE_NAMES.FILE_STORAGE,
          `Attempt to save duplicate ID`,
          { id: notification.id }
        )
      );
      const message = this.#debugMode
        ? `Record with id "${notification.id}" already exists`
        : "Invalid value";
      throw new DuplicateIdError(message, notification.id);
    }

    this.#logger.info(
      this.#logger.formatMessage(SERVICE_NAMES.FILE_STORAGE, `Saving new notification...`)
    );

    const allNotifications = await this.findAllAsync();

    if (!notification.id) {
      notification.id = this.getNextId();
      this.#logger.debug(
        this.#logger.formatMessage(
          SERVICE_NAMES.FILE_STORAGE,
          `Generated new ID`,
          { id: notification.id }
        )
      );
    }

    allNotifications[notification.id] = notification;
    await fsPromises.writeFile(
      this.#path,
      JSON.stringify(allNotifications, null, 2)
    );
    this.#allIDs.push(notification.id);

    this.#logger.info(
      this.#logger.formatMessage(
        SERVICE_NAMES.FILE_STORAGE,
        `Notification saved`,
        { id: notification.id }
      )
    );

    return notification.id;
  }

  /**
   * Finds a notification by its ID.
   *
   * @param {number} id - The notification ID to search for
   * @returns {Promise<import('../models/notificationModel.js').default>} Notification instance if found
   * @throws {RecordNotFoundError} If a record with the required ID is not found.
   * @throws {DeserializationError} If the stored data cannot be deserialized into a Notification instance.
   */
  async findByIdAsync(id) {
    if (!this.#allIDs.includes(id)) {
      this.#logger.warn(
        this.#logger.formatMessage(
          SERVICE_NAMES.FILE_STORAGE,
          `Attempted to find non-existent record`,
          { id }
        )
      );
      const message = this.#debugMode
        ? `Record with id '${id}' not found`
        : "Invalid value";
      throw new RecordNotFoundError(message, id);
    }

    this.#logger.debug(
      this.#logger.formatMessage(
        SERVICE_NAMES.FILE_STORAGE,
        `Finding notification`,
        { id }
      )
    );
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
    const rawData = await fsPromises.readFile(this.#path);
    return JSON.parse(rawData);
  }

  /**
   * Returns a list of objects that represent unsent notifications.
   * 
   * @returns {import("../models/notificationModel.js").default[]}
   */
  findUnsent() {
    const rawData = fs.readFileSync(this.#path, "utf-8");
    const result = [];
    for (const rawNotification of Object.values(JSON.parse(rawData))) {
      if (new Date(rawNotification.sendAt) > new Date && rawNotification.status !== STATUSES.DELIVERED) {
        result.push(new Notification(rawNotification));
      }
    }
    return result;
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
        this.#logger.formatMessage(
          SERVICE_NAMES.FILE_STORAGE,
          `Attempted to update missing record`,
          { id: notification.id }
        )
      );
      const message = this.#debugMode
        ? `Record with id '${notification.id}' not found`
        : "Invalid value";
      throw new RecordNotFoundError(message, notification.id);
    }

    this.#logger.info(
      this.#logger.formatMessage(
        SERVICE_NAMES.FILE_STORAGE,
        `Updating notification`,
        { id: notification.id }
      )
    );
    const allNotifications = await this.findAllAsync();
    allNotifications[notification.id] = notification;
    await fsPromises.writeFile(
      this.#path,
      JSON.stringify(allNotifications, null, 2)
    );

    this.#logger.debug(
      this.#logger.formatMessage(
        SERVICE_NAMES.FILE_STORAGE,
        `Notification updated successfully`,
        { id: notification.id }
      )
    );
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
      this.#logger.warn(
        this.#logger.formatMessage(
          SERVICE_NAMES.FILE_STORAGE,
          `Attempted to delete missing record`,
          { id }
        )
      );
      const message = this.#debugMode
        ? `Record with id '${id}' not found`
        : "Invalid value";
      throw new RecordNotFoundError(message, id);
    }

    this.#logger.debug(
      this.#logger.formatMessage(
        SERVICE_NAMES.FILE_STORAGE,
        `Deleting notification`,
        { id }
      )
    );
    const allNotifications = await this.findAllAsync();
    delete allNotifications[id];
    await fsPromises.writeFile(
      this.#path,
      JSON.stringify(allNotifications, null, 2)
    );

    this.#allIDs.splice(this.#allIDs.indexOf(id), 1);
    this.#logger.debug(
      this.#logger.formatMessage(
        SERVICE_NAMES.FILE_STORAGE,
        `Notification deleted`,
        { id, remainingCount: this.#allIDs.length }
      )
    );
  }

  /**
   * Checks if a notification with the given ID exists in storage.
   * Uses the cached list of IDs for fast lookup without reading the file.
   *
   * @param {number} id - The notification ID to check
   * @returns {boolean} true if the ID exists in storage, false otherwise
   */
  hasId(id) {
    return this.#allIDs.includes(id);
  }
}
