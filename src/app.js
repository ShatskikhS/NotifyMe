import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xss from "xss-clean";
import hpp from "hpp";

import MainLogger from "./logger.js";
import Config from "./config/config.js";
import FsNotifications from "./stores/fsStores.js";

import crateNotifyRouter from "./routes/notificationsRouter.js";

import validationErrorHandler from "./middlewares/errorHandlers/validationErrorHandler.js";
import domainErrorHandler from "./middlewares/errorHandlers/domainErrorHandler.js";
import globalErrorHandler from "./middlewares/errorHandlers/globalErrorHandler.js";
import httpLoggerMiddleware from "./middlewares/httpLogMiddleware.js"

let config;
let mainLogger;
let fsManager;

try {
  config = new Config();
  mainLogger = new MainLogger({ debug: config.debug });
  fsManager = new FsNotifications(config.notificationsFile, mainLogger, config.debug);
} catch (err) {
  console.error("Failed to initialize application configuration:");
  console.error(err.message);
  console.error(err.stack);
  process.exit(1);
}

const app = express();
app.use(httpLoggerMiddleware(mainLogger));
app.use(express.json());
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));
// app.use(xss());
app.use(hpp());

app.use("/notifications", crateNotifyRouter(config, mainLogger, fsManager));
app.get("/", (req, res) => {
  mainLogger.info(`new request. Path: '/', method: ${req.method}`);
  res.status(200).json({ status: "ok", time: Date.now() });
});

app.use((_, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.use(validationErrorHandler(config, mainLogger));
app.use(domainErrorHandler(config, mainLogger));
app.use(globalErrorHandler(config, mainLogger));

export default app;
export { config, mainLogger };
