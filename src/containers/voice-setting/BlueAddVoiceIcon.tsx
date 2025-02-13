const BlueAddVoiceIcon = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={108}
    height={108}
    fill="none"
    {...props}
  >
    <rect
      width={80}
      height={80}
      x={14}
      y={14}
      fill="#A3D3FF"
      fillOpacity={0.1}
      rx={40}
    />
    <g filter="url(#a)">
      <path
        fill="#0C88FA"
        fillRule="evenodd"
        d="M58.667 32.666H40A7.333 7.333 0 0 0 32.667 40v18.666A7.333 7.333 0 0 0 40 66h18.667A7.333 7.333 0 0 0 66 58.666V40a7.333 7.333 0 0 0-7.333-7.334ZM49.52 75.334a7.307 7.307 0 0 1-6.784-4.586 2 2 0 1 1 3.71-1.496 3.322 3.322 0 0 0 3.58 2.045l18.465-2.744a3.307 3.307 0 0 0 2.186-1.312c.531-.715.75-1.595.616-2.475L68.55 46.301a2 2 0 0 1 1.686-2.272 2.012 2.012 0 0 1 2.274 1.683l2.744 18.464a7.278 7.278 0 0 1-1.362 5.445 7.283 7.283 0 0 1-4.814 2.888l-18.464 2.744c-.368.056-.73.08-1.093.08Zm-1.63-15.419c0 .71.596 1.286 1.332 1.286.736 0 1.333-.576 1.333-1.286v-21.42c0-.709-.597-1.284-1.333-1.284s-1.333.575-1.333 1.285v21.42Zm-4-3.855c-.736 0-1.333-.576-1.333-1.285V43.636c0-.71.597-1.286 1.333-1.286s1.333.576 1.333 1.286v11.138c0 .71-.597 1.285-1.333 1.285Zm-6.664-5.568c0 .71.597 1.286 1.333 1.286s1.333-.576 1.333-1.286V47.92c0-.71-.597-1.286-1.333-1.286s-1.333.576-1.333 1.286v2.571Zm21.328 0c0 .71.597 1.286 1.333 1.286s1.333-.576 1.333-1.286V47.92c0-.71-.597-1.286-1.333-1.286s-1.333.576-1.333 1.286v2.571Zm-4 5.568c-.735 0-1.333-.576-1.333-1.285V43.636c0-.71.598-1.286 1.334-1.286.735 0 1.333.576 1.333 1.286v11.138c0 .71-.598 1.285-1.333 1.285Z"
        clipRule="evenodd"
      />
    </g>
    <defs>
      <filter
        id="a"
        width={106.668}
        height={106.667}
        x={0.667}
        y={0.667}
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
        <feColorMatrix values="0 0 0 0 0.0470588 0 0 0 0 0.533333 0 0 0 0 0.980392 0 0 0 0.5 0" />
        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_370_481" />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_370_481"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
);
export default BlueAddVoiceIcon
