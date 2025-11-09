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
    maxNumberFiles = 5 
  } = {}) {
    const loggerTransports = this._getMainTransports(combinedPath, errorsPath, maxFileSize, maxNumberFiles);
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

  debug(...args) {
    return this.logger.debug(...args);
  }

  verbose(...args) {
    return this.logger.verbose(...args);
  }

  silly(...args) {
    return this.logger.silly(...args);
  }
}
