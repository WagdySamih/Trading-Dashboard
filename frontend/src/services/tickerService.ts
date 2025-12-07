import {
  Ticker,
  HistoricalDataPoint,
  ApiResponse,
} from "@trading-dashboard/shared";
import { httpClient } from "utils";

class TickerService {
  private readonly TICKERS_API_URL = "api/tickers";

  async getTickers(): Promise<Ticker[]> {
    const response = await httpClient.get<ApiResponse<Ticker[]>>(
      this.TICKERS_API_URL,
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || "Failed to fetch tickers");
    }

    return response.data.data.map((ticker) => ({
      ...ticker,
      lastUpdate: new Date(ticker.lastUpdate),
    }));
  }

  async getTickerById(id: string): Promise<Ticker> {
    const response = await httpClient.get<ApiResponse<Ticker>>(
      `${this.TICKERS_API_URL}/${id}`,
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || "Ticker not found");
    }

    return {
      ...response.data.data,
      lastUpdate: new Date(response.data.data.lastUpdate),
    };
  }

  async getHistoricalData(
    tickerId: string,
    hours: number = 24,
  ): Promise<HistoricalDataPoint[]> {
    const response = await httpClient.get<ApiResponse<HistoricalDataPoint[]>>(
      `${this.TICKERS_API_URL}/${tickerId}/history`,
      { params: { hours } },
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || "Failed to fetch historical data");
    }

    // Convert timestamp strings to Date objects
    return response.data.data.map((point) => ({
      ...point,
      timestamp: new Date(point.timestamp),
    }));
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await httpClient.get("/health");
      return response.data.status === "ok";
    } catch {
      return false;
    }
  }
}

export const tickerService = new TickerService();
