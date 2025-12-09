export interface Ticker {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  lastUpdate: Date;

  dayHigh: number;
  dayLow: number;
  previousClose: number;
  category: "stock" | "crypto" | "forex" | "commodity";
}

export interface PriceUpdate {
  tickerId: string;
  price: number;
  timestamp: Date;
  change: number;
  changePercent: number;
}

export interface HistoricalDataPoint {
  timestamp: Date;
  price: number;
  volume?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const WsMessageType = {
  SUBSCRIBE: "SUBSCRIBE",
  UNSUBSCRIBE: "UNSUBSCRIBE",
  PRICE_UPDATE: "PRICE_UPDATE",
  ERROR: "ERROR",
} as const;

export type WsMessageType = (typeof WsMessageType)[keyof typeof WsMessageType];

export interface WsMessage {
  type: WsMessageType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
}

export interface SubscribeMessage extends WsMessage {
  type: typeof WsMessageType.SUBSCRIBE;
  payload: {
    tickerIds: string[];
  };
}

export interface PriceUpdateMessage extends WsMessage {
  type: typeof WsMessageType.PRICE_UPDATE;
  payload: PriceUpdate;
}
