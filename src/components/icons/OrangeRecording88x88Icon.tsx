const OrangeRecording88x88Icon = ({
  ...props
}: any) => (
  <svg
    width={88}
    height={88}
    viewBox="0 0 88 88"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle
      opacity={0.1}
      cx={44}
      cy={44}
      r={43}
      stroke="white"
      strokeWidth={2}
    />
    <g filter="url(#filter0_d_497_37)">
      <rect
        x={23.8857}
        y={23.8857}
        width={40.2286}
        height={40.2286}
        rx={10}
        fill="#DE3648"
      />
    </g>
    <defs>
      <filter
        id="filter0_d_497_37"
        x={3.88574}
        y={3.88574}
        width={80.2285}
        height={80.2285}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset />
        <feGaussianBlur stdDeviation={10} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.980392 0 0 0 0 0.541176 0 0 0 0 0.101961 0 0 0 0.5 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_497_37"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_497_37"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
);
export { OrangeRecording88x88Icon };
