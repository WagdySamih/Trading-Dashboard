import styles from "./OptionGroup.module.scss";

type Option = {
  label: string;
  value: number;
};

type Props = {
  onChoose: (value: number) => void;
  value: number;
  options: Option[];
};

const TimeFilter: React.FC<Props> = ({ onChoose, value, options }) => {
  return (
    <div className={styles.container}>
      {options.map((option) => (
        <button
          key={option.value}
          className={`${styles.button} ${value === option.value ? styles.active : ""}`}
          onClick={() => onChoose(option.value)}
          style={{
            width: `${100 / options.length}%`,
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default TimeFilter;
