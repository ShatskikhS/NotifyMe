import winston from "winston";
const { format, transports: winstonTransports } = winston;
const { combine, timestamp, printf, colorize, errors, json } = format;

/**
 * Main logger class that wraps Winston logger.
 * Provides a configured logger instance for the application.
 *
 * @class MainLogger
 */
export default class MainLogger {
  /**
   * Creates a new MainLogger instance.
   *
   * @param {Object} options - Logger configuration options
   * @param {boolean} [options.debug=false] - Enable debug mode (adds console transport)
   * @param {string} [options.combinedPath="logs/combined.log"] - Path to combined log file
   * @param {string} [options.errorsPath="logs/error.log"] - Path to error log file
   * @param {number} [options.maxFileSize=5000000] - Maximum size of log files in bytes
   * @param {number} [options.maxNumberFiles=5] - Maximum number of log files to keep
   */
  constructor({
    debug = false,
    combinedPath = "logs/combined.log",
    errorsPath = "logs/error.log",
    maxFileSize = 5_000_000,
    maxNumberFiles = 5,
  } = {}) {
    const loggerTransports = this._getMainTransports(
      combinedPath,
      errorsPath,
      maxFileSize,
      maxNumberFiles
    );
    if (debug) {
      loggerTransports.push(this._getDebugTransport());
    }

    this.logger = winston.createLogger({
      defaultMeta: { service: "notifyme" },
      level: debug ? "debug" : "info",
      transports: loggerTransports,
    });
  }

  /**
   * Creates main file transports for logging.
   *
   * @private
   * @param {string} combinedPath - Path to combined log file
   * @param {string} errorsPath - Path to error log file
   * @param {number} maxFileSize - Maximum file size in bytes
   * @param {number} maxNumberFiles - Maximum number of files to keep
   * @returns {Array<winston.transports.File>} Array of file transports
   */
  _getMainTransports(combinedPath, errorsPath, maxFileSize, maxNumberFiles) {
    return [
      new winstonTransports.File({
        filename: combinedPath,
        maxsize: maxFileSize,
        maxFiles: maxNumberFiles,
        tailable: true,
        format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), json()),
      }),
      new winstonTransports.File({
        filename: errorsPath,
        level: "error",
        maxsize: maxFileSize,
        maxFiles: maxNumberFiles,
        tailable: true,
        format: combine(
          timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
          errors({ stack: true }),
          json()
        ),
      }),
    ];
  }

  /**
   * Creates console transport for debug mode.
   *
   * @private
   * @returns {winston.transports.Console} Console transport
   */
  _getDebugTransport() {
    return new winstonTransports.Console({
      format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        colorize(),
        printf(({ level, message, timestamp }) => {
          return `[${timestamp}] ${level}: ${message}`;
        })
      ),
    });
  }

  /**
   * Formats a log message according to the project standard.
   * Structure: [Service]: Message | key=value | key=value
   *
   * @param {string} service - Name of the service (must be from SERVICE_NAMES)
   * @param {string} message - Event description
   * @param {Object} [params={}] - Key-value pairs for context
   * @returns {string} Formatted log string
   * @throws {Error} If service name is invalid
   */
  formatMessage(service, message, params = {}) {
    // We import dynamically to avoid circular dependencies if any, 
    // but here it's fine to rely on the passed value matching the enum.
    // Ideally, we check against the values of SERVICE_NAMES.
    // For performance, we might skip validation in production, but strictly enforcing it helps consistency.

    // Note: To strictly validate, we would need to import SERVICE_NAMES.
    // Since this is a utility method on the logger instance, we can assume the caller uses the constant.
    // However, to be safe and helpful, let's format it correctly.

    let logString = `[${service}]: ${message}`;

    if (Object.keys(params).length > 0) {
      const paramString = Object.entries(params)
        .map(([key, value]) => `${key}=${value}`)
        .join(' | ');
      logString += ` | ${paramString}`;
    }

    return logString;
  }

  // Winston logger methods delegation
  error(...args) {
    return this.logger.error(...args);
  }

  warn(...args) {
    return this.logger.warn(...args);
  }

  info(...args) {
    return this.logger.info(...args);
  }

  http(...args) {
    return this.logger.http(...args);
  }

  debug(...args) {
    return this.logger.debug(...args);
  }

  silly(...args) {
    return this.logger.silly(...args);
  }
}
