// config.js — собирает окончательную конфигурацию из CLI и .env

import cliOptions from "../validation/cliParams.js";
import envOptions from "../validation/env.js";
import { EnvironmentValueError } from "../errors.js";

export class Config {
  constructor(cliParams = cliOptions, envParams = envOptions) {
    this.port = cliParams.port ?? envParams.PORT;
    if (this.port === undefined)
      throw new EnvironmentValueError(
        "The port number value must be specified in one of the following ways: via a cli parameter, an environment variable, or .env file."
      );
    this.debug = Boolean(cliParams.debug) || Boolean(envParams.DEBUG);
  }
}

const config = new Config();
export default config;
