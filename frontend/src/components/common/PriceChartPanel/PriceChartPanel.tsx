import React from "react";
import { Ticker, HistoricalDataPoint } from "@trading-dashboard/shared";
import { PriceChart, OptionGroup } from "..";
import styles from "./PriceChartPanel.module.scss";

type PriceChartPanelProps = {
  selectedTicker: Ticker | null;
  historicalData: HistoricalDataPoint[];
  onRefresh: () => void;
  timeWindow: number;
  onChangeTimeWindow: (hours: number) => void;
};

export const PriceChartPanel: React.FC<PriceChartPanelProps> = ({
  selectedTicker,
  historicalData,
  onRefresh,
  timeWindow,
  onChangeTimeWindow,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2 className={styles.title}>
            Price Chart: {selectedTicker?.symbol}
          </h2>
          {selectedTicker && (
            <div className={styles.currentPrice}>
              <span className={styles.label}>Current:</span>
              <span className={styles.price}>
                ${selectedTicker.currentPrice.toFixed(2)}
              </span>
              <span
                className={`${styles.change} ${
                  selectedTicker.changePercent >= 0
                    ? styles.positive
                    : styles.negative
                }`}
              >
                {selectedTicker.changePercent >= 0 ? "+" : ""}
                {selectedTicker.changePercent.toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        <div className={styles.controls}>
          <OptionGroup
            options={[
              { label: "10M", value: 0.167 },
              { label: "1H", value: 1 },
              { label: "6H", value: 6 },
              { label: "12H", value: 12 },
              { label: "1D", value: 24 },
              { label: "7D", value: 168 },
            ]}
            value={timeWindow}
            onChoose={(timeWindow) => onChangeTimeWindow(timeWindow || 1)}
          />

          <button className={styles.refreshBtn} onClick={() => onRefresh()}>
            ↻ Refresh
          </button>
        </div>
      </div>

      <PriceChart
        data={historicalData}
        tickerSymbol={selectedTicker?.symbol}
        isLoading={historicalData.length === 0 && selectedTicker !== null}
        timeWindow={timeWindow}
      />
    </div>
  );
};
export default PriceChartPanel;
