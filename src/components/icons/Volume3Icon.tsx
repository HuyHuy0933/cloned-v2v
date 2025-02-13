import React from "react";

const Volume3Icon = (props: any) => {
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
      <path d="M15 9v6m3-9v12" strokeWidth={2} />
    </svg>
  );
};

export { Volume3Icon };
