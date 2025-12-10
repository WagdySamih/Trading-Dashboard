"use client";

import {
  StatusIndicator,
  TickerList,
  Loader,
  SearchInput,
  PriceChartPanel,
  Header,
  IconButton,
  Modal,
  RadioButtonGroup,
  Button,
} from "components/common";
import { useCreateAlert, useMarketData } from "./hooks";
import styles from "./Dashboard.module.scss";
import { Menu, XMark } from "components/icons";

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
    reconnect,
    onChangeTimeWindow,
    onSearch,
    searchQuery,
    filteredTickers,
    onToggleSidebar,
    isSidebarOpen,
  } = useMarketData();

  const {
    isModalOpen,
    alertType,
    alertPrice,
    setIsModalOpen,
    setAlertPrice,
    setAlertType,
    onNotify,
    onConfirmCreateAlert,
  } = useCreateAlert();

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
      <Header />
      <main className={styles.main}>
        <aside
          className={`${styles.section} ${styles.sidebar} ${isSidebarOpen ? styles.open : ""}`}
        >
          <div className={styles.searchHeader}>
            <IconButton
              icon={isSidebarOpen ? <XMark /> : <Menu />}
              onClick={() => onToggleSidebar()}
              className={styles.menuButton}
            />
            <SearchInput onSearch={onSearch} value={searchQuery} />
          </div>
          <TickerList
            tickers={filteredTickers}
            selectedTickerId={selectedTickerId}
            onSelectTicker={selectTicker}
            onNotify={onNotify}
          />
        </aside>
        <section className={styles.section}>
          <PriceChartPanel
            selectedTicker={selectedTicker}
            historicalData={historicalData}
            timeWindow={currentTimeWindow}
            onChangeTimeWindow={onChangeTimeWindow}
            onToggleSidebar={onToggleSidebar}
            isSidebarOpen={isSidebarOpen}
          />

          <StatusIndicator status={connectionStatus} onReconnect={reconnect} />
        </section>
      </main>
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className={styles.modal}
      >
        <h2>Price Alert</h2>
        <RadioButtonGroup
          options={[
            { value: "lower", label: "Lower Than" },
            { value: "higher", label: "Higher Than" },
          ]}
          value={alertType}
          onChange={(o) => setAlertType(o)}
        />

        <div className={styles.inputWrapper}>
          <span className={styles.currency}>$</span>
          <input
            type="number"
            value={alertPrice}
            onChange={(e) => setAlertPrice(e.target.value)}
          />
        </div>
        <div className={styles.controls}>
          <Button
            text="Cancel"
            variant="text"
            onClick={() => setIsModalOpen(false)}
          />
          <Button
            text="Confirm"
            variant="primary"
            onClick={onConfirmCreateAlert}
          />
        </div>
      </Modal>
    </div>
  );
}
