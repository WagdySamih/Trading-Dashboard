import { type PropsWithChildren } from "react";
import { ClientPortal } from "../ClientPortal";
import styles from "./Modal.module.scss";
import { useModal } from "./hooks";
type Props = {
  open: boolean;
  onClose: () => void;
  className?: string;
  hideCloseButton?: boolean;
};

const Modal: React.FC<PropsWithChildren<Props>> = ({
  open,
  onClose,
  hideCloseButton = false,
  className = "",
  children,
}) => {
  const { modalRef } = useModal({ isOpened: open, onClose });

  if (!open) return null;
  return (
    <ClientPortal selector="modal-root">
      <div className={styles.overlay}>
        <div ref={modalRef} className={`${styles.modal} ${className}`}>
          {children}
          {!hideCloseButton && (
            <button onClick={onClose} aria-label="close" className={styles.x}>
              ❌
            </button>
          )}
        </div>
      </div>
    </ClientPortal>
  );
};

export default Modal;
