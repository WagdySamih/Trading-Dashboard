import React from "react";
import styles from "./RadioButtonGroup.module.scss";

interface RadioOption {
  value: string;
  label: string;
}

interface RadioProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
}

const Radio: React.FC<RadioProps> = ({ options, value, onChange }) => {
  return (
    <div className={styles.container}>
      {options.map((option) => (
        <label key={option.value} className={styles.item}>
          <input
            type="radio"
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
          />
          <span className={styles.control} />
          <span className={styles.label}>{option.label}</span>
        </label>
      ))}
    </div>
  );
};

export default Radio;
