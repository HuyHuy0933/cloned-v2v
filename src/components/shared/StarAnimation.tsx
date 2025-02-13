import { useState } from "react";

const StarAnimation = () => {
  const [stars] = useState(
    new Array(100).fill(<div className="star-circle"></div>),
  );

  return (
    <div id="star-animation" className="absolute left-0 top-0 h-full w-full">
      {stars.map((element: any, index: number) => (
        <div className="star-container" key={`star-${index}`}>
          {element}
        </div>
      ))}
    </div>
  );
};

export { StarAnimation };
