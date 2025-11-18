import { Router } from "express";
import postController from "../controllers/notificationsPost.js";
import getController from "../controllers/notificationsGet.js";
import getIdController from "../controllers/notificationsGetId.js";
import deleteIdController from "../controllers/notificationsDeleteId.js";
import pathController from "../controllers/notificationsPath.js";
import validateIdMiddleware from "../middlewares/validateId.js";
import checkRecordExistsMiddleware from "../middlewares/checkRecordExistsMiddleware.js"

/**
 * Creates and configures Express router for handling notifications.
 *
 * Creates a new Express router instance and registers routes for handling
 * notification operations. The ID validation middleware is automatically applied
 * to all routes with the :id parameter using router.param().
 *
 * @param {import('../config/config.js').default} config - Application configuration instance,
 *   containing application settings, including debug mode
 * @param {import('../logger.js').default} logger - MainLogger instance for logging
 *   operations and errors during request processing
 * @param {import('../stores/fsStores.js').default} fsManager - FsNotifications instance
 *   for working with local JSON storage of notifications
 *
 * @returns {import('express').Router} Configured Express router with registered routes
 *
 * @example
 * // Usage in app.js:
 * const router = crateNotifyRouter(config, logger, fsManager);
 * app.use("/notifications", router);
 *
 * // POST request to /notifications:
 * // {
 * //   "source": "system",
 * //   "message": "Test notification",
 * //   "channels": ["console", "file"],
 * //   "priority": "high",
 * // }
 */
export default function crateNotifyRouter(config, logger, fsManager) {
  const router = Router();

  // Register ID validation middleware for all routes with :id parameter
  router.param("id", validateIdMiddleware(config, logger));
  router.param("id", checkRecordExistsMiddleware(config, logger, fsManager));

  router.post("/", postController(config, logger, fsManager));
  router.get("/", getController(logger, fsManager));
  router.get("/:id", getIdController(config, logger, fsManager));
  router.delete("/:id", deleteIdController(config, logger, fsManager));
  router.patch("/:id", pathController(config, logger, fsManager));

  return router;
}
