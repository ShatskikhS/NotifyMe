import { Router } from 'express';
import notifyController from "../controllers/notifyController.js"

const router = express.Router();

export default function crateNotifyRouter({ config, logger }) {
    router.post("/", notifyController(req, res, config, logger));
    return router;
}
