import { type Ticker } from "@trading-dashboard/shared";
import { TickerCard } from "..";
import styles from "./TickerList.module.scss";

type Props = {
  tickers: Ticker[];
  selectedTickerId: string | null;
  onSelectTicker: (tickerId: string) => void;
  onNotify: (tickerId: string) => void;
};

const TickerList: React.FC<Props> = ({
  tickers,
  selectedTickerId,
  onSelectTicker,
  onNotify,
}) => {
  if (tickers.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No tickers available</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {tickers.map((ticker) => (
        <TickerCard
          key={ticker.id}
          ticker={ticker}
          isSelected={ticker.id === selectedTickerId}
          onClick={() => onSelectTicker(ticker.id)}
          onNotify={() => onNotify(ticker.id)}
        />
      ))}
    </div>
  );
};

export default TickerList;
