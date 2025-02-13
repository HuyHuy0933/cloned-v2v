const Microphone96x108Icon = (props: any) => (
  <svg
    width={96}
    height={108}
    viewBox="0 0 96 108"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g filter="url(#filter0_d_497_27)">
      <path
        d="M42 40C42 36.6863 44.6863 34 48 34C51.3137 34 54 36.6863 54 40V54C54 57.3137 51.3137 60 48 60C44.6863 60 42 57.3137 42 54V40Z"
        fill="white"
      />
      <path
        d="M62 50V54C62 61.732 55.732 68 48 68M34 50V54C34 61.732 40.268 68 48 68M48 68V74M48 60C44.6863 60 42 57.3137 42 54V40C42 36.6863 44.6863 34 48 34C51.3137 34 54 36.6863 54 40V54C54 57.3137 51.3137 60 48 60Z"
        stroke="white"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <filter
        id="filter0_d_497_27"
        x={0.5}
        y={0.5}
        width={95}
        height={107}
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
        <feGaussianBlur stdDeviation={16} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.980392 0 0 0 0 0.541176 0 0 0 0 0.101961 0 0 0 0.5 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_497_27"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_497_27"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
);
export { Microphone96x108Icon };
