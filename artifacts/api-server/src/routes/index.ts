import { Router, type IRouter } from "express";
import healthRouter from "./health";
import simRouter from "./sim";

const router: IRouter = Router();

router.use(healthRouter);
router.use(simRouter);

export default router;
