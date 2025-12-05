import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { MarketDataSimulator } from "./services/MarketDataSimulator";
import { TickerService } from "./services/TickerService";
import { SocketServer } from "./websocket/SocketServer";
import { createTickerRoutes } from "./routes/tickerRoutes";

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

  const tickerService = new TickerService();
  const marketSimulator = new MarketDataSimulator();

  app.use("/api/tickers", createTickerRoutes(tickerService));

  new SocketServer(httpServer, marketSimulator, tickerService, CORS_ORIGIN);

  marketSimulator.start();

  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`WebSocket server ready`);
    console.log(`CORS enabled for: ${CORS_ORIGIN}`);
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully...");
    marketSimulator.stop();
    httpServer.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  });
}

bootstrap();
