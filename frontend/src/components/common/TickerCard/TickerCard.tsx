import React from "react";
import { Ticker } from "@trading-dashboard/shared";
import { TrendingDown, TrendingUp } from "components/icons";
import { formatPercent, formatPrice } from "utils";
import styles from "./TickerCard.module.scss";

type TickerCardProps = {
  ticker: Ticker;
  isSelected?: boolean;
  onClick: () => void;
};

const TickerCard: React.FC<TickerCardProps> = ({
  ticker,
  isSelected = false,
  onClick,
}) => {
  const isPositive = ticker.changePercent >= 0;
  const priceDirection = isPositive ? "up" : "down";

  return (
    <div
      className={`${styles.card} ${isSelected ? styles.selected : ""}`}
      onClick={onClick}
      role={"button"}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className={styles.content}>
        <div className={styles.symbolInfo}>
          <h3 className={styles.symbol}>{ticker.symbol}</h3>
          <p className={styles.name}>{ticker.name}</p>
        </div>

        <div>
          <div className={`${styles.info} ${styles[priceDirection]}`}>
            {isPositive ? <TrendingUp /> : <TrendingDown />}

            <span className={styles.percent}>
              {formatPercent(ticker.changePercent)}
            </span>
          </div>

          <div className={`${styles.change} ${styles[priceDirection]}`}>
            {formatPrice(ticker.change)}
          </div>
        </div>
      </div>

      <div className={styles.price}>{formatPrice(ticker.currentPrice)}</div>
    </div>
  );
};

export default TickerCard;
