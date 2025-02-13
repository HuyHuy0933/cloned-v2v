import React from "react";

type HighlightLabelTextProps = {
  text: string;
  label: string;
  color?: string;
};

const HighlightLabelText: React.FC<HighlightLabelTextProps> = ({
  text,
  label,
  color = "#bbb",
}) => {
  return (
    <mark
      className="text-xs sm:text-sm text-white"
      data-entity={label}
      style={{
        backgroundColor: color,
      }}
    >
      {text}
    </mark>
  );
};

export default HighlightLabelText;
