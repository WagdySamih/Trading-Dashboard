import { type ButtonHTMLAttributes, type ReactNode } from "react";
import styles from "./Button.module.scss";
import { Loader } from "../Loader";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outlined" | "danger" | "text";
  text: ReactNode;
  isLoading?: boolean;
};

const Button: React.FC<Props> = ({
  variant = "primary",
  className = "",
  text,
  isLoading,
  ...rest
}) => {
  const btnClasses = `${styles.btn} ${styles[variant]}  ${className}`;

  return (
    <button
      type="button"
      className={btnClasses}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {text}

      {isLoading && <Loader />}
    </button>
  );
};

export default Button;
