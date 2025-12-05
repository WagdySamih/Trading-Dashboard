import { Request, Response } from "express";
import { TickerController } from "../../src/controllers/TickerController";
import { TickerService } from "../../src/services/TickerService";

describe("TickerController", () => {
  let controller: TickerController;
  let service: TickerService;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    service = new TickerService();
    controller = new TickerController(service);

    mockRequest = {};
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
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
  });
});
