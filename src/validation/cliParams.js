// cliParams.js — парсинг и валидация параметров командной строки

import { Command } from "commander";
import { InvalidOptionArgumentError } from "../errors.js";
import parsePort from "./port.js";

const program = new Command();

program
  .description("A personal notification service")
  .version("1.0.0")
  .option("-d, --debug", "output extra debugging info")
  .option("-p, --port <number>", "port number", (value) =>
    parsePort(
      value,
      new InvalidOptionArgumentError(`Invalid port number: '${value}'. Use a number between 0 and 65535.`)
    )
  );

program.parse(process.argv);

const options = program.opts();
export default options;
