import { Asterisk } from "lucide-react";
import React from "react";

const Required = () => {
  return (
    <>
      <Asterisk
        size={17}
        className=" text-error-500 bg-error-50 text-md font-medium w-4 h-4 text-center rounded-full"
      />
    </>
  );
};

export default Required;
