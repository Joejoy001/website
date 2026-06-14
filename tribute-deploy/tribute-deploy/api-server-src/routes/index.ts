import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tributesRouter from "./tributes";
import rsvpRouter from "./rsvp";

const router: IRouter = Router();

router.use(healthRouter);
router.use(tributesRouter);
router.use(rsvpRouter);

export default router;
