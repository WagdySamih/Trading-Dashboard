import { TickerService } from "./../../src/services/TickerService";
import { CacheService } from "./../../src/services/CacheService";

describe("TickerService", () => {
  let service: TickerService;
  let cacheService: CacheService;

  beforeEach(() => {
    cacheService = new CacheService();
    service = new TickerService(cacheService);
  });

  afterEach(() => {
    cacheService.close();
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

    it("should use cache on subsequent calls", () => {
      // First call - cache miss
      const history1 = service.getHistoricalData("AAPL", 1);

      // Second call - cache hit (should return same data)
      const history2 = service.getHistoricalData("AAPL", 1);

      expect(history1).toEqual(history2);
    });

    it("should generate different data for different time ranges", () => {
      const history1h = service.getHistoricalData("AAPL", 1);
      const history24h = service.getHistoricalData("AAPL", 24);

      expect(history1h.length).not.toEqual(history24h.length);
      expect(history24h.length).toBeGreaterThan(history1h.length);
    });

    it("should not cache empty results for invalid tickers", () => {
      const history = service.getHistoricalData("INVALID", 1);

      expect(history).toEqual([]);

      // Verify cache stats show no additional keys were added
      const statsBefore = service.getCacheStats();
      service.getHistoricalData("INVALID", 1);
      const statsAfter = service.getCacheStats();

      expect(statsAfter.keys).toEqual(statsBefore.keys);
    });

    it("should cache data for different time ranges independently", () => {
      service.getHistoricalData("AAPL", 1);
      service.getHistoricalData("AAPL", 24);
      service.getHistoricalData("AAPL", 168);

      const stats = service.getCacheStats();
      expect(stats.keys).toBe(3); // Three different cache entries
    });
  });

  describe("getCacheStats", () => {
    it("should return cache statistics", () => {
      const stats = service.getCacheStats();

      expect(stats).toHaveProperty("keys");
      expect(stats).toHaveProperty("hits");
      expect(stats).toHaveProperty("misses");
      expect(typeof stats.keys).toBe("number");
      expect(typeof stats.hits).toBe("number");
      expect(typeof stats.misses).toBe("number");
    });

    it("should track cache hits and misses", () => {
      const statsBefore = service.getCacheStats();

      // Cache miss
      service.getHistoricalData("AAPL", 1);

      const statsAfterMiss = service.getCacheStats();
      expect(statsAfterMiss.misses).toBe(statsBefore.misses + 1);

      // Cache hit
      service.getHistoricalData("AAPL", 1);

      const statsAfterHit = service.getCacheStats();
      expect(statsAfterHit.hits).toBe(statsAfterMiss.hits + 1);
    });

    it("should track number of cached keys", () => {
      const statsBefore = service.getCacheStats();
      expect(statsBefore.keys).toBe(0);

      service.getHistoricalData("AAPL", 1);
      service.getHistoricalData("AAPL", 24);
      service.getHistoricalData("TSLA", 1);

      const statsAfter = service.getCacheStats();
      expect(statsAfter.keys).toBe(3);
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

  describe("cache behavior with frontend polling pattern", () => {
    it("should serve from cache within 10-minute window", () => {
      // Simulate frontend polling every 10 minutes
      const history1 = service.getHistoricalData("AAPL", 1);

      const stats1 = service.getCacheStats();
      expect(stats1.misses).toBe(1);
      expect(stats1.hits).toBe(0);

      // Second request within 5 minutes (cache TTL for 1h data)
      const history2 = service.getHistoricalData("AAPL", 1);

      const stats2 = service.getCacheStats();
      expect(stats2.hits).toBe(1); // Should be a cache hit
      expect(history1).toEqual(history2);
    });

    it("should use appropriate TTL for different time ranges", () => {
      // Recent data (1h) - 5 minute TTL
      service.getHistoricalData("AAPL", 1);

      // Daily data (24h) - 8 minute TTL
      service.getHistoricalData("AAPL", 24);

      // Weekly data (168h) - 10 minute TTL
      service.getHistoricalData("AAPL", 168);

      const stats = service.getCacheStats();
      expect(stats.keys).toBe(3); // All cached independently
    });
  });
});
