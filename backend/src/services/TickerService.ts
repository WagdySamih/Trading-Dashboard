import { Ticker, HistoricalDataPoint } from "@trading-dashboard/shared";
import { INITIAL_TICKERS } from "../models/Ticker";

/**
 * TickerService handles business logic for tickers
 * Separates data access from API layer (clean architecture)
 */
export class TickerService {
  private tickers: Map<string, Ticker> = new Map();

  constructor() {
    this.initializeTickers();
  }

  /**
   * Initialize tickers from seed data
   */
  private initializeTickers(): void {
    INITIAL_TICKERS.forEach((ticker) => {
      this.tickers.set(ticker.id, { ...ticker });
    });
  }

  /**
   * Get all available tickers
   */
  getAllTickers(): Ticker[] {
    return Array.from(this.tickers.values());
  }

  /**
   * Get a specific ticker by ID
   */
  getTickerById(id: string): Ticker | undefined {
    return this.tickers.get(id);
  }

  /**
   * Update ticker price (called by market data simulator)
   */
  updateTickerPrice(
    tickerId: string,
    price: number,
    change: number,
    changePercent: number,
  ): void {
    const ticker = this.tickers.get(tickerId);
    if (ticker) {
      ticker.currentPrice = price;
      ticker.change = change;
      ticker.changePercent = changePercent;
      ticker.lastUpdate = new Date();
    }
  }

  /**
   * Generate mock historical data for a ticker
   * In real app, this would query a database
   */
  getHistoricalData(
    tickerId: string,
    hours: number = 24,
  ): HistoricalDataPoint[] {
    const ticker = this.tickers.get(tickerId);
    if (!ticker) return [];

    const dataPoints: HistoricalDataPoint[] = [];
    const now = new Date();
    const basePrice = ticker.currentPrice;

    // Generate data points going backwards in time
    for (let i = hours * 60; i >= 0; i -= 5) {
      // Every 5 minutes
      const timestamp = new Date(now.getTime() - i * 60 * 1000);

      // Random walk for historical prices
      const randomFactor = 1 + (Math.random() - 0.5) * 0.02; // ±1%
      const price = basePrice * randomFactor;

      dataPoints.push({
        timestamp,
        price: parseFloat(price.toFixed(2)),
        volume: Math.floor(Math.random() * 1000000) + 500000,
      });
    }

    return dataPoints;
  }

  /**
   * Check if ticker exists
   */
  tickerExists(id: string): boolean {
    return this.tickers.has(id);
  }
}
