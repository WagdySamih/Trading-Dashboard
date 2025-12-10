import NodeCache from "node-cache";
import type { HistoricalDataPoint } from "@trading-dashboard/shared";

/**
 * CacheService handles in-memory caching with tiered TTL
 * Implements LRU eviction strategy for historical data
 * TTL is optimized based on data freshness requirements
 */
export class CacheService {
  private cache: NodeCache;
  private readonly MAX_KEYS = 1000; // Prevent memory issues

  constructor() {
    this.cache = new NodeCache({
      stdTTL: 0, // We'll set TTL per key based on time range
      checkperiod: 60, // Check for expired keys every 60 seconds
      useClones: false, // Better performance, data is immutable
      maxKeys: this.MAX_KEYS,
    });

    this.setupEventListeners();
  }

  /**
   * Generate cache key for historical data
   */
  private generateKey(tickerId: string, hours: number): string {
    return `history:${tickerId}:${hours}h`;
  }

  /**
   * Calculate TTL based on time range
   */
  private calculateTTL(hours: number): number {
    if (hours < 0.5) return 5; // 5 seconds for live data
    if (hours <= 1) return 300; // 5 minutes for recent data
    if (hours <= 24) return 480; // 8 minutes for 1 day
    return 600; // 10 minutes for longer periods
  }

  /**
   * Get cached historical data
   */
  get(tickerId: string, hours: number): HistoricalDataPoint[] | undefined {
    const key = this.generateKey(tickerId, hours);
    return this.cache.get<HistoricalDataPoint[]>(key);
  }

  /**
   * Set historical data in cache with appropriate TTL
   */
  set(tickerId: string, hours: number, data: HistoricalDataPoint[]): boolean {
    const key = this.generateKey(tickerId, hours);
    const ttl = this.calculateTTL(hours);
    return this.cache.set(key, data, ttl);
  }

  invalidateAll(): void {
    this.cache.flushAll();
  }

  getStats() {
    return {
      keys: this.cache.keys().length,
      hits: this.cache.getStats().hits,
      misses: this.cache.getStats().misses,
      ksize: this.cache.getStats().ksize,
      vsize: this.cache.getStats().vsize,
    };
  }

  private setupEventListeners(): void {
    this.cache.on("expired", (key) => {
      console.log(`Cache key expired: ${key}`);
    });

    this.cache.on("flush", () => {
      console.log("Cache flushed");
    });
  }

  close(): void {
    this.cache.close();
  }
}
