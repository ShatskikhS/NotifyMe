import winston from "winston";
const { combine, timestamp, printf, colorize } = winston.format;

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({ // Настройки вывода в консоль.
      format: combine(
        colorize(),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        printf(({ level, message, timestamp }) => {
          return `[${timestamp}] ${level}: ${message}`;
        })
      ),
      level: "debug",
    }),
  ],
});

logger.info("Server started");
logger.warn("Low disk space");
logger.error("Something went wrong");
