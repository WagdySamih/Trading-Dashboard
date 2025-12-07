import styles from "./Logo.module.scss";

const Logo = () => {
  return (
    <div className={styles.container}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        width="60"
        height="60"
        x="0"
        y="0"
        viewBox="0 0 24 24"
      >
        <g>
          <path
            d="M16 19.6c-.3 0-.5-.2-.6-.5L12.9 7.4l-2.3 7.8c-.1.2-.3.4-.5.4-.3 0-.5-.1-.6-.4L7 9.4l-1.4 2.8c-.1.2-.3.3-.5.3H2c-.3 0-.6-.3-.6-.6s.3-.6.6-.6h2.6l1.8-3.7c.2-.1.4-.2.6-.2s.4.1.5.4l2.3 5.5 2.5-8.4c.1-.3.3-.4.6-.4s.5.2.6.5l2.7 12 2.3-5.3c.1-.2.3-.4.6-.4h3c.3 0 .6.3.6.6s-.3.6-.6.6h-2.6l-2.8 6.6c-.2.4-.5.5-.7.5z"
            fill={"#10b981"}
            opacity="1"
          />
        </g>
      </svg>
      <h1 className={styles.text}>TradeScope</h1>
    </div>
  );
};

export default Logo;
