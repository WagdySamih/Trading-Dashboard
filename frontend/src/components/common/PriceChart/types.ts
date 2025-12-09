import { type HistoricalDataPoint } from "@trading-dashboard/shared";

export type PriceChartProps = {
  data: HistoricalDataPoint[];
  tickerSymbol?: string;
  isLoading?: boolean;
  timeWindow?: number;
};

export type ChartDataPoint = {
  timestamp: number;
  price: number;
  formattedTime: string;
  formattedDate: string;
};
