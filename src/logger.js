import winston from "winston";
const { format, transports } = winston;
const { combine, timestamp, printf, colorize, errors, json } = format;
import config from "./config/config.js";

const customTransports = [
  new transports.File({
    filename: "logs/combined.log",
    maxsize: 5_000_000,
    maxFiles: 5,
    tailable: true,
    format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), json()),
  }),
  new transports.File({
    filename: "logs/error.log",
    level: "error",
    maxsize: 5_000_000,
    maxFiles: 5,
    tailable: true,
    format: combine(
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      errors({ stack: true }),
      json()
    ),
  }),
];

if (config.debug)
  customTransports.push(
    new transports.Console({
      format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        colorize(),
        printf(({ level, message, timestamp }) => {
          return `[${timestamp}] ${level}: ${message}`;
        })
      ),
    })
  );

const logger = winston.createLogger({
  defaultMeta: { service: "notifyme" },
  level: config.debug ? "debug" : "info",
  transports: customTransports,
});

export default logger;

logger.silly("SILLY message");
logger.debug("DEBUG message"); // 🚫 не появится
logger.info("INFO message");  // ✅ появится
logger.error("ERROR message"); // ✅ появится