import { useEffect } from "react";

const AnimatedGreenCheckMark = (props: any) => {

  useEffect(() => {
    // Equivalent to embedding a JavaScript file
    const script = document.createElement('script');
    script.src = "scripts/animated-green-check-mark.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script); // Cleanup the script
    };
  }, []);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width={80}
      height={80}
      viewBox="0 0 80 80"
      {...props}
    >
      <g fill="none" stroke="#404040" strokeWidth={2}>
        <path
          id="circle-2"
          d="M40,14C25.664,14,14,25.663,14,40C14,54.337,25.664,66,40,66C54.336,66,66,54.337,66,40C66,25.663,54.336,14,40,14zM40,64C26.767,64,16,53.233,16,40C16,26.767,26.767,16,40,16C53.233,16,64,26.767,64,40C64,53.233,53.233,64,40,64z"
          strokeDasharray="320 320"
          strokeDashoffset={0}
          strokeWidth={2}
          stroke="#ededed"
          display="none"
        />
        <path
          id="check-2"
          d="M52.252,29.336L36.883,46.626L27.624,39.219C27.194,38.874,26.563,38.945,26.219,39.375C25.874,39.807,25.944,40.436,26.375,40.781L36.375,48.781C36.559,48.928,36.78,49,37,49C37.276,49,37.551,48.886,37.748,48.664L53.748,30.664C54.115,30.252,54.078,29.619,53.665,29.253C53.251,28.885,52.62,28.922,52.252,29.336z"
          strokeDasharray="80 80"
          strokeDashoffset={0}
          strokeLinecap="butt"
          strokeLinejoin="miter"
          strokeWidth={2.66812}
          stroke="#ededed"
          display="none"
        />
        <path
          id="circle"
          d="M40,14C54.336,14,66,25.663,66,40C66,54.337,54.336,66,40,66C25.664,66,14,54.337,14,40C14,25.663,25.664,14,40,14zM40,64C53.233,64,64,53.233,64,40C64,26.767,53.233,16,40,16C26.767,16,16,26.767,16,40C16,53.233,26.767,64,40,64z"
          strokeDasharray="320 320"
          strokeDashoffset={320}
          strokeWidth={2}
          stroke="#afd57b"
        />
        <path
          id="check"
          d="M27.624,39.219C27.194,38.874,26.563,38.945,26.219,39.375C25.874,39.807,25.944,40.436,26.375,40.781L36.375,48.781C36.559,48.928,36.78,49,37,49C37.276,49,37.551,48.886,37.748,48.664L53.748,30.664C54.115,30.252,54.078,29.619,53.665,29.253C53.251,28.885,52.62,28.922,52.252,29.336L36.883,46.626Z"
          strokeDasharray="80 80"
          strokeDashoffset={80}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          stroke="#afd57b"
        />
      </g>
    </svg>
  );
};

export default AnimatedGreenCheckMark;
