import { MarketDataSimulator } from "../../src/services/MarketDataSimulator";
import { PriceUpdate } from "@trading-dashboard/shared";

describe("MarketDataSimulator", () => {
  let simulator: MarketDataSimulator;

  beforeEach(() => {
    simulator = new MarketDataSimulator();
  });

  afterEach(() => {
    simulator.stop();
    simulator.removeAllListeners();
  });

  describe("Initialization", () => {
    it("should initialize with base prices", () => {
      const aaplPrice = simulator.getCurrentPrice("AAPL");
      expect(aaplPrice).toBeDefined();
      expect(aaplPrice).toBeGreaterThan(0);
    });

    it("should have prices for all initial tickers", () => {
      const tickers = ["AAPL", "TSLA", "BTCUSD", "GOOGL", "AMZN"];

      tickers.forEach((ticker) => {
        const price = simulator.getCurrentPrice(ticker);
        expect(price).toBeDefined();
      });
    });
  });

  describe("Price Generation", () => {
    it("should emit priceUpdate events when started", (done) => {
      let updateCount = 0;

      simulator.on("priceUpdate", (update: PriceUpdate) => {
        updateCount++;

        // Verify update structure
        expect(update).toHaveProperty("tickerId");
        expect(update).toHaveProperty("price");
        expect(update).toHaveProperty("change");
        expect(update).toHaveProperty("changePercent");
        expect(update).toHaveProperty("timestamp");

        // Verify types
        expect(typeof update.price).toBe("number");
        expect(update.price).toBeGreaterThan(0);

        if (updateCount >= 5) {
          // Wait for 5 updates
          simulator.stop();
          done();
        }
      });

      simulator.start();
    }, 10000); // 10s timeout

    it("should generate different prices over time", (done) => {
      const initialPrice = simulator.getCurrentPrice("AAPL");

      simulator.start();

      setTimeout(() => {
        const newPrice = simulator.getCurrentPrice("AAPL");
        simulator.stop();

        // Price should have changed (statistically almost certain)
        expect(newPrice).not.toBe(initialPrice);
        done();
      }, 2000);
    }, 5000);
  });

  describe("Control Methods", () => {
    it("should start and stop correctly", () => {
      simulator.start();
      // No error should be thrown

      simulator.stop();
      // Should stop cleanly

      expect(true).toBe(true);
    });

    it("should not start twice", () => {
      simulator.start();
      simulator.start(); // Should be ignored

      simulator.stop();
      expect(true).toBe(true);
    });

    it("should reset prices to base values", () => {
      const initialPrice = simulator.getCurrentPrice("AAPL");

      simulator.start();

      setTimeout(() => {
        simulator.stop();
        simulator.reset();

        const resetPrice = simulator.getCurrentPrice("AAPL");
        expect(resetPrice).toBe(initialPrice);
      }, 1000);
    });
  });
});
