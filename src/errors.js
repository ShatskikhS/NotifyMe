/**
 * Base error class for the application.
 *
 * @class NotifyMeError
 * @extends Error
 */
export class NotifyMeError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Configuration and setup errors.
 *
 * @class ConfigurationError
 * @extends NotifyMeError
 */
export class ConfigurationError extends NotifyMeError { }

/**
 * Error thrown when an environment variable has an invalid value.
 *
 * @class EnvironmentValueError
 * @extends ConfigurationError
 */
export class EnvironmentValueError extends ConfigurationError { }

/**
 * Error thrown when a CLI option has an invalid value.
 *
 * @class CliOptionError
 * @extends ConfigurationError
 */
export class CliOptionError extends ConfigurationError { }

/**
 * Error thrown when an existing JSON storage file is invalid
 * or does not match the expected schema during initialization.
 *
 * @class InvalidStorageFileError
 * @extends EnvironmentValueError
 * @property {string} filePath - The path to the invalid JSON file.
 * @example
 * throw new InvalidStorageFileError("/data/notifications.json");
 */
export class InvalidStorageFileError extends EnvironmentValueError {
  constructor(filePath) {
    super(`Invalid JSON storage structure in file: ${filePath}`);
    this.filePath = filePath;
  }
}

/**
 * Validation errors.
 *
 * Handles only errors resulting from user data validation.
 * Errors resulting from application startup parameter validation are handled in the ConfigurationError class.
 *
 * @class ValidationError
 * @extends NotifyMeError
 * @property {number} status - HTTP status code 400 (Bad Request).
 */
export class ValidationError extends NotifyMeError {
  constructor(message) {
    super(message);
    this.status = 400;
  }
}

/**
 * Error thrown when notification data validation fails.
 *
 * @class NotificationValidationError
 * @extends ValidationError
 * @property {Array} details - Validation error details from Joi.
 * @param {import('joi').ValidationError} err - Joi validation error object.
 */
export class NotificationValidationError extends ValidationError {
  constructor(err) {
    super(err.message);
    this.details = err.details;
  }
}

/**
 * Error thrown when ID parameter validation fails.
 *
 * @class IdValidationError
 * @extends ValidationError
 * @property {Array} details - Validation error details from Joi.
 * @param {import('joi').ValidationError} err - Joi validation error object.
 */
export class IdValidationError extends ValidationError {
  constructor(err) {
    super(err.message);
    this.details = err.details;
  }
}

/**
 * Data handling errors.
 * Represents internal errors that occur during data storage operations,
 * such as serialization failures, deserialization failures, or storage
 * inconsistencies that indicate a system-level problem.
 *
 * @class DataError
 * @extends NotifyMeError
 * @property {number} status - HTTP status code 500 (Internal Server Error).
 */
export class DataError extends NotifyMeError {
  constructor(message) {
    super(message);
    this.status = 500;
  }
}

/**
 * Error thrown when attempting to serialize data that cannot be converted to JSON.
 *
 * @class SerializationError
 * @extends DataError
 * @example
 * throw new SerializationError("Failed to serialize notification");
 */
export class SerializationError extends DataError { }

/**
 * Error thrown when attempting to parse invalid JSON data.
 *
 * @class DeserializationError
 * @extends DataError
 * @property {any|null} data - The data that failed to deserialize.
 * @param {string} message - Error message.
 * @param {any} [data=null] - Optional data that failed to deserialize.
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
 * Error thrown when attempting to add a record with an ID that already exists
 * due to an internal storage inconsistency.
 *
 * This error is thrown only in case of internal storage errors, such as when
 * the storage state is corrupted or there's a conflict in ID generation logic.
 * Client-related duplicate ID errors should use DuplicateIdDomainError instead.
 *
 * @class DuplicateIdError
 * @extends DataError
 * @property {number} id - The conflicting record ID.
 * @property {number} status - HTTP status code 500 (Internal Server Error).
 * @param {string} message - Error message.
 * @param {number} id - The conflicting record ID.
 * @example
 * throw new DuplicateIdError("Internal ID conflict detected", 42);
 */
export class DuplicateIdError extends DataError {
  constructor(message, id) {
    super(message);
    this.id = id;
  }
}

/**
 * Error thrown when a record with the specified ID cannot be found
 * due to an internal storage inconsistency.
 *
 * This error is thrown only in case of internal storage errors, such as when
 * a record that should exist according to internal state cannot be located
 * in the storage. Client-related not found errors should use RecordNotFoundDomainError instead.
 *
 * @class RecordNotFoundError
 * @extends DataError
 * @property {number} id - The missing record ID.
 * @property {number} status - HTTP status code 500 (Internal Server Error).
 * @param {string} message - Error message.
 * @param {number} id - The missing record ID.
 * @example
 * throw new RecordNotFoundError("Internal storage inconsistency", 42);
 */
export class RecordNotFoundError extends DataError {
  constructor(message, id) {
    super(message);
    this.id = id;
  }
}

/**
 * Domain (business logic) errors.
 * Represents errors that occur due to invalid client input or business
 * rule violations, such as attempting to access non-existent resources
 * or violating domain constraints.
 *
 * @class DomainError
 * @extends NotifyMeError
 */
export class DomainError extends NotifyMeError { }

/**
 * Error thrown when a client attempts to create or update a record
 * with an ID that already exists in the storage.
 *
 * This error is thrown when the client provides invalid data, such as
 * attempting to create a notification with an ID that is already taken.
 * For internal storage errors, use DuplicateIdError instead.
 *
 * @class DuplicateIdDomainError
 * @extends DomainError
 * @property {number} id - The conflicting record ID.
 * @property {number} status - HTTP status code 409 (Conflict).
 * @param {string} message - Error message.
 * @param {number} id - The conflicting record ID.
 * @example
 * throw new DuplicateIdDomainError("Record with id '42' already exists", 42);
 */
export class DuplicateIdDomainError extends DomainError {
  constructor(message, id) {
    super(message);
    this.id = id;
    this.status = 409;
  }
}

/**
 * Error thrown when a client attempts to access, update, or delete
 * a record with an ID that does not exist in the storage.
 *
 * This error is thrown when the client provides invalid data, such as
 * attempting to retrieve or modify a notification that doesn't exist.
 * For internal storage errors, use RecordNotFoundError instead.
 *
 * @class RecordNotFoundDomainError
 * @extends DomainError
 * @property {number} id - The missing record ID.
 * @property {number} status - HTTP status code 404 (Not Found).
 * @param {string} message - Error message.
 * @param {number} id - The missing record ID.
 * @example
 * throw new RecordNotFoundDomainError("Record with id '42' not found", 42);
 */
export class RecordNotFoundDomainError extends DomainError {
  constructor(message, id) {
    super(message);
    this.id = id;
    this.status = 404;
  }
}

/**
 * Error thrown when attempting to perform an operation
 * on a notification that is not scheduled for future delivery.
 *
 * @class NotScheduledNotificationError
 * @extends DomainError
 * @property {number} id - Notification ID.
 * @property {number} status - HTTP status code 409 (Conflict).
 * @param {number} id - Notification ID.
 * @param {string} message - Explanation why it's not scheduled.
 * @example
 * throw new NotScheduledNotificationError(42, "missing sendAt field");
 */
export class NotScheduledNotificationError extends DomainError {
  constructor(id, message) {
    super(message);
    this.id = id;
    this.status = 409;
  }
}
