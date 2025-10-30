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

export class InvalidOptionArgumentError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidOptionArgumentError";
  }
}
