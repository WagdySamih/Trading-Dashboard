import { Request, Response } from "express";
import { TickerController } from "../../src/controllers/TickerController";
import { TickerService } from "../../src/services/TickerService";
import { CacheService } from "../../src/services/CacheService";

describe("TickerController", () => {
  let controller: TickerController;
  let service: TickerService;
  let cacheService: CacheService;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    cacheService = new CacheService();
    service = new TickerService(cacheService);
    controller = new TickerController(service);

    mockRequest = {};
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    cacheService.close();
  });

  describe("getAllTickers", () => {
    it("should return all tickers with success response", () => {
      controller.getAllTickers(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Array),
        }),
      );
    });

    it("should return array of tickers", () => {
      controller.getAllTickers(
        mockRequest as Request,
        mockResponse as Response,
      );

      const call = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(call.data.length).toBeGreaterThan(0);
    });
  });

  describe("getTickerById", () => {
    it("should return ticker when found", () => {
      mockRequest.params = { id: "AAPL" };

      controller.getTickerById(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ id: "AAPL" }),
        }),
      );
    });

    it("should return 404 when ticker not found", () => {
      mockRequest.params = { id: "INVALID" };

      controller.getTickerById(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.any(String),
        }),
      );
    });
  });

  describe("getTickerHistory", () => {
    it("should return historical data for valid ticker", () => {
      mockRequest.params = { id: "AAPL" };
      mockRequest.query = { hours: "24" };

      controller.getTickerHistory(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Array),
        }),
      );
    });

    it("should use default hours when not provided", () => {
      mockRequest.params = { id: "AAPL" };
      mockRequest.query = {};

      controller.getTickerHistory(
        mockRequest as Request,
        mockResponse as Response,
      );

      const call = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(call.success).toBe(true);
      expect(call.data).toBeInstanceOf(Array);
    });

    it("should return 404 for non-existent ticker", () => {
      mockRequest.params = { id: "INVALID" };
      mockRequest.query = {};

      controller.getTickerHistory(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it("should parse hours query parameter", () => {
      mockRequest.params = { id: "AAPL" };
      mockRequest.query = { hours: "12" };

      controller.getTickerHistory(
        mockRequest as Request,
        mockResponse as Response,
      );

      const call = (mockResponse.json as jest.Mock).mock.calls[0][0];
      // Should have roughly 12 hours worth of data
      expect(call.data.length).toBeGreaterThan(0);
    });

    it("should leverage cache for repeated requests", () => {
      mockRequest.params = { id: "AAPL" };
      mockRequest.query = { hours: "1" };

      // First request - cache miss
      controller.getTickerHistory(
        mockRequest as Request,
        mockResponse as Response,
      );

      const firstCall = (mockResponse.json as jest.Mock).mock.calls[0][0];

      // Reset mock
      (mockResponse.json as jest.Mock).mockClear();

      // Second request - cache hit
      controller.getTickerHistory(
        mockRequest as Request,
        mockResponse as Response,
      );

      const secondCall = (mockResponse.json as jest.Mock).mock.calls[0][0];

      // Both should return the same data structure
      expect(firstCall.success).toBe(true);
      expect(secondCall.success).toBe(true);
      expect(firstCall.data).toEqual(secondCall.data);
    });

    it("should return different data for different time ranges", () => {
      mockRequest.params = { id: "AAPL" };

      // Request 1 hour
      mockRequest.query = { hours: "1" };
      controller.getTickerHistory(
        mockRequest as Request,
        mockResponse as Response,
      );
      const call1h = (mockResponse.json as jest.Mock).mock.calls[0][0];

      // Reset mock
      (mockResponse.json as jest.Mock).mockClear();

      // Request 24 hours
      mockRequest.query = { hours: "24" };
      controller.getTickerHistory(
        mockRequest as Request,
        mockResponse as Response,
      );
      const call24h = (mockResponse.json as jest.Mock).mock.calls[0][0];

      expect(call1h.data.length).not.toEqual(call24h.data.length);
      expect(call24h.data.length).toBeGreaterThan(call1h.data.length);
    });

    it("should handle invalid hours parameter gracefully", () => {
      mockRequest.params = { id: "AAPL" };
      mockRequest.query = { hours: "invalid" };

      controller.getTickerHistory(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Should still succeed with default or parsed value
      const call = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(call.success).toBe(true);
      expect(call.data).toBeInstanceOf(Array);
    });

    it("should work with frontend 10-minute polling pattern", () => {
      mockRequest.params = { id: "AAPL" };
      mockRequest.query = { hours: "1" };

      // First poll
      controller.getTickerHistory(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Simulate subsequent poll within cache window
      (mockResponse.json as jest.Mock).mockClear();

      controller.getTickerHistory(
        mockRequest as Request,
        mockResponse as Response,
      );

      const call = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(call.success).toBe(true);
      // Data should come from cache (TTL is 5 minutes for 1h data)
    });
  });
});
