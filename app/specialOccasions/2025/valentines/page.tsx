"use client";

import Image from "next/image";

import { useState, useRef, useEffect } from "react";
import { IoPlayCircle, IoPauseCircle } from "react-icons/io5";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";

import { motion, AnimatePresence } from "framer-motion";

import { pictures } from "./data";

const INTERVAL_DURATION = 5000;

interface PictureDisplayProps {
  currentPicIndex: number;
}

function PictureDisplay({ currentPicIndex }: PictureDisplayProps) {
  return (
    <div className="relative w-full h-[60vh] mb-8 rounded-lg overflow-hidden shadow-2xl flex">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPicIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="relative w-full h-full"
        >
          <Image
            src={pictures[currentPicIndex].src}
            alt={pictures[currentPicIndex].title}
            fill
            className="object-contain"
            priority
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

interface PictureInfoProps {
  currentPicIndex: number;
}

function PictureInfo({ currentPicIndex }: PictureInfoProps) {
  return (
    <motion.div
      key={currentPicIndex + "-info"}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex flex-col gap-2"
    >
      <h1 className="text-4xl font-bold">{pictures[currentPicIndex].title}</h1>
      <p className="text-gray-400">{pictures[currentPicIndex].description}</p>
    </motion.div>
  );
}

interface ControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  onPlayPause: () => void;
  isPlaying: boolean;
}

function Controls({
  onPrevious,
  onNext,
  onPlayPause,
  isPlaying,
}: ControlsProps) {
  return (
    <div className="flex items-center justify-center gap-6">
      <button
        onClick={onPrevious}
        className="text-3xl text-gray-400 hover:text-white transition-colors"
      >
        <IoIosArrowBack />
      </button>

      <button
        onClick={onPlayPause}
        className="text-5xl text-green-500 hover:text-green-400 transition-colors"
      >
        {isPlaying ? <IoPauseCircle /> : <IoPlayCircle />}
      </button>

      <button
        onClick={onNext}
        className="text-3xl text-gray-400 hover:text-white transition-colors"
      >
        <IoIosArrowForward />
      </button>
    </div>
  );
}

interface ProgressSliderProps {
  currentPicIndex: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function ProgressSlider({ currentPicIndex, onChange }: ProgressSliderProps) {
  const progress = (currentPicIndex / (pictures.length - 1)) * 100;

  return (
    <div className="relative flex items-center group">
      <input
        type="range"
        min="0"
        max="100"
        value={progress}
        onChange={onChange}
        className="w-full h-1 appearance-none bg-gray-800 rounded-full outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
        style={{
          background: `linear-gradient(to right, #22c55e ${progress}%, #1f2937 ${progress}%)`,
        }}
      />
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-sm text-gray-400">
        {currentPicIndex + 1} / {pictures.length}
      </div>
    </div>
  );
}

interface ProgressIndicatorProps {
  isPlaying: boolean;
  onComplete: () => void;
  progressId: number;
}

function ProgressIndicator({
  isPlaying,
  onComplete,
  progressId,
}: ProgressIndicatorProps) {
  return (
    <motion.div
      key={progressId}
      initial={{ scaleX: 0 }}
      animate={isPlaying ? { scaleX: 1 } : { scaleX: 0 }}
      transition={
        isPlaying
          ? { duration: INTERVAL_DURATION / 1000, ease: "linear" }
          : { duration: 0 }
      }
      onAnimationComplete={() => {
        if (isPlaying) onComplete();
      }}
      className="h-1 bg-green-500"
    />
  );
}

interface AudioPlayerProps {
  isPlaying: boolean;
}

function AudioPlayer({ isPlaying }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [volume, setVolume] = useState(0.2);
  const [isMuted, setIsMuted] = useState(false);
  const [isVolumeHovered, setIsVolumeHovered] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <>
      <div
        className="flex items-center justify-end gap-2"
        onMouseEnter={() => setIsVolumeHovered(true)}
        onMouseLeave={() => setIsVolumeHovered(false)}
      >
        <AnimatePresence>
          {isVolumeHovered && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 h-1 appearance-none bg-gray-800 rounded-full outline-none cursor-pointer mr-2
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                  [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md 
                  hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                style={{
                  background: `linear-gradient(to right, #22c55e ${
                    volume * 100
                  }%, #1f2937 ${volume * 100}%)`,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={toggleMute}
          className="text-2xl text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
        >
          {isMuted || volume === 0 ? <HiSpeakerXMark /> : <HiSpeakerWave />}
        </button>
      </div>
      <audio ref={audioRef} loop>
        <source src="/audio/until-i-found-you.mp3" type="audio/mpeg" />
      </audio>
    </>
  );
}

export default function Valentines2025() {
  const [currentPicIndex, setCurrentPicIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  const handleNextPicture = () => {
    setCurrentPicIndex((prev) => (prev + 1) % pictures.length);
    setProgressKey((prev) => prev + 1);
  };

  const handlePreviousPicture = () => {
    setCurrentPicIndex(
      (prev) => (prev - 1 + pictures.length) % pictures.length
    );
    setProgressKey((prev) => prev + 1);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    setProgressKey((prev) => prev + 1);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIndex = Math.round(
      (parseInt(e.target.value) / 100) * (pictures.length - 1)
    );
    setCurrentPicIndex(newIndex);
    setProgressKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col h-full w-full gap-6 p-8 bg-gray-900 text-white overflow-y-auto">
      <div>
        <PictureDisplay currentPicIndex={currentPicIndex} />
        <ProgressIndicator
          isPlaying={isPlaying}
          onComplete={handleNextPicture}
          key={progressKey}
          progressId={progressKey}
        />
      </div>
      <PictureInfo currentPicIndex={currentPicIndex} />
      <Controls
        onPrevious={handlePreviousPicture}
        onNext={handleNextPicture}
        onPlayPause={togglePlayback}
        isPlaying={isPlaying}
      />
      <div className="flex flex-col gap-4">
        <ProgressSlider
          currentPicIndex={currentPicIndex}
          onChange={handleSliderChange}
        />
        <AudioPlayer isPlaying={isPlaying} />
      </div>
    </div>
  );
}
