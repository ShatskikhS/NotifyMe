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
  constructor(err) {
    super(err.message);
    this.annotation = err.annotate();
    this.details = err.details;
    this.status = 400;
    // TODO: After implementing the error handler, make sure all fields are required
  }
}

/**
 * Data handling errors
 */
export class DataError extends NotifyMeError {}

export class SerializationError extends DataError {
  constructor(message, data = null) {
    super(message);
    this.data = data;
  }
}

export class DeserializationError extends DataError {
  constructor(message, data = null) {
    super(message);
    this.data = data;
  }
}
