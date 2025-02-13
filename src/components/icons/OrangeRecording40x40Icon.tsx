import React from "react";

const OrangeRecording40x40Icon = (props: any) => {
  return (
    <svg
      width={40}
      height={40}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle
        opacity={0.1}
        cx={20}
        cy={20}
        r={19.5455}
        stroke="white"
        strokeWidth={0.909091}
      />
      <g filter="url(#filter0_d_497_101)">
        <rect
          x={10.8574}
          y={10.8564}
          width={18.2857}
          height={18.2857}
          rx={4.54545}
          fill="#FA8A1A"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_497_101"
          x={1.76651}
          y={1.76554}
          width={36.4675}
          height={36.468}
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
          <feGaussianBlur stdDeviation={4.54545} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.980392 0 0 0 0 0.541176 0 0 0 0 0.101961 0 0 0 0.5 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_497_101"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_497_101"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};

export {OrangeRecording40x40Icon} ;
