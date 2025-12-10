"use client";

import { useOnClickOutside, useOnEscapeKeyPress } from "hooks";
import { useEffect, useRef, type RefObject } from "react";

type UseModalParams = {
  isOpened: boolean;
  onClose: () => void;
};

export const useModal = ({ isOpened, onClose }: UseModalParams) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(
    modalRef as RefObject<HTMLElement>,
    () => isOpened && onClose(),
  );
  useOnEscapeKeyPress(() => isOpened && onClose());

  useEffect(() => {
    document.body.style.overflow = isOpened ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpened]);

  return { modalRef };
};
