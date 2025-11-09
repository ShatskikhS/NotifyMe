/**
 * Configuration module that merges CLI and environment options.
 *
 * This module collects the final application configuration by combining
 * command-line arguments (CLI) and environment variables (.env file).
 * CLI parameters take precedence over environment variables.
 *
 * @module config/config
 */

import cliOptions from "./cli.js";
import envOptions from "./env.js";
import { EnvironmentValueError } from "../errors.js";

/**
 * Application configuration class.
 *
 * Merges configuration from CLI parameters and environment variables,
 * with CLI parameters taking precedence. Validates that required
 * configuration values are present.
 *
 * @class Config
 * @property {number} port - Server port number (required)
 * @property {boolean} debug - Debug mode flag (defaults to false)
 * @property {string} notificationsFile - Path to JSON notifications storage file
 *                                        (defaults to "data/allNotifications.json")
 *
 * @example
 * // Use default CLI and env options
 * const config = new Config();
 *
 * // Or provide custom options
 * const customConfig = new Config(
 *   { port: 3000, debug: true },
 *   { port: 8080, notificationsFile: "custom.json" }
 * );
 */
export default class Config {
  /**
   * Creates a new Config instance.
   *
   * Merges CLI and environment parameters, with CLI taking precedence.
   * Throws an error if the required 'port' value is not provided.
   *
   * @param {import('./cli.js').AppOptions} [cliParams=cliOptions] - Command-line options
   * @param {import('./env.js').AppOptions} [envParams=envOptions] - Environment variable options
   * @throws {EnvironmentValueError} If the port number is not specified in either CLI or environment
   */
  constructor(cliParams = cliOptions, envParams = envOptions) {
    this.port = cliParams.port ?? envParams.port;
    if (this.port === undefined)
      throw new EnvironmentValueError(
        "The port number value must be specified in one of the following ways: via a cli parameter, an environment variable, or .env file."
      );
    this.debug = cliParams.debug ?? envParams.debug ?? false;
    this.notificationsFile = cliParams.notificationsFile ?? envParams.notificationsFile ?? "data/allNotifications.json";
  }
}
