export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

export const formatPercent = (percent: number): string => {
  const sign = percent >= 0 ? "+" : "";
  return `${sign}${percent.toFixed(2)}%`;
};

export const timeFormatter = (time: Date) => {
  return time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const dateFormatter = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatLargeNumber = (
  value: number,
  decimals: number = 1,
  includeSymbol: boolean = false,
): string => {
  const symbol = includeSymbol ? "$" : "";
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  // Billions
  if (absValue >= 1_000_000_000) {
    const formatted = (absValue / 1_000_000_000).toFixed(decimals);
    return `${sign}${symbol}${formatted}B`;
  }

  // Millions
  if (absValue >= 1_000_000) {
    const formatted = (absValue / 1_000_000).toFixed(decimals);
    return `${sign}${symbol}${formatted}M`;
  }

  // Thousands
  if (absValue >= 1_000) {
    const formatted = (absValue / 1_000).toFixed(decimals);
    return `${sign}${symbol}${formatted}K`;
  }

  // Less than 1000
  return `${sign}${symbol}${absValue.toFixed(decimals)}`;
};
