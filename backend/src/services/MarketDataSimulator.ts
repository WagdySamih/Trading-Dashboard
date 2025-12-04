import { EventEmitter } from "events";
import { INITIAL_TICKERS } from "../models/Ticker";
import { PriceUpdate } from "@trading-dashboard/shared";

/**
 * MarketDataSimulator generates realistic price movements
 *
 * Learning concepts:
 * - EventEmitter pattern (publish-subscribe)
 * - Random walk algorithm (finance concept)
 * - Volatility simulation
 */
export class MarketDataSimulator extends EventEmitter {
  private isRunning = false;
  private intervalId?: NodeJS.Timeout;
  private currentPrices: Map<string, number> = new Map();
  private basePrices: Map<string, number> = new Map();

  private readonly UPDATE_INTERVAL = 1000; // 1 second
  private readonly VOLATILITY = 0.002; // 0.2% max change per update

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

  /**
   * Generate next price using random walk
   *
   * Random Walk: price moves up or down by small random amount
   * Formula: newPrice = currentPrice * (1 + randomChange)
   */
  private generatePriceUpdate(tickerId: string): PriceUpdate | null {
    const currentPrice = this.currentPrices.get(tickerId);
    const basePrice = this.basePrices.get(tickerId);

    if (!currentPrice || !basePrice) return null;

    // Random change between -VOLATILITY and +VOLATILITY
    const randomChange = (Math.random() - 0.5) * 2 * this.VOLATILITY;
    const newPrice = currentPrice * (1 + randomChange);

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
    console.log("📈 Market data simulator started");

    this.intervalId = setInterval(() => {
      INITIAL_TICKERS.forEach((ticker) => {
        const update = this.generatePriceUpdate(ticker.id);
        if (update) {
          this.emit("priceUpdate", update);
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
    console.log("📉 Market data simulator stopped");
  }

  getCurrentPrice(tickerId: string): number | undefined {
    return this.currentPrices.get(tickerId);
  }

  reset(): void {
    this.currentPrices = new Map(this.basePrices);
  }
}
