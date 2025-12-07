"use client";

import {
  StatusIndicator,
  TickerList,
  Loader,
  SearchInput,
  PriceChartPanel,
  Header,
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
    onToggleSidebar,
    isSidebarOpen,
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
    <div>
      <Header />
      <main className={styles.main}>
        <aside
          className={`${styles.section} ${styles.sidebar} ${isSidebarOpen ? styles.open : ""}`}
        >
          <SearchInput onSearch={onSearch} value={searchQuery} />
          <TickerList
            tickers={filteredTickers}
            selectedTickerId={selectedTickerId}
            onSelectTicker={selectTicker}
          />
        </aside>
        <section className={styles.section}>
          <PriceChartPanel
            selectedTicker={selectedTicker}
            historicalData={historicalData}
            onRefresh={refreshHistoricalData}
            timeWindow={currentTimeWindow}
            onChangeTimeWindow={onChangeTimeWindow}
            onToggleSidebar={onToggleSidebar}
            isSidebarOpen={isSidebarOpen}
          />
          <StatusIndicator status={connectionStatus} onReconnect={reconnect} />
        </section>
      </main>
    </div>
  );
}
