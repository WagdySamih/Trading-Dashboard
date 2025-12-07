import styles from "./IconButton.module.scss";

type Props = {
  icon: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const IconButton: React.FC<Props> = ({ icon, ...props }) => {
  const classes = [styles.button, props.className].filter(Boolean).join(" ");

  return (
    <button {...props} className={classes}>
      {icon}
    </button>
  );
};

export default IconButton;
