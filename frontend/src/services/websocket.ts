import { ConnectionStatus } from "types";
import { PriceUpdate, WsMessageType } from "@trading-dashboard/shared";
import { io, Socket } from "socket.io-client";

class WebSocketService {
  private socket: Socket | null = null;
  private connectionStatus: ConnectionStatus = "disconnected";
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  connect(
    onPriceUpdate: (update: PriceUpdate) => void,
    onStatusChange: (status: ConnectionStatus) => void,
  ): void {
    if (this.socket?.connected) {
      console.log("Already connected to WebSocket");
      return;
    }

    const wsUrl = process.env.WS_URL || "http://localhost:3001";

    this.socket = io(wsUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.MAX_RECONNECT_ATTEMPTS,
    });

    // Connection events
    this.socket.on("connect", () => {
      console.log("WebSocket connected:", this.socket?.id);
      this.connectionStatus = "connected";
      this.reconnectAttempts = 0;
      onStatusChange("connected");
    });

    this.socket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
      this.connectionStatus = "disconnected";
      onStatusChange("disconnected");
    });

    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error.message);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
        this.connectionStatus = "error";
        onStatusChange("error");
      } else {
        this.connectionStatus = "connecting";
        onStatusChange("connecting");
      }
    });

    // Price update events
    this.socket.on(WsMessageType.PRICE_UPDATE, (data: PriceUpdate) => {
      console.log("Received price update:", data);
      // Convert timestamp string to Date
      const update: PriceUpdate = {
        ...data,
        timestamp: new Date(data.timestamp),
      };
      onPriceUpdate(update);
    });

    this.connectionStatus = "connecting";
    onStatusChange("connecting");
  }

  /**
   * Subscribe to ticker updates
   */
  subscribe(tickerIds: string[]): void {
    if (!this.socket?.connected) {
      console.warn("Cannot subscribe: WebSocket not connected");
      return;
    }

    console.log("Subscribing to tickers:", tickerIds);
    this.socket.emit(WsMessageType.SUBSCRIBE, { tickerIds });
  }

  /**
   * Unsubscribe from ticker updates
   */
  unsubscribe(tickerIds: string[]): void {
    if (!this.socket?.connected) {
      return;
    }

    console.log("Unsubscribing from tickers:", tickerIds);
    this.socket.emit(WsMessageType.UNSUBSCRIBE, { tickerIds });
  }

  disconnect(): void {
    if (this.socket) {
      console.log("Disconnecting WebSocket...");
      this.socket.disconnect();
      this.socket = null;
      this.connectionStatus = "disconnected";
    }
  }

  getStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const wsService = new WebSocketService();
