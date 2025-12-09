import React from "react";
import { type ConnectionStatus } from "types";
import styles from "./StatusIndicator.module.scss";

interface StatusIndicatorProps {
  status: ConnectionStatus;
  onReconnect?: () => void;
}

const statusConfig = {
  connected: {
    label: "Connected",
    color: "success",
    icon: "●",
  },
  connecting: {
    label: "Connecting...",
    color: "warning",
    icon: "◐",
  },
  disconnected: {
    label: "Disconnected",
    color: "error",
    icon: "○",
  },
  error: {
    label: "Connection Error",
    color: "error",
    icon: "✕",
  },
};

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  onReconnect,
}) => {
  const config = statusConfig[status];

  return (
    <div className={styles.container}>
      <div className={`${styles.indicator} ${styles[config.color]}`}>
        <span className={styles.icon}>{config.icon}</span>
        <span className={styles.label}>{config.label}</span>
      </div>

      {(status === "disconnected" || status === "error") && onReconnect && (
        <button
          className={styles.reconnectBtn}
          onClick={onReconnect}
          aria-label="Reconnect to server"
        >
          Reconnect
        </button>
      )}
    </div>
  );
};

export default StatusIndicator;
