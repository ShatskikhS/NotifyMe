import morgan from "morgan";

/**
 *
 * @param {import('../logger.js').default} logger - MainLogger instance for logging
 * @returns
 */
export default function httpLoggerMiddleware(logger) {
  return morgan("combined", {
    stream: { write: (message) => logger.http(message.trim()) },
  });
}
