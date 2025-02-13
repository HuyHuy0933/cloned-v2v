const CircleWarning = (props: any) => {
  return (
    <svg
      width="36px"
      height="36px"
      viewBox="0 0 1.08 1.08"
      xmlns="http://www.w3.org/2000/svg"
      id="warning"
      {...props}
    >
      <path d="M0.54 0.09a0.45 0.45 0 1 0 0.45 0.45 0.45 0.45 0 0 0 -0.45 -0.45m0 0.72A0.045 0.045 0 1 1 0.585 0.765a0.045 0.045 0 0 1 -0.045 0.045M0.585 0.585a0.045 0.045 0 0 1 -0.09 0V0.315a0.045 0.045 0 0 1 0.09 0Z" />
    </svg>
  );
};

export { CircleWarning };
