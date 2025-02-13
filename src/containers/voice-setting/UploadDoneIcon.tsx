const UploadDoneIcon = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={104}
    height={104}
    fill="none"
    {...props}
  >
    <path
      fill="#B8FCB7"
      fillOpacity={0.1}
      d="M12 52c0-22.091 17.909-40 40-40s40 17.909 40 40-17.909 40-40 40-40-17.909-40-40Z"
    />
    <g filter="url(#a)">
      <path
        fill="#16C413"
        d="M52 32c-11.028 0-20 8.972-20 20s8.972 20 20 20 20-8.972 20-20-8.972-20-20-20Zm9.867 14.102c-4.647 3.456-8.587 8.226-11.707 14.173a1.873 1.873 0 0 1-3.327-.012c-1.438-2.793-3.045-5.063-4.913-6.94a1.876 1.876 0 1 1 2.66-2.645c1.433 1.44 2.725 3.07 3.907 4.93 3.098-5.113 6.835-9.316 11.145-12.518a1.875 1.875 0 0 1 2.236 3.012Z"
      />
    </g>
    <defs>
      <filter
        id="a"
        width={104}
        height={104}
        x={0}
        y={0}
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
        <feColorMatrix values="0 0 0 0 0.0862745 0 0 0 0 0.768627 0 0 0 0 0.0745098 0 0 0 0.5 0" />
        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_370_573" />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_370_573"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
);
export default UploadDoneIcon;
