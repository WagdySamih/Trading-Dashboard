"use client";

import { useCallback, useEffect } from "react";

export const useOnClickOutside = (
  ref: React.RefObject<HTMLElement>,
  handler: () => void,
  excludeRef?: React.RefObject<HTMLElement>,
) => {
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        ref.current &&
        !excludeRef?.current?.contains(event.target as Node) &&
        !ref.current.contains(event.target as Node)
      ) {
        handler();
      }
    },
    [handler, ref, excludeRef],
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);
};
