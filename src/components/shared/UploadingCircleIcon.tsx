import { Spinner } from "./Spinner";

const UploadingCircleSpinner = (props: any) => {
  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={48}
        height={48}
        fill="none"
        {...props}
      >
        <rect width={48} height={48} fill="#B8FCB7" fillOpacity={0.1} rx={8} />
        <circle cx={24} cy={24} r={20} fill="#313131" />
        <path
          stroke="#B8FCB7"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="m28 24-4-4m0 0-4 4m4-4v8"
          opacity={0.5}
        />
      </svg>
      <Spinner fillColor="fill-audios" className="absolute size-6" />
    </>
  );
};

export { UploadingCircleSpinner };
