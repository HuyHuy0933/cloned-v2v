import React from "react";
import { Spinner } from "./Spinner";

const CenterSpinner = (props: any) => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Spinner className="size-6" {...props} />
    </div>
  );
};

export { CenterSpinner };
