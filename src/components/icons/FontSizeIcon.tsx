import React from "react";

const FontSizeIcon = (props: any) => {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13 9H10V17H8V9H5V7H13V9ZM18 13H16V17H14V13H12V11H18V13Z"
        fill="currentColor"
      />
    </svg>
  );
};

export { FontSizeIcon };
