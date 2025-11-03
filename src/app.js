// app.js
// Точка входа Express-приложения
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xss from "xss-clean";
import hpp from "hpp";
import logger from "./logger.js";
import config from "./config/config.js";
import crateNotifyRouter from "./routes/notify.js"

const app = express();
app.use(express.json());
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));
app.use(xss());
app.use(hpp());

// TODO: добавить:
// Глобальный обработчик ошибок
// import errorHandler from './middlewares/errorHandler.js';
// app.use(errorHandler);

app.use("/notify", crateNotifyRouter({ config, logger }));

app.use((_, res) => {
  res.status(404).json({ error: "Not Found" });
});

export default app;
