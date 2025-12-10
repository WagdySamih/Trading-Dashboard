import express, { type Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import {
  MarketDataSimulator,
  TickerService,
  AlertService,
  CacheService,
} from "./services/index.js";
import { SocketServer } from "./websocket/SocketServer.js";
import { createTickerRoutes } from "./routes/tickerRoutes.js";

dotenv.config();

const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

function createApp(): Express {
  const app = express();

  app.use(cors({ origin: CORS_ORIGIN }));
  app.use(express.json());

  app.get("/health", (_, res) =>
    res.json({ status: "ok", timestamp: new Date().toISOString() }),
  );

  return app;
}

function bootstrap(): void {
  const app = createApp();
  const httpServer = createServer(app);

  // Initialize services
  const cacheService = new CacheService();
  const tickerService = new TickerService(cacheService);
  const marketSimulator = new MarketDataSimulator();
  const alertService = new AlertService();

  // Setup routes
  app.use("/api/tickers", createTickerRoutes(tickerService));

  // Cache stats endpoint for monitoring
  app.get("/api/cache/stats", (_, res) => {
    const stats = tickerService.getCacheStats();
    res.json({ success: true, data: stats });
  });

  // Initialize WebSocket
  new SocketServer(
    httpServer,
    marketSimulator,
    tickerService,
    alertService,
    CORS_ORIGIN,
  );

  // Start market simulation
  marketSimulator.start();

  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`WebSocket server ready`);
    console.log(`CORS enabled for: ${CORS_ORIGIN}`);
    console.log(`Cache enabled with tiered TTL (5-10 minutes)`);
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully...");
    marketSimulator.stop();
    cacheService.close();
    httpServer.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  });
}

bootstrap();
