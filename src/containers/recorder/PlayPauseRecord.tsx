import React, { useState } from 'react';
import { motion } from 'motion/react';

type PlayPauseProps = {
    pause: boolean;
    togglePlayPause: () => void;
}

const PlayPauseRecord: React.FC<PlayPauseProps> = ({pause, togglePlayPause}) => {  

  return (
    <div onClick={togglePlayPause}>
      <svg width="80" height="80" viewBox="0 0 104 104">
        <motion.circle
          cx="52"
          cy="52"
          r="48"
          stroke="white"
          strokeWidth="7"
          fill="transparent"
          strokeDasharray="314"
          initial={{ strokeDashoffset: 0, opacity: 1 }}
          animate={{
              strokeDashoffset: pause ? 314 : 0,
              opacity: !pause ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          />
            
            {/* Pause to Play Transition */}
          <motion.line
            x1="38"
            y1="30"
            x2="38"
            y2="70"
            stroke="white"
            strokeWidth="7"
            strokeLinecap="round"
            initial={{ opacity: 1 }}                
            transition={{ duration: 0.3 }}
          />
          
          {/* Play Path */}
          <motion.path
            d={pause ? "M 38 30 L 70 50 L 38 70" : "M 66 30 L 66 50 L 66 70"}
            fill="white"
            stroke="white"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ opacity: 1 }}
            animate={{
                d: pause ? "M 38 30 L 70 50 L 38 70" : "M 66 30 L 66 50 L 66 70",
            }}                
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
      </svg>
    </div>
  );
};

export default PlayPauseRecord;
