import { Request, Response } from "express";
import { TickerService } from "../services/TickerService";
import { ApiResponse } from "@trading-dashboard/shared";

export class TickerController {
  constructor(private tickerService: TickerService) {}

  /**
   * GET /api/tickers
   * Returns list of all available tickers
   */
  getAllTickers = (req: Request, res: Response): void => {
    try {
      const tickers = this.tickerService.getAllTickers();

      const response: ApiResponse<typeof tickers> = {
        success: true,
        data: tickers,
      };

      res.json(response);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * GET /api/tickers/:id
   * Returns specific ticker details
   */
  getTickerById = (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const ticker = this.tickerService.getTickerById(id);

      if (!ticker) {
        const response: ApiResponse<null> = {
          success: false,
          error: `Ticker ${id} not found`,
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof ticker> = {
        success: true,
        data: ticker,
      };

      res.json(response);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * GET /api/tickers/:id/history
   * Returns historical price data
   * Query params: hours (default: 24)
   */
  getTickerHistory = (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const hours = parseInt(req.query.hours as string) || 24;

      if (!this.tickerService.tickerExists(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: `Ticker ${id} not found`,
        };
        res.status(404).json(response);
        return;
      }

      const history = this.tickerService.getHistoricalData(id, hours);

      const response: ApiResponse<typeof history> = {
        success: true,
        data: history,
      };

      res.json(response);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  private handleError(res: Response, error: unknown): void {
    console.error("Controller error:", error);

    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    };

    res.status(500).json(response);
  }
}
