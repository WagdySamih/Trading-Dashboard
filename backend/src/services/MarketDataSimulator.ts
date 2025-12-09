import { EventEmitter } from "events";
import { INITIAL_TICKERS } from "../models/Ticker.js";
import { type PriceUpdate, WsMessageType } from "@trading-dashboard/shared";

export class MarketDataSimulator extends EventEmitter {
  private isRunning = false;
  private intervalId?: NodeJS.Timeout;
  private currentPrices: Map<string, number> = new Map();
  private basePrices: Map<string, number> = new Map();

  private readonly UPDATE_INTERVAL = 1000;
  private readonly VOLATILITY = 0.002;
  private readonly MEAN_REVERSION = 0.05;

  constructor() {
    super();
    this.initializePrices();
  }

  private initializePrices(): void {
    INITIAL_TICKERS.forEach((ticker) => {
      this.basePrices.set(ticker.id, ticker.currentPrice);
      this.currentPrices.set(ticker.id, ticker.currentPrice);
    });
  }

  private generatePriceUpdate(tickerId: string): PriceUpdate | null {
    const currentPrice = this.currentPrices.get(tickerId);
    const basePrice = this.basePrices.get(tickerId);

    if (!currentPrice || !basePrice) return null;

    const randomChange = (Math.random() - 0.5) * 2;
    const deviation = (currentPrice - basePrice) / basePrice;
    const meanReversionChange = -deviation * this.MEAN_REVERSION;

    const totalChange =
      (randomChange * 0.8 + meanReversionChange * 0.2) * this.VOLATILITY;
    const newPrice = currentPrice * (1 + totalChange);

    const change = newPrice - basePrice;
    const changePercent = (change / basePrice) * 100;

    this.currentPrices.set(tickerId, newPrice);

    return {
      tickerId,
      price: parseFloat(newPrice.toFixed(2)),
      timestamp: new Date(),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
    };
  }

  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;

    this.intervalId = setInterval(() => {
      INITIAL_TICKERS.forEach((ticker) => {
        const update = this.generatePriceUpdate(ticker.id);
        if (update) {
          this.emit(WsMessageType.PRICE_UPDATE, update);
        }
      });
    }, this.UPDATE_INTERVAL);
  }

  stop(): void {
    if (!this.isRunning) return;

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.isRunning = false;
  }

  getCurrentPrice(tickerId: string): number | undefined {
    return this.currentPrices.get(tickerId);
  }

  reset(): void {
    this.currentPrices = new Map(this.basePrices);
  }
}
