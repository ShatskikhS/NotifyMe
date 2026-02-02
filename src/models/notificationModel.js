import { DeserializationError } from "../errors.js";
import { PRIORITIES, STATUSES } from "./consts/notificationFields.js";
/**
 * Represents a notification in the system.
 */
class Notification {
  /**
   * Creates a new Notification instance.
   *
   * @param {Object} params - The notification parameters
   * @param {number} [params.id] - Unique identifier (optional for new notifications)
   * @param {string} params.source - Source of the notification
   * @param {string} [params.priority=PRIORITIES.LOW] - Priority level
   * @param {string} params.message - Notification message
   * @param {string[]} params.channels - Delivery channels
   * @param {Date|string} [params.sendAt] - Scheduled send date
   * @param {Date|string} [params.receivedAt] - Received date
   * @param {string} [params.status=STATUSES.RECEIVED] - Current status
   */
  constructor({
    id = undefined,
    source,
    priority = PRIORITIES.LOW,
    message,
    channels,
    sendAt,
    receivedAt,
    status = STATUSES.RECEIVED,
  } = {}) {
    /** @type {number|undefined} */
    this.id = id;
    /** @type {string} */
    this.source = source;
    /** @type {string} */
    this.priority = priority;
    /** @type {string} */
    this.message = message;
    /** @type {string[]} */
    this.channels = [...channels];
    /** @type {Date|null} */
    this.sendAt = sendAt
      ? sendAt instanceof Date
        ? sendAt
        : new Date(sendAt)
      : null;
    /** @type {Date} */
    this.receivedAt = receivedAt
      ? receivedAt instanceof Date
        ? receivedAt
        : new Date(receivedAt)
      : new Date();
    /** @type {string} */
    this.status = status;
  }

  toJSON() {
    return {
      id: this.id,
      source: this.source,
      priority: this.priority,
      message: this.message,
      channels: this.channels,
      receivedAt: this.receivedAt,
      sendAt: this.sendAt,
      status: this.status,
    };
  }

  /**
   * Creates a Notification instance from a JSON object.
   *
   * @param {Object} obj - The JSON object
   * @returns {Notification} A new Notification instance
   * @throws {DeserializationError} When the input object is null or undefined
   */
  static fromJSON(obj) {
    if (!obj) {
      throw new DeserializationError(
        "Failed to create Notification object. JSON object is required for deserialization");
    }
    return new Notification({
      ...obj,
      sendAt: obj.sendAt ? new Date(obj.sendAt) : null,
      receivedAt: obj.receivedAt ? new Date(obj.receivedAt) : new Date(),
    });
  }
}

export default Notification;
