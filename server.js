import app from "./src/app.js";
import { config, mainLogger } from "./src/app.js";

app.listen(config.port, () => {
  mainLogger.info(`Server is running http://localhost:${config.port}`);
});
