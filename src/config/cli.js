import { Command, Option } from "commander";
import optionsSchema from "../validation/appOptions.js";
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

export default cliOptions;
