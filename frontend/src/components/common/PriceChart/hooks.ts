import { useEffect, useMemo, useRef } from "react";
import { dateFormatter, timeFormatter } from "utils";
import { type ChartDataPoint, type PriceChartProps } from "./types";
import variables from "styles/_variables";

export const usePriceChart = ({
  data,
  tickerSymbol,
  timeWindow,
}: Omit<PriceChartProps, "isLoading">) => {
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, [tickerSymbol]);

  const chartData: ChartDataPoint[] = useMemo(() => {
    return data.map((point) => ({
      timestamp: point.timestamp.getTime(),
      price: point.price,
      formattedTime: timeFormatter(point.timestamp),
      formattedDate: dateFormatter(point.timestamp),
    }));
  }, [data]);

  const getTimeWindowLabel = (time: number): string => {
    if (!time) return "Last 24 hours";

    const hours = typeof time === "number" ? time : parseFloat(time);

    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return minutes === 10 ? "(Live update)" : `Last ${minutes} Minutes`;
    }

    if (hours < 24) {
      return `Last ${hours} ${hours === 1 ? "Hour" : "Hours"}`;
    }

    const days = Math.round(hours / 24);
    return `Last ${days} ${days === 1 ? "Day" : "Days"}`;
  };

  const isPositiveTrend =
    data.length >= 2 && data[data.length - 1].price >= data[0].price;
  const lineColor = isPositiveTrend ? variables.success : variables.error;
  const gradientId = `gradient-${tickerSymbol || "default"}`;

  return {
    chartData,
    lineColor,
    gradientId,
    isInitialMount,
    timeWindowLabel: timeWindow ? getTimeWindowLabel(timeWindow) : "",
  };
};
