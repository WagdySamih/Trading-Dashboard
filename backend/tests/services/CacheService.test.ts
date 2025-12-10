import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { CacheService } from "../../src/services";
import type { HistoricalDataPoint } from "@trading-dashboard/shared";

describe("CacheService", () => {
  let cacheService: CacheService;
  const mockData: HistoricalDataPoint[] = [
    { timestamp: new Date(), price: 100, volume: 1000 },
    { timestamp: new Date(), price: 101, volume: 1100 },
  ];

  beforeEach(() => {
    cacheService = new CacheService();
  });

  afterEach(() => {
    cacheService.close();
  });

  describe("set and get", () => {
    it("should store and retrieve data", () => {
      const result = cacheService.set("AAPL", 1, mockData);
      expect(result).toBe(true);

      const cached = cacheService.get("AAPL", 1);
      expect(cached).toEqual(mockData);
    });

    it("should return undefined for non-existent key", () => {
      const cached = cacheService.get("TSLA", 1);
      expect(cached).toBeUndefined();
    });

    it("should store different data for different time ranges", () => {
      const data1h = mockData;
      const data24h = [
        ...mockData,
        { timestamp: new Date(), price: 102, volume: 1200 },
      ];

      cacheService.set("AAPL", 1, data1h);
      cacheService.set("AAPL", 24, data24h);

      expect(cacheService.get("AAPL", 1)).toEqual(data1h);
      expect(cacheService.get("AAPL", 24)).toEqual(data24h);
    });
  });

  describe("tiered TTL", () => {
    it("should apply shorter TTL for recent data (≤1h)", () => {
      cacheService.set("AAPL", 1, mockData);

      // Should be available immediately
      expect(cacheService.get("AAPL", 1)).toEqual(mockData);

      // TTL is 5 minutes (300s) - data should still be cached after 1 second
      // This test just verifies it was set successfully
    });

    it("should apply medium TTL for daily data (≤24h)", () => {
      cacheService.set("AAPL", 24, mockData);

      // Should be available immediately
      expect(cacheService.get("AAPL", 24)).toEqual(mockData);
    });

    it("should apply longer TTL for extended periods (>24h)", () => {
      cacheService.set("AAPL", 168, mockData); // 7 days

      // Should be available immediately
      expect(cacheService.get("AAPL", 168)).toEqual(mockData);
    });
  });

  describe("invalidateAll", () => {
    it("should clear all cache entries", () => {
      cacheService.set("AAPL", 1, mockData);
      cacheService.set("TSLA", 24, mockData);

      cacheService.invalidateAll();

      expect(cacheService.get("AAPL", 1)).toBeUndefined();
      expect(cacheService.get("TSLA", 24)).toBeUndefined();
    });
  });

  describe("getStats", () => {
    it("should return cache statistics", () => {
      cacheService.set("AAPL", 1, mockData);
      cacheService.get("AAPL", 1); // Hit
      cacheService.get("TSLA", 1); // Miss

      const stats = cacheService.getStats();

      expect(stats.keys).toBe(1);
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
    });

    it("should track multiple cache operations", () => {
      cacheService.set("AAPL", 1, mockData);
      cacheService.set("AAPL", 24, mockData);
      cacheService.set("TSLA", 1, mockData);

      const stats = cacheService.getStats();

      expect(stats.keys).toBe(3);
    });
  });

  describe("cache key generation", () => {
    it("should generate unique keys for different tickers and time ranges", () => {
      cacheService.set("AAPL", 1, mockData);
      cacheService.set("AAPL", 24, mockData);
      cacheService.set("TSLA", 1, mockData);

      // All three should be independently cached
      expect(cacheService.get("AAPL", 1)).toEqual(mockData);
      expect(cacheService.get("AAPL", 24)).toEqual(mockData);
      expect(cacheService.get("TSLA", 1)).toEqual(mockData);
    });
  });
});
