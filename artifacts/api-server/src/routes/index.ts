import { Router, type IRouter } from "express";
import healthRouter from "./health";
import pawconnectRouter from "./pawconnect";

const router: IRouter = Router();

router.use(healthRouter);
router.use(pawconnectRouter);

export default router;
