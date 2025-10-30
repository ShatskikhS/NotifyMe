// config.js — собирает окончательную конфигурацию из CLI и .env

import cliOptions from "./cli.js";
import envOptions from "./env.js";
import { EnvironmentValueError } from "../errors.js";

export class Config {
  constructor(cliParams = cliOptions, envParams = envOptions) {
    this.port = cliParams.port ?? envParams.port;
    if (this.port === undefined)
      throw new EnvironmentValueError(
        "The port number value must be specified in one of the following ways: via a cli parameter, an environment variable, or .env file."
      );
    this.debug = cliParams.debug ?? envParams.debug ?? false;
  }
}

const config = new Config();
export default config;
