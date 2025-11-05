import { DeserializationError } from "../errors.js";
import { PRIORITIES, STATUSES } from "./consts/notificationFields.js";
/**
 * Represents a notification in the system
 */
class Notification {
  /**
   * Creates a new Notification instance
   * @param {Object} params - The notification parameters
   * @param {string} params.id - Unique identifier
   * @param {string} params.source - Source of the notification
   * @param {string} [params.priority=PRIORITIES.LOW] - Priority level
   * @param {string} params.message - Notification message
   * @param {string[]} params.channels - Delivery channels
   * @param {Date|string} [params.sendAt] - Scheduled send date
   * @param {Date|string} [params.receivedAt] - Received date
   * @param {string} [params.status=STATUSES.RECEIVED] - Current status
   * @throws {Error} When required fields are missing or invalid
   */
  constructor({
    id,
    source,
    priority = PRIORITIES.LOW,
    message,
    channels,
    sendAt,
    receivedAt,
    status = STATUSES.RECEIVED,
  } = {}) {
    this.id = id;
    this.source = source;
    this.priority = priority;
    this.message = message;
    this.channels = [...channels];
    this.sendAt = sendAt
      ? sendAt instanceof Date
        ? sendAt
        : new Date(sendAt)
      : null;
    this.receivedAt = receivedAt
      ? receivedAt instanceof Date
        ? receivedAt
        : new Date(receivedAt)
      : new Date();
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
   * Creates a Notification instance from a JSON object
   * @param {Object} obj - The JSON object
   * @returns {Notification}
   * @throws {DeserializationError} When required fields are missing
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
