import React from "react";
import { Ticker, HistoricalDataPoint } from "@trading-dashboard/shared";
import { PriceChart, OptionGroup } from "..";
import styles from "./PriceChartPanel.module.scss";
import { formatLargeNumber, formatPrice } from "utils";
import { IconButton } from "../IconButton";
import { Menu, XMark } from "components/icons";

type PriceChartPanelProps = {
  selectedTicker: Ticker | null;
  historicalData: HistoricalDataPoint[];
  timeWindow: number;
  onChangeTimeWindow: (hours: number) => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
};

export const PriceChartPanel: React.FC<PriceChartPanelProps> = ({
  selectedTicker,
  historicalData,
  timeWindow,
  onChangeTimeWindow,
  onToggleSidebar,
  isSidebarOpen,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <IconButton
            icon={isSidebarOpen ? <XMark /> : <Menu />}
            onClick={() => onToggleSidebar()}
            className={styles.menuButton}
          />
          <div>
            <h2 className={styles.title}>{selectedTicker?.symbol}</h2>
            <p className={styles.subTitle}>{selectedTicker?.name}</p>
          </div>
        </div>

        <div className={styles.controls}>
          <OptionGroup
            options={[
              { label: "10M", value: 0.167 },
              { label: "1H", value: 1 },
              { label: "12H", value: 12 },
              { label: "1D", value: 24 },
              { label: "7D", value: 168 },
            ]}
            value={timeWindow}
            onChoose={(timeWindow) => onChangeTimeWindow(timeWindow || 1)}
          />
        </div>
      </div>
      {selectedTicker && (
        <div className={styles.stats}>
          <div>
            <div className={styles.label}>Current Price</div>
            <div className={styles.value}>
              <div className={styles.price}>
                ${selectedTicker.currentPrice.toFixed(2)}
              </div>
              <div
                className={`${styles.change} ${
                  selectedTicker.changePercent >= 0
                    ? styles.positive
                    : styles.negative
                }`}
              >
                {selectedTicker.changePercent >= 0 ? "+" : ""}
                {selectedTicker.changePercent.toFixed(2)}%
              </div>
            </div>
          </div>
          <div>
            <div className={styles.label}>Day High</div>
            <div className={`${styles.value} ${styles.up}`}>
              {formatPrice(selectedTicker?.dayHigh)}
            </div>
          </div>
          <div>
            <div className={styles.label}>Day Low</div>
            <div className={`${styles.value} ${styles.down}`}>
              {formatPrice(selectedTicker?.dayLow)}
            </div>
          </div>
          <div>
            <div className={styles.label}>Volume</div>
            <div className={styles.value}>
              {formatLargeNumber(selectedTicker?.volume, 0, true)}
            </div>
          </div>
          <div>
            <div className={styles.label}>Previous Close</div>
            <div className={styles.value}>
              {formatPrice(selectedTicker?.previousClose)}
            </div>
          </div>
        </div>
      )}
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
