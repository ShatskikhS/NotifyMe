import { Router } from 'express';
import notifyController from "../controllers/notifyController.js"

/**
 * Creates and configures Express router for handling notifications.
 * 
 * Creates a new Express router instance and registers a POST route
 * for handling incoming notification creation requests. The route expects
 * a JSON request body with notification data (source, message, channels, priority, sendAt).
 * 
 * @param {import('../config/config.js').default} config - Application configuration instance,
 *   containing application settings, including debug mode
 * @param {import('../logger.js').default} logger - MainLogger instance for logging
 *   operations and errors during request processing
 * @param {import('../stores/fsStores.js').default} fsManager - FsNotifications instance
 *   for working with local JSON storage of notifications
 * 
 * @returns {import('express').Router} Configured Express router with registered
 *   POST route "/" for handling notifications
 * 
 * @example
 * // Usage in app.js:
 * const router = crateNotifyRouter(config, logger, fsManager);
 * app.use("/notify", router);
 * 
 * // POST request to /notify:
 * // {
 * //   "source": "system",
 * //   "message": "Test notification",
 * //   "channels": ["console", "file"],
 * //   "priority": "high",
 * // }
 */
export default function crateNotifyRouter(config, logger, fsManager) {
    const router = Router();

    router.post("/", (req, res, next) => 
        notifyController(req, res, next, config, logger, fsManager)
    );
    return router;
}
