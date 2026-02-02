import morgan from "morgan";
import { SERVICE_NAMES } from "../models/consts/serviceNames.js";

/**
 * Middleware for logging HTTP requests using Morgan.
 *
 * Configures Morgan to log requests using the 'combined' format and
 * streams the output to the application logger with the 'http' level.
 *
 * @param {import('../logger.js').default} logger - MainLogger instance for logging
 * @returns {import('express').RequestHandler} Express middleware function for logging
 */
export default function httpLoggerMiddleware(logger) {
  return morgan("combined", {
    stream: {
      write: (message) =>
        logger.http(
          logger.formatMessage(SERVICE_NAMES.REQUEST, message.trim())
        ),
    },
  });
}
