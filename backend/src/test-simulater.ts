import { MarketDataSimulator } from "./services/MarketDataSimulator.js";

const simulator = new MarketDataSimulator();

simulator.on("priceUpdate", (update) => {
  console.log(
    `${update.tickerId}: $${update.price} (${
      update.changePercent > 0 ? "+" : ""
    }${update.changePercent}%)`,
  );
});

simulator.start();

setTimeout(() => {
  simulator.stop();
  process.exit(0);
}, 10000);
