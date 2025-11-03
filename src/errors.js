export class EnvironmentValueError extends Error {
  constructor(message) {
    super(message);
    this.name = "EnvironmentValueError";
  }
}

export class CliOptionError extends Error {
  constructor(message) {
    super(message);
    this.name = "CliOptionError";
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotificationValidationError extends ValidationError {
  constructor(err) {
    super(err.message);
    this.name = "NotificationValidationError";
    this.annotation = err.annotate()
    this.details = err.details;
    this.status = 400; // HTTP status code
    // TODO: After implementing the error handler, make sure all fields are required
  }
}
