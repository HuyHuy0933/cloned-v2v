import { useEffect, useState } from "react";

interface TextWritterProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
}

const TextWritter: React.FC<TextWritterProps> = ({
  text,
  className,
  style,
  ...props
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!text) {
      setDisplayedText("");
      setIndex(0);
      return;
    }
    if (index < text.length) {
      const timeoutId = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, 30);
      return () => clearTimeout(timeoutId);
    }
  }, [index, text]);

  return (
    <p className={className} style={{ ...style }} {...props}>
      {displayedText}
    </p>
  );
};

export { TextWritter };
