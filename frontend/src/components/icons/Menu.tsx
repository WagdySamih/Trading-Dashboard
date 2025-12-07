import variables from "styles/_variables";
import { Props } from "./types";

export const Menu: React.FC<Props> = ({
  width = "30",
  height = "30",
  color = variables.gray500,
  className = "",
  ...rest
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    width={width}
    height={height}
    x="0"
    y="0"
    viewBox="0 0 64 64"
    className={className}
    fill={color}
    {...rest}
  >
    <g>
      <path
        d="M53 21H11c-1.7 0-3-1.3-3-3s1.3-3 3-3h42c1.7 0 3 1.3 3 3s-1.3 3-3 3zM53 35H11c-1.7 0-3-1.3-3-3s1.3-3 3-3h42c1.7 0 3 1.3 3 3s-1.3 3-3 3zM53 49H11c-1.7 0-3-1.3-3-3s1.3-3 3-3h42c1.7 0 3 1.3 3 3s-1.3 3-3 3z"
        fill="#000000"
        opacity="1"
      ></path>
    </g>
  </svg>
);
