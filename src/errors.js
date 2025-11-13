/**
 * Base error class for the application
 */
export class NotifyMeError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Configuration and setup errors
 */
export class ConfigurationError extends NotifyMeError {}

export class EnvironmentValueError extends ConfigurationError {
  constructor(message) {
    super(message);
  }
}

export class CliOptionError extends ConfigurationError {
  constructor(message) {
    super(message);
  }
}

/**
 * Validation errors
 */
export class ValidationError extends NotifyMeError {}

export class NotificationValidationError extends ValidationError {
  /**
   * 
   * @param {import('joi').ValidationError} err 
   */
  constructor(err) {
    super(err.message);
    this.annotation = err.annotate();
    this.details = err.details;
    this.status = 400;
    // TODO: After implementing the error handler, make sure all fields are required
  }
}

export class IdValidationError extends ValidationError {
  /**
   * 
   * @param {import('joi').ValidationError} err 
   */
  constructor(err, path, requestMethod) {
    super(err.message);
    this.annotation = err.annotate();
    this.details = err.details;
    this.path = path;
    this.requestMethod = requestMethod;
    this.status = 400;
    // TODO: After implementing the error handler, make sure all fields are required
  }
}

/**
 * Data handling errors
 */
export class DataError extends NotifyMeError {}

/**
 * Error thrown when attempting to serialize data that cannot be converted to JSON.
 *
 * @class SerializationError
 * @extends DataError
 * @property {any|null} data - The data that failed to serialize.
 * @example
 * throw new SerializationError("Failed to serialize notification", faultyObject);
 */
export class SerializationError extends DataError {
  constructor(message, data = null) {
    super(message);
    this.data = data;
  }
}

/**
 * Error thrown when attempting to parse invalid JSON data.
 *
 * @class DeserializationError
 * @extends DataError
 * @property {any|null} data - The data that failed to deserialize.
 * @example
 * throw new DeserializationError("Malformed JSON structure", invalidJsonString);
 */
export class DeserializationError extends DataError {
  constructor(message, data = null) {
    super(message);
    this.data = data;
  }
}

/**
 * Error thrown when attempting to add a record with an ID that already exists.
 *
 * @class DuplicateIdError
 * @extends DataError
 * @property {number} id - The conflicting record ID.
 * @property {number} status - HTTP status code 409 (Conflict).
 * @example
 * throw new DuplicateIdError(42);
 */
export class DuplicateIdError extends DataError {
  constructor(id) {
    super(`Record with id "${id}" already exists`);
    this.id = id;
    this.status = 409;
  }
}

/**
 * Error thrown when a record with the specified ID cannot be found.
 * Used for both update and delete operations.
 *
 * @class RecordNotFoundError
 * @extends DataError
 * @property {number} id - The missing record ID.
 * @property {number} status - HTTP status code 404 (Not Found).
 * @example
 * throw new RecordNotFoundError(42);
 */
export class RecordNotFoundError extends DataError {
  constructor(id) {
    super(`Record with id "${id}" not found`);
    this.id = id;
    this.status = 404;
  }
}

/**
 * Error thrown when an existing JSON storage file is invalid
 * or does not match the expected schema during initialization.
 *
 * @class InvalidStorageFileError
 * @extends DataError
 * @property {string} filePath - The path to the invalid JSON file.
 * @property {number} status - HTTP status code 500 (Internal Server Error).
 * @example
 * throw new InvalidStorageFileError("/data/notifications.json");
 */
export class InvalidStorageFileError extends DataError {
  constructor(filePath) {
    super(`Invalid JSON storage structure in file: ${filePath}`);
    this.filePath = filePath;
    this.status = 500;
  }
}

/**
 * Domain (business logic) errors
 */
export class DomainError extends NotifyMeError {}

/**
 * Error thrown when attempting to perform an operation
 * on a notification that is not scheduled for future delivery.
 *
 * @class NotScheduledNotificationError
 * @extends DomainError
 * @property {number} id - Notification ID.
 * @property {string} reason - Explanation why it's not scheduled.
 * @property {number} status - HTTP status code 409 (Conflict).
 * @example
 * throw new NotScheduledNotificationError(42, "missing sendAt field");
 */
export class NotScheduledNotificationError extends DomainError {
  constructor(id, reason) {
    super(`Notification with id "${id}" is not scheduled for future delivery (${reason}).`);
    this.id = id;
    this.reason = reason;
    this.status = 409; // конфликт логического состояния
  }
}
