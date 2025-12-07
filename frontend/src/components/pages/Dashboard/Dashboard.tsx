"use client";

import {
  Logo,
  StatusIndicator,
  TickerList,
  Loader,
  SearchInput,
  PriceChartPanel,
} from "components/common";
import { useMarketData } from "./hooks";
import styles from "./Dashboard.module.scss";

export default function Dashboard() {
  const {
    currentTimeWindow,
    tickers,
    selectedTickerId,
    historicalData,
    connectionStatus,
    isLoading,
    error,
    selectTicker,
    refreshHistoricalData,
    reconnect,
    onChangeTimeWindow,
    onSearch,
    searchQuery,
    filteredTickers,
  } = useMarketData();

  const selectedTicker = selectedTickerId
    ? tickers.get(selectedTickerId) || null
    : null;

  if (isLoading) {
    return <Loader fullScreen message="Loading market data..." />;
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <h2>Error Loading Data</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <main className={styles.main}>
        <aside className={styles.section}>
          <Logo />
          <SearchInput onSearch={onSearch} value={searchQuery} />
          <TickerList
            tickers={filteredTickers}
            selectedTickerId={selectedTickerId}
            onSelectTicker={selectTicker}
          />
        </aside>
        <section className={styles.section}>
          <StatusIndicator status={connectionStatus} onReconnect={reconnect} />
          <PriceChartPanel
            selectedTicker={selectedTicker}
            historicalData={historicalData}
            onRefresh={refreshHistoricalData}
            timeWindow={currentTimeWindow}
            onChangeTimeWindow={onChangeTimeWindow}
          />
        </section>
      </main>
    </div>
  );
}
