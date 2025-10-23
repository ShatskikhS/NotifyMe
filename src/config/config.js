// config.js — собирает окончательную конфигурацию из CLI и .env

import dotenv from "dotenv";
import cliOptions from "./cliParams.js";
import { EnvironmentValueError } from "../errors.js";
import envSchema from "../validation/env.js";

dotenv.config();

const { error, value } = envSchema.validate(process.env);
if (error) throw new EnvironmentValueError(error.message);

class Config {
  constructor(cliParams = cliOptions, envParams = value) {
    this.port = cliParams.port ?? envParams.PORT;
    if (this.port === undefined)
      throw new EnvironmentValueError(
        "The port number value must be specified in one of the following ways: via a cli parameter, an environment variable, or .env file."
      );
    this.debug = Boolean(cliParams.debug) || envParams.DEBUG;
  }
}

const config = new Config();
export default config;
