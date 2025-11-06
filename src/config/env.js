/**
 * @typedef {import('../validation/appOptionsSchema').AppOptions} AppOptions
 */

import dotenv from "dotenv";
import { EnvironmentValueError } from "../errors.js";
import optionsSchema from "../validation/appOptionsSchema.js";

dotenv.config({ quiet: true });

const ENV_VARS = {
    PORT: 'PORT',
    DEBUG: 'DEBUG',
    NOTIFICATIONS_FILE: 'NOTIFICATIONS_FILE'
};

/**
 * Raw environment variables before validation
 * @type {Partial<AppOptions>}
 */
const rawEnvOptions = {
    port: process.env[ENV_VARS.PORT] ?? undefined,
    debug: process.env[ENV_VARS.DEBUG] ?? undefined,
    notificationsFile: process.env[ENV_VARS.NOTIFICATIONS_FILE] ?? undefined,
};

/**
 * Validated environment configuration options
 * @type {AppOptions}
 * @property {number|undefined} port - Server port number from PORT env var
 * @property {boolean} debug - Debug mode flag from DEBUG env var
 * @property {string|undefined} notificationsFile - Storage file path from NOTIFICATIONS_FILE env var
 */
const { error, value: envOptions } = optionsSchema.validate(rawEnvOptions);

if (error) throw new EnvironmentValueError(error.message);

export default envOptions;
