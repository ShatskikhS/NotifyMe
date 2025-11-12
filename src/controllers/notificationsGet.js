/**
 * GET request controller for handling request to receive information about
 * all notifications
 *
 * Route: GET '/notifications'
 *
 * @param {import('express').Request} req - Express request object containing the
 *   notification ID in req.params.id
 * @param {import('express').Response} res - Express response object for sending
 *   the HTTP response
 * @param {import('express').NextFunction} next - Express next middleware function
 *   for error handling
 * @param {import('../config/config.js').default} config - Application
 *   configuration instance containing settings (e.g., debug mode)
 * @param {import('../logger.js').default} logger - MainLogger instance for
 *   logging operations and errors during request processing
 * @param {import('../stores/fsStores.js').default} fsManager - FsNotifications
 *   instance for managing local JSON storage of notifications
 *
 * @returns {void}
 */
export default async function getController(req, res, next, logger, fsManager) {
  try {
    logger.debug("Processing a request to receive all notifications.");
    const notifications = await fsManager.findAllAsync();
    res.status(200).json(notifications);
  } catch (err) {
    next(err);
  }
}
