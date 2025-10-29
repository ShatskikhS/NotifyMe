import winston from "winston";
const { combine, timestamp, printf, colorize } = winston.format;
import config from "./config/config.js"

const customTransports = [];

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      filename: "logs/combined.log",
      level: config.debug ? "debug" : "info",
      maxsize: 5_000_000,
      maxFiles: 5,
      tailable: true,
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        printf(({ level, message, timestamp }) => {
          return `[${timestamp}] ${level}: ${message}`;
        })
      )
    }),
    new winston.transports.Console(),
  ],
});

logger.info("Server started");
logger.warn("Low disk space");
logger.error("Something went wrong");

console.log(config.debug);
