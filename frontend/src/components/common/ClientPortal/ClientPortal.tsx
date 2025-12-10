"use client";

import {
  type PropsWithChildren,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

type Props = {
  children: ReactNode;
  selector: string;
};

const ClientPortal: React.FC<PropsWithChildren<Props>> = ({
  children,
  selector,
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    ref.current = document.getElementById(selector);
    setMounted(true);
  }, [selector]);

  return mounted ? createPortal(children, ref.current as Element) : null;
};

export default ClientPortal;
