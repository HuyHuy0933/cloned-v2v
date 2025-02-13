import React from "react";
const PauseCircle = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5} // Keep the circle's stroke width
    stroke="white"
    className="size-6"
    {...props}
  >
    {/* The outer circle */}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
    
    {/* Left pause line */}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5} // Increased thickness for the line
      d="M9.75 9v6"
    />
    
    {/* Right pause line */}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5} // Increased thickness for the line
      d="M14.25 9v6"
    />
  </svg>
);

export { PauseCircle };
