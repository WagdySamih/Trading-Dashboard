"use client";

import { useCallback, useEffect } from "react";

/**
 * @description: A custom hook that triggers a callback function when the Escape key is pressed.
 * @param: {() => void} callback - The callback function to be triggered.
 */
export const useOnEscapeKeyPress = (callback: () => void) => {
  const memoizedCallback = useCallback(callback, [callback]);

  const handleEscapeKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        memoizedCallback();
      }
    },
    [memoizedCallback],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleEscapeKeyPress);
    return () => {
      document.removeEventListener("keydown", handleEscapeKeyPress);
    };
  }, [handleEscapeKeyPress]);
};
