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

  const dateRangeInfo = useMemo(() => {
    if (data.length === 0) return null;

    const startDate = data[0].timestamp;
    const endDate = data[data.length - 1].timestamp;
    const diffInMs = endDate.getTime() - startDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    let displayText = "";
    if (diffInDays > 0) {
      displayText = `${diffInDays} ${diffInDays === 1 ? "day" : "days"}`;
    } else if (diffInHours > 0) {
      displayText = `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"}`;
    } else {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      displayText = `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"}`;
    }

    return {
      startDate,
      endDate,
      displayText,
    };
  }, [data]);

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
    dateRangeInfo,
  };
};
