import { TickerService } from "./../../src/services/TickerService";

describe("TickerService", () => {
  let service: TickerService;

  beforeEach(() => {
    service = new TickerService();
  });

  describe("getAllTickers", () => {
    it("should return all tickers", () => {
      const tickers = service.getAllTickers();

      expect(tickers).toBeInstanceOf(Array);
      expect(tickers.length).toBeGreaterThan(0);
    });

    it("should return tickers with correct structure", () => {
      const tickers = service.getAllTickers();
      const ticker = tickers[0];

      expect(ticker).toHaveProperty("id");
      expect(ticker).toHaveProperty("symbol");
      expect(ticker).toHaveProperty("name");
      expect(ticker).toHaveProperty("currentPrice");
      expect(ticker).toHaveProperty("change");
      expect(ticker).toHaveProperty("changePercent");
      expect(ticker).toHaveProperty("volume");
      expect(ticker).toHaveProperty("lastUpdate");
    });

    it("should include expected tickers", () => {
      const tickers = service.getAllTickers();
      const tickerIds = tickers.map((t) => t.id);

      expect(tickerIds).toContain("AAPL");
      expect(tickerIds).toContain("TSLA");
      expect(tickerIds).toContain("BTCUSD");
    });
  });

  describe("getTickerById", () => {
    it("should return ticker when it exists", () => {
      const ticker = service.getTickerById("AAPL");

      expect(ticker).toBeDefined();
      expect(ticker?.id).toBe("AAPL");
      expect(ticker?.symbol).toBe("AAPL");
    });

    it("should return undefined for non-existent ticker", () => {
      const ticker = service.getTickerById("INVALID");

      expect(ticker).toBeUndefined();
    });
  });

  describe("updateTickerPrice", () => {
    it("should update ticker price and metadata", () => {
      const newPrice = 200.5;
      const change = 5.25;
      const changePercent = 2.69;

      service.updateTickerPrice("AAPL", newPrice, change, changePercent);

      const ticker = service.getTickerById("AAPL");

      expect(ticker?.currentPrice).toBe(newPrice);
      expect(ticker?.change).toBe(change);
      expect(ticker?.changePercent).toBe(changePercent);
    });

    it("should update lastUpdate timestamp", () => {
      const beforeUpdate = new Date();

      service.updateTickerPrice("AAPL", 200, 5, 2.5);

      const ticker = service.getTickerById("AAPL");
      const afterUpdate = ticker?.lastUpdate;

      expect(afterUpdate).toBeInstanceOf(Date);
      expect(afterUpdate!.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
    });

    it("should handle non-existent ticker gracefully", () => {
      // Should not throw
      expect(() => {
        service.updateTickerPrice("INVALID", 100, 0, 0);
      }).not.toThrow();
    });
  });

  describe("getHistoricalData", () => {
    it("should return array of historical data points", () => {
      const history = service.getHistoricalData("AAPL", 24);

      expect(history).toBeInstanceOf(Array);
      expect(history.length).toBeGreaterThan(0);
    });

    it("should return data points with correct structure", () => {
      const history = service.getHistoricalData("AAPL", 1);
      const dataPoint = history[0];

      expect(dataPoint).toHaveProperty("timestamp");
      expect(dataPoint).toHaveProperty("price");
      expect(dataPoint).toHaveProperty("volume");

      expect(dataPoint.timestamp).toBeInstanceOf(Date);
      expect(typeof dataPoint.price).toBe("number");
    });

    it("should respect hours parameter", () => {
      const hours = 2;
      const history = service.getHistoricalData("AAPL", hours);

      // Should have roughly (hours * 60) / 5 data points (every 5 min)
      const expectedPoints = (hours * 60) / 5 + 1;
      expect(history.length).toBeCloseTo(expectedPoints, -1); // Within 10
    });

    it("should return empty array for non-existent ticker", () => {
      const history = service.getHistoricalData("INVALID", 24);

      expect(history).toEqual([]);
    });

    it("should generate timestamps in chronological order", () => {
      const history = service.getHistoricalData("AAPL", 1);

      for (let i = 1; i < history.length; i++) {
        const prev = history[i - 1].timestamp.getTime();
        const curr = history[i].timestamp.getTime();
        expect(curr).toBeGreaterThanOrEqual(prev);
      }
    });
  });

  describe("tickerExists", () => {
    it("should return true for existing tickers", () => {
      expect(service.tickerExists("AAPL")).toBe(true);
      expect(service.tickerExists("TSLA")).toBe(true);
    });

    it("should return false for non-existent tickers", () => {
      expect(service.tickerExists("INVALID")).toBe(false);
      expect(service.tickerExists("")).toBe(false);
    });
  });
});
