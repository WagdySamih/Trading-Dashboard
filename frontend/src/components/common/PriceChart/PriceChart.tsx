import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader } from "..";
import { useWindowWidth } from "hooks";
import { usePriceChart } from "./hooks";
import { type ChartDataPoint, type PriceChartProps } from "./types";
import styles from "./PriceChart.module.scss";

const PriceChart: React.FC<PriceChartProps> = ({
  data,
  tickerSymbol,
  isLoading = false,
  timeWindow,
}) => {
  const {
    chartData,
    lineColor,
    gradientId,
    isInitialMount,
    timeWindowLabel,
    dateRangeInfo,
  } = usePriceChart({
    data,
    tickerSymbol,
    timeWindow,
  });

  const windowWidth = useWindowWidth();
  const isMobile = windowWidth <= 750;

  const chartMargins = isMobile
    ? { top: 5, right: 10, left: -20, bottom: 5 }
    : { top: 5, right: 30, left: 0, bottom: 5 };

  const axisFontSize = isMobile ? 10 : 12;
  const minTickGap = isMobile ? 30 : 50;
  const strokeWidth = isMobile ? 1.5 : 2;
  const activeDotRadius = isMobile ? 4 : 6;

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Loader message="Loading chart data..." />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p className={styles.emptyStateText}>No historical data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {tickerSymbol && (
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            <h3 className={styles.title}>{tickerSymbol} Price History</h3>
            {timeWindowLabel && (
              <span className={styles.timeWindow}>{timeWindowLabel}</span>
            )}
          </div>
          {dateRangeInfo && (
            <div className={styles.dateRange}>
              {dateRangeInfo.startDate.toLocaleDateString()} -{" "}
              {dateRangeInfo.endDate.toLocaleDateString()}
              <span className={styles.rangeDuration}>
                ({dateRangeInfo.displayText})
              </span>
            </div>
          )}
        </div>
      )}
      <ResponsiveContainer width="100%" height={"100%"}>
        <AreaChart data={chartData} margin={chartMargins} syncMethod="value">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="timestamp"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(timestamp) => {
              const date = new Date(timestamp);
              return isMobile
                ? date.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : date.toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
            }}
            minTickGap={minTickGap}
            tick={{ fontSize: axisFontSize }}
          />
          <YAxis
            tick={{ fontSize: axisFontSize }}
            tickFormatter={(value) =>
              isMobile
                ? `$${(value / 1000).toFixed(0)}k`
                : `$${value.toFixed(0)}`
            }
            domain={["auto", "auto"]}
            width={isMobile ? 40 : 60}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              stroke: lineColor,
              strokeWidth: 1,
              strokeDasharray: "3 3",
            }}
            allowEscapeViewBox={{ x: false, y: true }}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={lineColor}
            strokeWidth={strokeWidth}
            fill={`url(#${gradientId})`}
            animationDuration={isInitialMount.current ? 0 : 1000}
            dot={false}
            activeDot={{ r: activeDotRadius, fill: lineColor }}
            isAnimationActive={isInitialMount.current}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, coordinate }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload as ChartDataPoint;

  if (!coordinate) return null;

  return (
    <div className={styles.tooltip}>
      <p className={styles.date}>{data.formattedDate}</p>
      <p className={styles.time}>{data.formattedTime}</p>
      <p className={styles.price}>${data.price.toFixed(2)}</p>
    </div>
  );
};
