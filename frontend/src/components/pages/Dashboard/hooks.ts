import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { type PriceUpdate } from "@trading-dashboard/shared";
import { wsService, tickerService, alertService } from "services";
import { type ConnectionStatus } from "types";
import { type MarketDataState, type UseMarketDataReturn } from "./types";
import { useWindowWidth } from "hooks";
import { useToast } from "context";

const CONFIG = {
  MAX_CHART_POINTS: 2500,
  INITIAL_HISTORY_HOURS: 0.167, // ~10 minutes for live updates
  LIVE_UPDATE_THRESHOLD: 0.167, // Only append live data if window <= 10 minutes
};

export function useMarketData(): UseMarketDataReturn {
  const windowWidth = useWindowWidth();

  const [state, setState] = useState<MarketDataState>({
    tickers: new Map(),
    selectedTickerId: null,
    historicalData: [],
    connectionStatus: "disconnected",
    isLoading: true,
    error: null,
    currentTimeWindow: CONFIG.INITIAL_HISTORY_HOURS,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const isInitialMount = useRef(true);
  const hasSubscribed = useRef(false);

  useEffect(() => {
    setIsSidebarOpen(windowWidth >= 750);
  }, [windowWidth]);

  const handlePriceUpdate = useCallback((update: PriceUpdate) => {
    setState((prev) => {
      const newTickers = new Map(prev.tickers);
      const ticker = newTickers.get(update.tickerId);

      if (!ticker) return prev;

      // Update ticker price
      newTickers.set(update.tickerId, {
        ...ticker,
        currentPrice: update.price,
        change: update.change,
        changePercent: update.changePercent,
        lastUpdate: update.timestamp,
      });

      // Append to chart only if viewing selected ticker with short time window
      const shouldAppendToChart =
        update.tickerId === prev.selectedTickerId &&
        prev.currentTimeWindow <= CONFIG.LIVE_UPDATE_THRESHOLD;

      const newHistoricalData = shouldAppendToChart
        ? [
            ...prev.historicalData,
            {
              timestamp: update.timestamp,
              price: update.price,
              volume: ticker.volume || 0,
            },
          ]
        : prev.historicalData;

      return {
        ...prev,
        tickers: newTickers,
        historicalData: newHistoricalData,
      };
    });
  }, []);

  const handleStatusChange = useCallback((status: ConnectionStatus) => {
    setState((prev) => {
      if (prev.connectionStatus === status) return prev;
      return { ...prev, connectionStatus: status };
    });

    if (status === "connected" && !hasSubscribed.current) {
      setState((prev) => {
        const tickerIds = Array.from(prev.tickers.keys());
        if (tickerIds.length > 0) {
          setTimeout(() => {
            wsService.subscribe(tickerIds);
            hasSubscribed.current = true;
          }, 100);
        }
        return prev;
      });
    }
  }, []);

  const fetchHistoricalData = useCallback(
    async (tickerId: string, hours: number) => {
      try {
        const data = await tickerService.getHistoricalData(tickerId, hours);
        setState((prev) => ({ ...prev, historicalData: data }));
      } catch (error) {
        console.error("Failed to fetch historical data:", error);
        setState((prev) => ({
          ...prev,
          error: "Failed to load historical data",
        }));
      }
    },
    [],
  );

  // Filter tickers based on search query
  const filteredTickers = useMemo(() => {
    const allTickers = Array.from(state.tickers.values());

    // If search is empty, return all tickers
    if (!searchQuery.trim()) {
      return allTickers;
    }

    const query = searchQuery.toLowerCase().trim();

    return allTickers.filter((ticker) => {
      const symbolMatch = ticker.symbol.toLowerCase().includes(query);
      const nameMatch = ticker.name?.toLowerCase().includes(query);
      return symbolMatch || nameMatch;
    });
  }, [state.tickers, searchQuery]);

  const onSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Initialize: Load tickers and connect WebSocket
  useEffect(() => {
    if (!isInitialMount.current) return;
    isInitialMount.current = false;

    const initialize = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const tickers = await tickerService.getTickers();
        const tickerMap = new Map(tickers.map((t) => [t.id, t]));

        setState((prev) => ({
          ...prev,
          tickers: tickerMap,
          selectedTickerId: tickers[0]?.id || null,
          isLoading: false,
        }));

        wsService.connect(handlePriceUpdate, handleStatusChange);
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : "Failed to load data",
        }));
      }
    };

    initialize();

    return () => {
      const tickerIds = Array.from(state.tickers.keys());
      if (tickerIds.length > 0) {
        wsService.unsubscribe(tickerIds);
      }
      wsService.disconnect();
      hasSubscribed.current = false;
    };
  }, [handlePriceUpdate, handleStatusChange]);

  // Fetch historical data when ticker or time window changes
  useEffect(() => {
    if (!state.selectedTickerId) return;
    fetchHistoricalData(state.selectedTickerId, state.currentTimeWindow);
  }, [state.selectedTickerId, state.currentTimeWindow, fetchHistoricalData]);

  // Public API
  const selectTicker = useCallback((tickerId: string) => {
    setState((prev) => ({
      ...prev,
      selectedTickerId: tickerId,
      historicalData: [],
    }));
  }, []);

  const onChangeTimeWindow = useCallback((hours: number) => {
    setState((prev) => ({
      ...prev,
      currentTimeWindow: hours,
    }));
  }, []);

  const reconnect = useCallback(() => {
    wsService.disconnect();
    hasSubscribed.current = false;
    wsService.connect(handlePriceUpdate, handleStatusChange);
  }, [handlePriceUpdate, handleStatusChange]);

  const onToggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  return {
    ...state,
    searchQuery,
    onSearch,
    filteredTickers,
    selectTicker,
    onChangeTimeWindow,
    reconnect,
    onToggleSidebar,
    isSidebarOpen,
  };
}

export const useCreateAlert = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alertType, setAlertType] = useState("higher");
  const [alertPrice, setAlertPrice] = useState("");
  const [selectedTickerId, setSelectedTickerId] = useState<string>();
  const { toast } = useToast();

  const activeAlertsRef = useRef<Set<string>>(new Set());

  const onConfirmCreateAlert = () => {
    if (!selectedTickerId || !alertPrice) return;

    const alertId = `${Date.now()}-${selectedTickerId}-${Math.random()}`;

    try {
      alertService.subscribe({
        id: alertId,
        tickerId: selectedTickerId,
        price: parseFloat(alertPrice),
        type: alertType as "lower" | "higher",
      });

      activeAlertsRef.current.add(alertId);

      toast.success({
        message: `Price Alert is set for ${selectedTickerId} successfully`,
      });
      setIsModalOpen(false);
      setAlertPrice("");
    } catch (e) {
      toast.error({ message: e as string });
    }
  };

  useEffect(() => {
    alertService.onAlertTriggered((alert) => {
      activeAlertsRef.current.delete(alert.id);

      toast.warning({
        title: "Price Alert",
        message: `${alert.tickerId} is ${alert.type} than $${alert.alertPrice}\nCurrent Price: $${alert.price}`,
      });
    });

    return () => {
      activeAlertsRef.current.forEach((alertId) => {
        alertService.unsubscribe(alertId);
      });
      activeAlertsRef.current.clear();
    };
  }, [toast]);

  const onNotify = (tickerId: string) => {
    setIsModalOpen(true);
    setSelectedTickerId(tickerId);
  };

  return {
    isModalOpen,
    alertType,
    alertPrice,
    setIsModalOpen,
    setAlertPrice,
    setAlertType,
    onNotify,
    onConfirmCreateAlert,
  };
};
