import dotenv from "dotenv";
import { EnvironmentValueError } from "../errors.js";
import optionsSchema from "../validation/appOptions.js";

dotenv.config({ quiet: true });

const rawEnvOptions = {
    port: process.env.PORT ?? undefined,
    debug: process.env.DEBUG ?? undefined
};

const { error, value: envOptions } = optionsSchema.validate(rawEnvOptions);

if (error) throw new EnvironmentValueError(error.message);

export default envOptions;
