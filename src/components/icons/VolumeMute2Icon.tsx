import React from "react";

const VolumeMute2Icon = (props: any) => {
  return (
    <svg
      width={24}
      height={24}
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      stroke="currentColor"
      {...props}
    >
      <path d="M4 10v4h4l6 6V4L8 10H4z" strokeWidth={2} />
      <path d="M18 6L6 18" strokeWidth={2} />
    </svg>
  );
};

export { VolumeMute2Icon };
