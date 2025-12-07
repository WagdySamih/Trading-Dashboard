import { SearchIcon } from "components/icons";
import styles from "./SearchInput.module.scss";

type Props = {
  onSearch: (query: string) => void;
  value: string;
} & React.HTMLAttributes<HTMLInputElement>;

const SearchInput: React.FC<Props> = ({ onSearch, value, ...rest }) => {
  return (
    <div className={styles.search}>
      <input
        type="text"
        placeholder="Search..."
        value={value}
        onChange={(e) => onSearch(e.target.value)}
        {...rest}
      />
      <SearchIcon />
    </div>
  );
};

export default SearchInput;
