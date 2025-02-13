import React from "react";

const Microphone52x40Icon = (props: any) => {
  return (
    <svg
      width={40}
      height={30.303}
      viewBox="0 0 40 30.303"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g filter="url(#filter0_d_498_186)">
        <path
          d="M17.489 9.321a2.511 2.511 0 1 1 5.022 0v5.859a2.511 2.511 0 1 1 -5.022 0z"
          fill="white"
        />
        <path
          d="M25.859 13.506v1.674c0 3.236 -2.623 5.859 -5.859 5.859m-5.858 -7.533v1.675A5.859 5.859 0 0 0 20 21.039m0 0v2.51m0 -5.858a2.511 2.511 0 0 1 -2.511 -2.511V9.321a2.511 2.511 0 1 1 5.022 0v5.859A2.511 2.511 0 0 1 20 17.691"
          stroke="white"
          strokeWidth={1.2554121212121212}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_498_186"
          x={0.202614}
          y={-11.8941}
          width={65.5953}
          height={73.8809}
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
          <feGaussianBlur stdDeviation={11.0476} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.980392 0 0 0 0 0.541176 0 0 0 0 0.101961 0 0 0 0.5 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_498_186"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_498_186"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};

export { Microphone52x40Icon };
