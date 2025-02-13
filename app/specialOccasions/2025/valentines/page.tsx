"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { IoPlayCircle, IoPauseCircle } from "react-icons/io5";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";

import { pictures } from "./data";

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
      className="mb-8 flex flex-col"
    >
      <h1 className="text-4xl font-bold mb-2">
        {pictures[currentPicIndex].title}
      </h1>
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
    <div className="mt-8 relative flex items-center group">
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

export default function Valentines2025() {
  const [currentPicIndex, setCurrentPicIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleNextPicture = () => {
    setCurrentPicIndex((prev) => (prev + 1) % pictures.length);
  };

  const handlePreviousPicture = () => {
    setCurrentPicIndex(
      (prev) => (prev - 1 + pictures.length) % pictures.length
    );
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIndex = Math.round(
      (parseInt(e.target.value) / 100) * (pictures.length - 1)
    );
    setCurrentPicIndex(newIndex);
  };

  // Auto-advance when playing
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      handleNextPicture();
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="flex flex-col h-full w-full p-8 bg-gray-900 text-white">
      <PictureDisplay currentPicIndex={currentPicIndex} />
      <PictureInfo currentPicIndex={currentPicIndex} />
      <Controls
        onPrevious={handlePreviousPicture}
        onNext={handleNextPicture}
        onPlayPause={togglePlayback}
        isPlaying={isPlaying}
      />
      <ProgressSlider
        currentPicIndex={currentPicIndex}
        onChange={handleSliderChange}
      />
    </div>
  );
}
