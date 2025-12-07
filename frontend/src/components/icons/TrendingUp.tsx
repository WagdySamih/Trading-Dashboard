import { Props } from "./types";
import variables from "styles/_variables";

export const TrendingUp: React.FC<Props> = ({
  width = "16",
  height = "16",
  color = variables.success,
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
    viewBox="0 0 24 24"
    className={className}
    fill={color}
    {...rest}
  >
    <g>
      <clipPath id="a">
        <path d="M0 0h24v24H0z" fill={color} opacity="1"></path>
      </clipPath>
      <g fill="#000" fillRule="evenodd" clipPath="url(#a)" clipRule="evenodd">
        <path
          d="M23.707 5.293a1 1 0 0 1 0 1.414l-9.5 9.5a1 1 0 0 1-1.414 0L8.5 11.914l-6.793 6.793a1 1 0 0 1-1.414-1.414l7.5-7.5a1 1 0 0 1 1.414 0l4.293 4.293 8.793-8.793a1 1 0 0 1 1.414 0z"
          fill={color}
          opacity="1"
        ></path>
        <path
          d="M16 6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0V7h-5a1 1 0 0 1-1-1z"
          fill={color}
          opacity="1"
          data-original={color}
        ></path>
      </g>
    </g>
  </svg>
);
