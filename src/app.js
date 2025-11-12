// app.js
// Точка входа Express-приложения
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xss from "xss-clean";
import hpp from "hpp";

import MainLogger from "./logger.js";
import Config from "./config/config.js";
import FsNotifications from "./stores/fsStores.js";

import crateNotifyRouter from "./routes/notifyRouter.js";

const app = express();
app.use(express.json());
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));
// app.use(xss());
app.use(hpp());

// TODO: добавить:
// Глобальный обработчик ошибок
// import errorHandler from './middlewares/errorHandler.js';
// app.use(errorHandler);

const config = new Config();
const mainLogger = new MainLogger({ debug: config.debug });
const fsManager = new FsNotifications(config.notificationsFile, mainLogger);

app.use("/notify", crateNotifyRouter(config, mainLogger, fsManager));

app.get("/", (req, res) => {
  mainLogger.info("Home GET-request");
  res.status(200).json({ status: "ok", time: Date.now() });
});

app.use((_, res) => {
  res.status(404).json({ error: "Not Found" });
});

export default app;
export { config, mainLogger };
