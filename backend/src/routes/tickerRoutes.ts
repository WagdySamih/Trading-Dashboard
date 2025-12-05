import { Router } from "express";
import { TickerController } from "../controllers/TickerController";
import { TickerService } from "../services/TickerService";

export function createTickerRoutes(tickerService: TickerService): Router {
  const router = Router();
  const controller = new TickerController(tickerService);

  router.get("/", controller.getAllTickers);
  router.get("/:id", controller.getTickerById);
  router.get("/:id/history", controller.getTickerHistory);

  return router;
}
