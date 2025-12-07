import { HistoricalDataPoint, Ticker } from "@trading-dashboard/shared";
import { ConnectionStatus } from "types";

export type MarketDataState = {
  tickers: Map<string, Ticker>;
  selectedTickerId: string | null;
  historicalData: HistoricalDataPoint[];
  connectionStatus: ConnectionStatus;
  isLoading: boolean;
  error: string | null;
  currentTimeWindow: number;
};

export type UseMarketDataReturn = MarketDataState & {
  selectTicker: (tickerId: string) => void;
  refreshHistoricalData: (hours?: number) => Promise<void>;
  reconnect: () => void;
  onChangeTimeWindow: (hours: number) => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  filteredTickers: Ticker[];
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
};
