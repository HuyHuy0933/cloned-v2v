const StopRecordIcon = (props: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={140}
      height={140}
      fill="none"
      {...props}
    >
      <circle cx={70} cy={70} r={68} stroke="#fff" strokeWidth={4} />
      <g filter="url(#a)">
        <rect width={64} height={64} x={38} y={38} fill="#FA1A42" rx={16} />
      </g>
      <defs>
        <filter
          id="a"
          width={128}
          height={128}
          x={6}
          y={6}
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset />
          <feGaussianBlur stdDeviation={16} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0.980392 0 0 0 0 0.101961 0 0 0 0 0.258824 0 0 0 0.5 0" />
          <feBlend
            in2="BackgroundImageFix"
            result="effect1_dropShadow_13_541"
          />
          <feBlend
            in="SourceGraphic"
            in2="effect1_dropShadow_13_541"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};

export default StopRecordIcon;
