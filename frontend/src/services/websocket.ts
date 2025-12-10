import { type ConnectionStatus } from "types";
import {
  type PriceUpdate,
  type AlertTriggered,
  type AlertSubscription,
  WsMessageType,
} from "@trading-dashboard/shared";
import { io, Socket } from "socket.io-client";

class WebSocketService {
  private socket: Socket | null = null;
  private connectionStatus: ConnectionStatus = "disconnected";
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  private priceUpdateCallback: ((update: PriceUpdate) => void) | null = null;
  private alertCallback: ((alert: AlertTriggered) => void) | null = null;
  private statusCallback: ((status: ConnectionStatus) => void) | null = null;

  private tickerSubscriptions = new Set<string>();
  private alertSubscriptions = new Map<string, AlertSubscription>();

  connect(
    onPriceUpdate: (update: PriceUpdate) => void,
    onStatusChange: (status: ConnectionStatus) => void,
  ): void {
    if (this.socket?.connected) {
      console.log("Already connected to WebSocket");
      return;
    }

    this.priceUpdateCallback = onPriceUpdate;
    this.statusCallback = onStatusChange;

    const wsUrl = process.env.WS_URL || "http://localhost:3001";

    this.socket = io(wsUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.MAX_RECONNECT_ATTEMPTS,
    });

    this.setupEventListeners();
    this.updateStatus("connecting");
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("WebSocket connected:", this.socket?.id);
      this.reconnectAttempts = 0;
      this.updateStatus("connected");
      this.resubscribeAll();
    });

    this.socket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
      this.updateStatus("disconnected");
    });

    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error.message);
      this.reconnectAttempts++;

      const newStatus =
        this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS
          ? "error"
          : "connecting";

      this.updateStatus(newStatus);
    });

    this.socket.on(WsMessageType.PRICE_UPDATE, (data: PriceUpdate) => {
      if (this.priceUpdateCallback) {
        this.priceUpdateCallback({
          ...data,
          timestamp: new Date(data.timestamp),
        });
      }
    });

    this.socket.on(WsMessageType.ALERT_TRIGGERED, (data: AlertTriggered) => {
      if (this.alertCallback) {
        this.alertCallback(data);
      }
      this.alertSubscriptions.delete(data.id);
    });
  }

  private resubscribeAll(): void {
    // Resubscribe to tickers
    if (this.tickerSubscriptions.size > 0) {
      const tickerIds = Array.from(this.tickerSubscriptions);
      console.log("Resubscribing to tickers:", tickerIds);
      this.socket!.emit(WsMessageType.SUBSCRIBE, { tickerIds });
    }

    // Resubscribe to alerts
    if (this.alertSubscriptions.size > 0) {
      console.log("Resubscribing to alerts:", this.alertSubscriptions.size);
      this.alertSubscriptions.forEach((subscription) => {
        this.socket!.emit(WsMessageType.SUBSCRIBE_ALERT, subscription);
      });
    }
  }

  private updateStatus(status: ConnectionStatus): void {
    this.connectionStatus = status;
    this.statusCallback?.(status);
  }

  subscribe(tickerIds: string[]): void {
    if (!this.isConnected()) {
      console.warn("Cannot subscribe: WebSocket not connected");
      return;
    }

    tickerIds.forEach((id) => this.tickerSubscriptions.add(id));
    console.log("Subscribing to tickers:", tickerIds);
    this.socket!.emit(WsMessageType.SUBSCRIBE, { tickerIds });
  }

  unsubscribe(tickerIds: string[]): void {
    if (!this.isConnected()) {
      console.warn("Cannot unsubscribe: WebSocket not connected");
      return;
    }

    tickerIds.forEach((id) => this.tickerSubscriptions.delete(id));
    console.log("Unsubscribing from tickers:", tickerIds);
    this.socket!.emit(WsMessageType.UNSUBSCRIBE, { tickerIds });
  }

  subscribeAlert(subscription: AlertSubscription): void {
    if (!this.isConnected()) {
      console.error("Cannot subscribe to alert: WebSocket not connected");
      return;
    }

    this.alertSubscriptions.set(subscription.id, subscription);
    console.log("Subscribing to alert:", subscription);
    this.socket!.emit(WsMessageType.SUBSCRIBE_ALERT, subscription);
  }

  unsubscribeAlert(alertId: string): void {
    if (!this.isConnected()) {
      console.warn("Cannot unsubscribe from alert: WebSocket not connected");
      return;
    }

    this.alertSubscriptions.delete(alertId);
    console.log("Unsubscribing from alert:", alertId);
    this.socket!.emit(WsMessageType.UNSUBSCRIBE_ALERT, { alertId });
  }

  onAlertTriggered(callback: (alert: AlertTriggered) => void): void {
    this.alertCallback = callback;
  }

  disconnect(): void {
    if (this.socket) {
      console.log("Disconnecting WebSocket...");
      this.socket.disconnect();
      this.socket = null;
      this.updateStatus("disconnected");
      this.priceUpdateCallback = null;
      this.alertCallback = null;
      this.statusCallback = null;
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
