import { useEffect, useState } from "react";

type CustomCursorProps = {
  color: string
}

const CustomCursor: React.FC<CustomCursorProps> = ({color}) => {
  const [cursorPosition, setCursorPosition] = useState({ left: 0, top: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({
        left: e.pageX - 5,
        top: e.pageY - 5,
      });
      setIsVisible(true);
    };

    const handleMouseOut = () => {
      setIsVisible(false);
    };

    const handleWindowBlur = () => {
      setIsVisible(false);
    };

    const handleWindowFocus = () => {
      setIsVisible(true);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseOut);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseOut);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      id="circularcursor"
      className={`pointer-events-none absolute z-[9999] h-5 w-5 rounded-full border-2`}
      style={{
        left: cursorPosition.left,
        top: cursorPosition.top,
        borderColor: color
      }}
    ></div>
  );
};

export { CustomCursor };
