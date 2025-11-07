/**
 * CLI configuration module.
 *
 * Parses command line arguments using commander, validates them through
 * src/validation/appOptionsSchema.js and exports validated options
 * for use in the application.
 *
 * Supported options:
 *  - port: server port number (number | undefined)
 *  - debug: debug flag (boolean)
 *  - notificationsFile: path to JSON notifications storage file (string | undefined)
 *
 * @module config/cli
 */

/**
 * @typedef {Object} AppOptions
 * @property {number|undefined} port - Server port number
 * @property {boolean} debug - Debug mode flag
 * @property {string|undefined} notificationsFile - Path to .json notifications file
 */

import { Command, Option } from "commander";
import optionsSchema from "../validation/appOptionsSchema.js";
import { CliOptionError } from "../errors.js";

const program = new Command();

program.description("A personal notification service").version("1.0.0");

program.addOption(new Option("-p, --port <number>", "port number"));
program.addOption(new Option("-d, --debug [flag]", "output extra debugging info"));
program.addOption(new Option("--notifications-file <path>", "path to the notification json storage"));

program.parse(process.argv);

const rawOptions = program.opts();

const { error, value: cliOptions } = optionsSchema.validate(rawOptions);

if (error) throw new CliOptionError(error.message);

/**
 * Validated command line options.
 * @type {AppOptions}
 */
export default cliOptions;
