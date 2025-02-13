import { useState, ChangeEvent, useEffect } from "react";
import { Input } from "@/components";

type InputPasswordProps = {
  value?: string;
  onChange: (value: string) => void;
};

const InputPassword: React.FC<InputPasswordProps> = ({
  value,
  onChange
}) => {
  const [otp, setOtp] = useState<string[]>(Array(5).fill(""));

  useEffect(() => {
    if (value === "") {      
      setOtp(Array(5).fill(""));
    }
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;

    if (/^[0-9]$/.test(val) || val === "") {
      let newOtp = [...otp];
      newOtp[index] = val;
      setOtp(newOtp);
      onChange(newOtp.join(""));

      if (val && e.target.nextSibling) {
        (e.target.nextSibling as HTMLInputElement).focus();
      }

      if (newOtp.join("").length === 5) {
        (e.target as HTMLInputElement).blur();
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    const val = e.target as HTMLInputElement;
    if (e.key === "Backspace" && otp[index] === "") {
      if (val.previousSibling) {
        (val.previousSibling as HTMLInputElement).focus();
      }

      let newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      onChange(newOtp.join(""));
    }
  };

  return (
    <div className="flex items-center justify-center">
      {otp.map((v, i) => (
        <Input
          key={i}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={v ? "•" : ""}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="mx-1 h-10 w-10 rounded-md bg-[#eeeeee] text-center text-2xl text-black"
        />
      ))}
    </div>
  );
};

export default InputPassword;
