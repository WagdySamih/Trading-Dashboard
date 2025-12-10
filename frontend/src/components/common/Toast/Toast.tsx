"use client";
import { type ReactNode, useEffect } from "react";

import { IconButton } from "..";
import { Error, Success, Warning, XMark } from "components/icons";
import { useToast } from "context";
import { ToastType } from "enums";
import styles from "./Toast.module.scss";

const Icon: Record<ToastType, ReactNode> = {
  SUCCESS: <Success />,
  ERROR: <Error />,
  WARNING: <Warning />,
  INFO: <Warning />,
};

const ToastColor: Record<ToastType, string> = {
  SUCCESS: "#a7ffc4",
  ERROR: "#ffb1b5",
  WARNING: "#f9eac6",
  INFO: "#aee8f6",
};

const Toast = () => {
  const { toasts, removeToast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      if (toasts.length) removeToast(toasts[0].id);
    }, 10000);
    return () => clearInterval(interval);
  }, [toasts, removeToast]);

  return (
    <div className={`${styles.notificationContainer} ${styles.topRight}`}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.notification} ${styles.toast} ${styles.topRight}`}
          style={{
            backgroundColor: ToastColor?.[toast.type] as unknown as string,
          }}
        >
          <div className={styles.content}>
            {Icon[toast.type]}
            <div>
              <p className={styles.title}>
                {toast.title || toast.type.toLocaleLowerCase()}
              </p>
              <p className={styles.message}>{toast.message}</p>
            </div>
          </div>
          <IconButton
            icon={<XMark />}
            onClick={() => removeToast(toast.id)}
            className={styles.x}
          />
        </div>
      ))}
    </div>
  );
};

export default Toast;
