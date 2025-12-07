import React from "react";
import styles from "./Loader.module.scss";

type Props = {
  size?: "small" | "medium" | "large";
  message?: string;
  fullScreen?: boolean;
};

const Loader: React.FC<Props> = ({
  size = "medium",
  message,
  fullScreen = false,
}) => {
  const containerClass = fullScreen
    ? `${styles.container} ${styles.fullScreen}`
    : styles.container;

  return (
    <div className={containerClass}>
      <div className={`${styles.spinner} ${styles[size]}`} />
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default Loader;
