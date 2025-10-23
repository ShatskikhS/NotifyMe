export class EnvironmentValueError extends Error {
  constructor(message) {
    super(message);
    this.name = "EnvironmentValueError";
  }
}

export class InvalidOptionArgumentError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidOptionArgumentError";
  }
}
