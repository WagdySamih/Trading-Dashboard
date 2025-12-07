import variables from "styles/_variables";
import { Props } from "./types";

export const XMark: React.FC<Props> = ({
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
    viewBox="0 0 32 32"
    className={className}
    fill={color}
    {...rest}
  >
    <g>
      <path
        d="m17.414 16 6.293-6.293a1 1 0 0 0-1.414-1.414L16 14.586 9.707 8.293a1 1 0 0 0-1.414 1.414L14.586 16l-6.293 6.293a1 1 0 1 0 1.414 1.414L16 17.414l6.293 6.293a1 1 0 0 0 1.414-1.414z"
        fill="#000000"
        opacity="1"
        data-original="#000000"
      ></path>
    </g>
  </svg>
);
