import React, { useState, useRef, ReactNode, forwardRef, TouchEvent } from 'react';
import "@/containers/record-audios/styles/PullToRefresh.scss";
import { motion } from "motion/react"
import { Spinner } from '@/components';

type PullToRefreshProps = {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
}

const PullToRefresh = forwardRef<HTMLDivElement, PullToRefreshProps>(({ children, onRefresh, className }, ref) => {
  const [refreshing, setRefreshing] = useState(false);
  const [distancePulled, setDistancePulled] = useState(0);
  const refreshThreshold = 100;
  const touchStartY = useRef(0);
  const pullContainer = useRef<HTMLDivElement | null>(null);

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (pullContainer.current && pullContainer.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    const touchMoveY = e.touches[0].clientY;
    const pullDistance = touchMoveY - touchStartY.current;

    if (pullDistance > 0 && pullContainer.current?.scrollTop === 0) {
      e.stopPropagation();
      setDistancePulled(pullDistance > refreshThreshold ? refreshThreshold : pullDistance);
    }
  };

  const onTouchEnd = () => {
    if (distancePulled >= refreshThreshold) {
      triggerRefresh();
    }
    setDistancePulled(0);
  };

  const triggerRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
      setDistancePulled(0);
    }
  };

  return (
    <div
      ref={pullContainer}
      className="flex flex-col h-full w-full overflow-auto"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="refresh-indicator" style={{ height: refreshing ? '70px' : `${distancePulled}px` }}>
        <motion.div
          className={`w-full flex justify-center items-center transition-all ease-linear duration-200 mb-4`}
          style={{ height: distancePulled > 0 || refreshing ? '70px' : '0' }}
          transition={{ type: "spring", damping: 300 }}
        >
          {refreshing ? <Spinner /> : (
            distancePulled > 0 && <Spinner />
          )}
        </motion.div>
      </div>
      <div className="w-full h-full">
        {children}
      </div>
    </div>
  );
});

export default PullToRefresh;
