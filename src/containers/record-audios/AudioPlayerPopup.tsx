import { VolumeIcon, VolumeMuteIcon } from "@/components/icons";
import Backward15SecIcon from "@/components/icons/Backward15SecIcon";
import Forward15SecIcon from "@/components/icons/Forward15SecIcon";
import { secondsToTimer } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";

type AudioPlayerPopupProps = React.MediaHTMLAttributes<HTMLAudioElement> & {
  open: boolean;
  duration: number;
};

const AudioPlayerPopup = React.memo(
  React.forwardRef<HTMLAudioElement, AudioPlayerPopupProps>(
    ({ open, duration, onTimeUpdate, ...props }, ref) => {
      const internalRef = useRef<HTMLAudioElement | null>(null);
      const combinedRef = (instance: HTMLAudioElement) => {
        internalRef.current = instance;
        if (typeof ref === "function") {
          ref(instance);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLAudioElement>).current = instance;
        }
      };

      const [muted, setMuted] = useState(false);
      const [popupVariants] = useState(() => ({
        hidden: { y: "100dvh", opacity: 0 },
        visible: { y: 0, opacity: 1 },
        exit: { y: "100dvh", opacity: 0 },
      }));
      const [rates] = useState(["0.75", "1.0", "1.25", "1.5", "2.0"]);
      const [rateIndex, setRateIndex] = useState(1);
      const [playProgress, setPlayProgress] = useState(0);
      const [bufferedProgress, setBufferedProgress] = useState(0);
      const [tooltipVisible, setTooltipVisible] = useState(false);
      const [tooltipPosition, setTooltipPosition] = useState({ left: 0 });
      const [tooltipTime, setTooltipTime] = useState("");

      const intervalRef = useRef<any>(null);

      useEffect(() => {
        if (open) {
          startTimer();

          return () => {
            clearInterval(intervalRef.current);
          };
        }
      }, [open]);

      const startTimer = () => {
        clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
          if (!internalRef || !internalRef.current) return;
          setPlayProgress(internalRef.current.currentTime);
        }, 1000);
      };

      const onSeek = (value: number) => {
        if (!internalRef || !internalRef.current) return;
        setPlayProgress(value);
        internalRef.current.currentTime = Number(value);
      };

      const onBackward = () => {
        if (!internalRef || !internalRef.current) return;
        const time =
          internalRef.current.currentTime > 15
            ? internalRef.current.currentTime - 15
            : 0;

        onSeek(time);
      };

      const onForward = () => {
        if (!internalRef || !internalRef.current) return;
        let time = internalRef.current.currentTime + 15;
        if (time >= duration) {
          time = duration;
        }

        onSeek(time);
      };

      const onToggleMute = () => {
        if (!internalRef || !internalRef.current) return;
        internalRef.current.muted = !muted;
        setMuted((prev) => !prev);
      };

      const onPlaybackRateChange = () => {
        if (!internalRef || !internalRef.current) return;
        const nextIndex = (rateIndex + 1) % rates.length;
        internalRef.current.playbackRate = Number(rates[nextIndex]);
        setRateIndex(nextIndex);
      };

      const handleMouseMove = (e: React.MouseEvent<HTMLInputElement>) => {
        const input = e.currentTarget;
        const rect = input.getBoundingClientRect();
        const percentage = (e.clientX - rect.left) / rect.width;
        const hoverTime = Math.round(percentage * duration);
        setTooltipTime(secondsToTimer(hoverTime));
        setTooltipPosition({ left: e.clientX - rect.left });
        setTooltipVisible(true);
      };

      const handleTouchMove = (e: React.TouchEvent<HTMLInputElement>) => {
        const input = e.currentTarget;
        const rect = input.getBoundingClientRect();
        const touchX = e.touches[0].clientX;
        const percentage = (touchX - rect.left) / rect.width;
        const hoverTime = Math.round(percentage * duration);
        setTooltipTime(secondsToTimer(hoverTime));
        setTooltipPosition({ left: touchX - rect.left });
        setTooltipVisible(true);
      };

      const handleLeave = () => {
        setTooltipVisible(false);
      };

      const handleTimeUpdate = (event: any) => {
        if (!internalRef || !internalRef.current) return;

        const { buffered } = internalRef.current;
        if (buffered.length > 0) {
          const bufferedEnd = buffered.end(buffered.length - 1);
          setBufferedProgress(bufferedEnd);
        }
        onTimeUpdate && onTimeUpdate(event);
      };

      return (
        <>
          <AnimatePresence>
            {open && (
              <motion.div
                id="audio-player-popup"
                className="fixed bottom-0 left-0 z-[1000] w-full bg-opacity-100"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={popupVariants}
                transition={{ duration: 0.5, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex h-28 w-full flex-col items-center justify-center rounded-t-lg bg-[#313131] px-6">
                  <div className="flex w-full justify-between text-[10px] sm:text-xs">
                    <p>{secondsToTimer(Math.round(playProgress))}</p>
                    <p>{secondsToTimer(Math.round(duration))}</p>
                  </div>

                  <div className="relative mt-2 flex w-full items-center gap-2">
                    {/* Progress slider  */}
                    <input
                      id="seekSlider"
                      type="range"
                      value={playProgress}
                      step="1"
                      min="0"
                      max={`${duration}`}
                      className="absolute left-0 top-0 z-10 h-[5px] w-full grow appearance-none rounded-sm bg-primary"
                      onChange={(e) => onSeek(Number(e.target.value))}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleLeave}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleLeave}
                    />

                    {/* Buffered progress bar */}
                    <div
                      className="absolute left-0 top-0 h-[5px] rounded-sm bg-[#0092ac]/40 transition-all duration-100"
                      style={{
                        width: `${(bufferedProgress / duration) * 100}%`,
                      }}
                    ></div>

                    {/* played progress bar */}
                    <div
                      className="absolute left-0 top-0 h-[5px] rounded-sm bg-[#0092ac] transition-all duration-100"
                      style={{
                        width: `${(playProgress / duration) * 100}%`,
                      }}
                    ></div>

                    {tooltipVisible && (
                      <div
                        className="absolute -top-6 px-2 py-1 text-[10px] text-white"
                        style={{
                          left: `${tooltipPosition.left}px`,
                          transform: "translateX(-50%)",
                        }}
                      >
                        {tooltipTime}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex w-full items-center justify-between gap-2 px-4 text-sm">
                    <Backward15SecIcon
                      className="text-white/80 hover:text-white"
                      onClick={onBackward}
                    />
                    <p
                      className="text-white/80 hover:text-white"
                      onClick={onPlaybackRateChange}
                    >
                      {rates[rateIndex]}x
                    </p>
                    {!muted ? (
                      <VolumeIcon
                        className="text-white/80 hover:text-white"
                        onClick={onToggleMute}
                      />
                    ) : (
                      <VolumeMuteIcon
                        className="text-white/80 hover:text-white"
                        onClick={onToggleMute}
                      />
                    )}
                    <Forward15SecIcon
                      className="text-white/80 hover:text-white"
                      onClick={onForward}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <audio ref={combinedRef} onTimeUpdate={handleTimeUpdate} {...props} />
        </>
      );
    },
  ),
);
export default AudioPlayerPopup;
