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
import variables from "styles/_variables";
import { usePriceChart } from "./hooks";
import { ChartDataPoint, PriceChartProps } from "./types";
import styles from "./PriceChart.module.scss";

const PriceChart: React.FC<PriceChartProps> = ({
  data,
  tickerSymbol,
  isLoading = false,
  timeWindow,
}) => {
  const { chartData, lineColor, gradientId, isInitialMount, timeWindowLabel } =
    usePriceChart({
      data,
      tickerSymbol,
      timeWindow,
    });

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <Loader message="Loading chart data..." />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <p>No historical data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {tickerSymbol && (
        <div className={styles.header}>
          <h3 className={styles.title}>{tickerSymbol} Price History</h3>
          <span className={styles.subtitle}>{timeWindowLabel}</span>
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="formattedTime"
            stroke={variables.gray500}
            fontSize={12}
            tickLine={false}
            minTickGap={50}
          />
          <YAxis
            stroke={variables.gray500}
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
            domain={["auto", "auto"]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke={lineColor}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            activeDot={{ r: 6 }}
            isAnimationActive={isInitialMount.current}
            animationDuration={isInitialMount.current ? 1000 : 0}
            animationEasing="ease-in-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload as ChartDataPoint;

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipDate}>{data.formattedDate}</div>
      <div className={styles.tooltipTime}>{data.formattedTime}</div>
      <div className={styles.tooltipPrice}>${data.price.toFixed(2)}</div>
    </div>
  );
};
