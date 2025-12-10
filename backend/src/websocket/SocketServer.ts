import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import {
  WsMessageType,
  type PriceUpdate,
  type AlertSubscription,
} from "@trading-dashboard/shared";
import { MarketDataSimulator, AlertService, TickerService } from "../services";

/**
 * SocketServer handles real-time WebSocket connections
 */
export class SocketServer {
  private io: SocketIOServer;

  constructor(
    httpServer: HTTPServer,
    private marketSimulator: MarketDataSimulator,
    private tickerService: TickerService,
    private alertService: AlertService,
    corsOrigin: string,
  ) {
    // Initialize Socket.IO with CORS
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: corsOrigin,
        methods: ["GET", "POST"],
      },
    });

    this.setupSocketHandlers();
    this.setupMarketDataListener();
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupSocketHandlers(): void {
    this.io.on("connection", (socket) => {
      socket.on(WsMessageType.SUBSCRIBE, (data: { tickerIds: string[] }) => {
        data.tickerIds.forEach((tickerId) => {
          if (this.tickerService.tickerExists(tickerId)) {
            socket.join(tickerId);

            const currentSimulatedPrice =
              this.marketSimulator.getCurrentPrice(tickerId);
            const ticker = this.tickerService.getTickerById(tickerId);

            if (ticker && currentSimulatedPrice !== undefined) {
              const basePrice = ticker.currentPrice;
              const change = currentSimulatedPrice - basePrice;
              const changePercent = (change / basePrice) * 100;

              socket.emit(WsMessageType.PRICE_UPDATE, {
                tickerId: ticker.id,
                price: parseFloat(currentSimulatedPrice.toFixed(2)),
                change: parseFloat(change.toFixed(2)),
                changePercent: parseFloat(changePercent.toFixed(2)),
                timestamp: new Date(),
              });
            }
          }
        });
      });

      // Handle unsubscribe
      socket.on(WsMessageType.UNSUBSCRIBE, (data: { tickerIds: string[] }) => {
        data.tickerIds.forEach((tickerId) => {
          socket.leave(tickerId);
        });
      });

      socket.on(
        WsMessageType.SUBSCRIBE_ALERT,
        (subscription: AlertSubscription) => {
          try {
            this.alertService.addAlert(socket.id, subscription);
          } catch (error) {
            console.error("Alert subscription failed:", error);
            socket.emit("error", { message: "Failed to create alert" });
          }
        },
      );

      // Handle disconnect
      socket.on("disconnect", () => {
        this.alertService.removeAlertsForSocket(socket.id);
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Listen to market simulator and broadcast updates
   */
  private setupMarketDataListener(): void {
    this.marketSimulator.on(
      WsMessageType.PRICE_UPDATE,
      (update: PriceUpdate) => {
        this.tickerService.updateTickerPrice(
          update.tickerId,
          update.price,
          update.change,
          update.changePercent,
        );

        this.io.to(update.tickerId).emit(WsMessageType.PRICE_UPDATE, update);

        const triggeredAlerts = this.alertService.checkAlerts(
          update.tickerId,
          update.price,
        );

        triggeredAlerts.forEach(({ socketId, alert }) => {
          this.io.to(socketId).emit(WsMessageType.ALERT_TRIGGERED, alert);
        });
      },
    );
  }

  /**
   * Get Socket.IO instance (for testing)
   */
  getIO(): SocketIOServer {
    return this.io;
  }
}
