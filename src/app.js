// app.js
// Точка входа Express-приложения
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { logger } from './logger.js';

const app = express();
app.use(express.json());
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));

// TODO: добавить маршруты
// import notifyRouter from './routes/notify.js';
// app.use('/notify', notifyRouter);

// Глобальный обработчик ошибок
// import errorHandler from './middlewares/errorHandler.js';
// app.use(errorHandler);

export default app;
