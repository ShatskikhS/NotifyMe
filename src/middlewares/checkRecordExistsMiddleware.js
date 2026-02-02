import { RecordNotFoundDomainError } from "../errors.js";

/**
 * Builds a middleware ensuring that a requested record exists in the store.
 *
 * Checks if the ID provided in `req.params.id` exists in the storage.
 * If not, throws a RecordNotFoundDomainError.
 *
 * @param {import('../config/config.js').default} config - Configuration determining runtime behavior (e.g., debug mode)
 * @param {import('../logger.js').default} logger - Application logger used to log denied accesses
 * @param {import('../stores/fsStores.js').default} fsManager - Store manager exposing `hasId` lookups
 * @returns {import('express').RequestHandler} Express middleware that validates `req.params.id`
 */
export default function checkRecordExistsMiddleware(config, logger, fsManager) {
  return (req, res, next) => {
    try {
      const id = req.params.id;
      if (!fsManager.hasId(id)) {
        const message = config.debug
          ? `Parameter '/:id' = ${id} was not found in the storage.`
          : "Invalid request";
        throw new RecordNotFoundDomainError(message, id);
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
