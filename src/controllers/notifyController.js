import createValidationSchema from "../validation/notify.js";
import { NotificationValidationError } from "../errors.js"

export default function notifyController(req, res, config, logger) {
    const schema = createValidationSchema(config.debug);
    const { error, "value": notification } = schema.validate(req.body);
    if (error) {
        throw new NotificationValidationError(error);
    }
    if 
}
