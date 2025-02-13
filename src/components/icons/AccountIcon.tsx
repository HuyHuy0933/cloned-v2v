const AccountIcon = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={31}
    height={30}
    fill="none"
    {...props}
  >
    <g clipPath="url(#a)">
      <path
        fill="#A3D3FF"
        stroke="#A3D3FF"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.875 28.333c7.364 0 13.333-5.97 13.333-13.333 0-7.364-5.97-13.333-13.333-13.333C8.511 1.667 2.542 7.637 2.542 15c0 7.364 5.97 13.333 13.333 13.333Z"
        opacity={0.25}
      />
      <path
        fill="#0C88FA"
        fillRule="evenodd"
        d="M15.875 6.333a6.333 6.333 0 1 0 0 12.667 6.333 6.333 0 0 0 0-12.667Zm-4 15.334a6.328 6.328 0 0 0-5.237 2.77.995.995 0 0 0-.172.62 1 1 0 0 0 .332 1.036 14.278 14.278 0 0 0 9.077 3.24 14.28 14.28 0 0 0 9.138-3.29 1 1 0 0 0 .257-1.215.995.995 0 0 0-.158-.391 6.328 6.328 0 0 0-5.237-2.77h-8Z"
        clipRule="evenodd"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M.875 0h30v30h-30z" />
      </clipPath>
    </defs>
  </svg>
);
export { AccountIcon };
