import React from "react";

const Copy2Icon = (props: any) => {
  return (
    <svg
      className="icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      width={24}
      height={24}
      {...props}
    >
      <path d="M13 7H7V5h6z" fill="currentColor" />
      <path d="M13 11H7V9h6z" fill="currentColor" />
      <path d="M7 15h6v-2H7z" fill="currentColor" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 19V1h14v4h4v18H7v-4zm12 -2V3H5v14zm2 -10v12H9v2h10V7z"
        fill="currentColor"
      />
    </svg>
  );
};

export { Copy2Icon };
