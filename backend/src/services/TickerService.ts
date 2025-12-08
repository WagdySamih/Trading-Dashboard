import { Ticker, HistoricalDataPoint } from "@trading-dashboard/shared";
import { INITIAL_TICKERS } from "../models/Ticker";

/**
 * TickerService handles business logic for tickers
 * Separates data access from API layer (clean architecture)
 */
export class TickerService {
  private tickers: Map<string, Ticker> = new Map();
  private basePrices: Map<string, number> = new Map();

  constructor() {
    this.initializeTickers();
  }

  /**
   * Initialize tickers from seed data
   */
  private initializeTickers(): void {
    INITIAL_TICKERS.forEach((ticker) => {
      this.tickers.set(ticker.id, { ...ticker });
      this.basePrices.set(ticker.id, ticker.currentPrice);
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
   * Get base price for a ticker
   */
  getBasePrice(tickerId: string): number | undefined {
    return this.basePrices.get(tickerId);
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
    hours: number = 1,
  ): HistoricalDataPoint[] {
    const ticker = this.tickers.get(tickerId);
    if (!ticker) return [];

    const basePrice = this.basePrices.get(tickerId) || ticker.currentPrice;
    const now = Date.now();
    const startTime = now - hours * 60 * 60 * 1000;
    const intervalMs = this.getIntervalForHours(hours);
    const dataPoints: HistoricalDataPoint[] = [];
    let price = basePrice;

    for (let time = startTime; time <= now; time += intervalMs) {
      price = this.generateNextPrice(price, basePrice);

      dataPoints.push({
        timestamp: new Date(time),
        price: parseFloat(price.toFixed(2)),
        volume: this.generateVolume(new Date(time)),
      });
    }

    return dataPoints;
  }

  private getIntervalForHours(hours: number): number {
    const minutes = hours * 60;

    if (minutes <= 11) return 1000;
    if (hours <= 1) return 20 * 1000;
    if (hours <= 24) return 5 * 60 * 1000;
    return 30 * 60 * 1000;
  }

  private generateNextPrice(currentPrice: number, basePrice: number): number {
    const volatility = 0.002;
    const randomChange = (Math.random() - 0.5) * 2 * volatility;
    const meanReversion = ((basePrice - currentPrice) / basePrice) * 0.05;

    return currentPrice * (1 + randomChange + meanReversion);
  }

  private generateVolume(timestamp: Date): number {
    const hour = timestamp.getHours();
    const isMarketHours = hour >= 9 && hour <= 16;
    const baseVolume = 500000;
    const multiplier = isMarketHours ? 1.5 : 0.7;

    return Math.floor((Math.random() * baseVolume + baseVolume) * multiplier);
  }
  /**
   * Check if ticker exists
   */
  tickerExists(id: string): boolean {
    return this.tickers.has(id);
  }
}
