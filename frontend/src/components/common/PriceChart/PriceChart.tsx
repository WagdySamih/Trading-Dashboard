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
import { useWindowWidth } from "hooks"; // Add your import path
import { usePriceChart } from "./hooks";
import { type ChartDataPoint, type PriceChartProps } from "./types";
import styles from "./PriceChart.module.scss";
import variables from "styles/_variables";

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
        <AreaChart data={chartData} margin={chartMargins}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"
            opacity={isMobile ? 0.5 : 1}
          />
          <XAxis
            dataKey="formattedTime"
            stroke={variables.gray500}
            fontSize={axisFontSize}
            tickLine={false}
            minTickGap={minTickGap}
            angle={isMobile ? -45 : 0}
            textAnchor={isMobile ? "end" : "middle"}
            height={isMobile ? 60 : 30}
          />
          <YAxis
            stroke={variables.gray500}
            fontSize={axisFontSize}
            tickLine={false}
            tickFormatter={(value) =>
              isMobile
                ? `$${(value / 1000).toFixed(0)}k`
                : `$${value.toFixed(0)}`
            }
            domain={["auto", "auto"]}
            width={isMobile ? 40 : 60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke={lineColor}
            strokeWidth={strokeWidth}
            fill={`url(#${gradientId})`}
            activeDot={{ r: activeDotRadius }}
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
