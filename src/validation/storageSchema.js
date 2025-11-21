import Joi from "joi";
import { SOURCES, CHANNELS, PRIORITIES, STATUSES } from "../models/consts/notificationFields.js";
import { DEBUG_MESSAGES } from "../models/consts/notificationMessages.js"

/**
 * Creates a Joi validation schema for the entire storage file.
 * 
 * The storage is a JSON object where:
 * - Keys are unique notification IDs (numeric strings).
 * - Values are Notification objects.
 * 
 * This schema validates:
 * 1. The structure of the storage object (keys must be numeric).
 * 2. The integrity of each notification object within the storage.
 * 
 * Used during application initialization to ensure the storage file
 * is not corrupted and contains valid data.
 * 
 * @returns {import('joi').ObjectSchema} A Joi object schema for storage validation
 */
export default function createStorageSchema() {
  return Joi.object()
    .pattern(
      Joi.number().integer().min(1),
      Joi.object({
        id: Joi.number().integer().min(1).required(),
        source: Joi.string().valid(...Object.values(SOURCES)).required(),
        priority: Joi.string().valid(...Object.values(PRIORITIES)).required(),
        message: Joi.string().required(),
        channels: Joi.array()
          .items(Joi.string().valid(...Object.values(CHANNELS)))
          .min(1)
          .unique()
          .required(),
        receivedAt: Joi.date().iso().required(),
        sendAt: Joi.date().iso().allow(null).required(),
        status: Joi.string().valid(...Object.values(STATUSES)).required(),
      })
    )
    .messages(DEBUG_MESSAGES);
}
