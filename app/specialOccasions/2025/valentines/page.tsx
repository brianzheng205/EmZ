"use client";

import {
  Box,
  Typography,
  IconButton,
  Slider,
  Fade,
  LinearProgress,
} from "@mui/material";
import Stack from "@mui/material/Stack";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { IoPlayCircle, IoPauseCircle } from "react-icons/io5";

import { pictures } from "./data";

const INTERVAL_DURATION = 600;

function PictureDisplay(props: { currentPicIndex: number }) {
  return (
    <Fade in={true} key={props.currentPicIndex} timeout={INTERVAL_DURATION}>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "60vh",
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: 3,
          display: "flex",
        }}
      >
        <Image
          src={pictures[props.currentPicIndex].src}
          alt={pictures[props.currentPicIndex].title}
          fill
          style={{ objectFit: "contain" }}
          priority
        />
      </Box>
    </Fade>
  );
}

function PictureInfo(props: { currentPicIndex: number }) {
  return (
    <Fade in={true} key={props.currentPicIndex} timeout={INTERVAL_DURATION}>
      <Stack sx={{ gap: 1, width: "100%" }}>
        <Typography
          variant="h1"
          component="h1"
          sx={{ fontSize: "2rem", fontWeight: "bold" }}
        >
          {pictures[props.currentPicIndex].title}
        </Typography>
        <Typography variant="body1" sx={{ color: "gray" }}>
          {pictures[props.currentPicIndex].description}
        </Typography>
      </Stack>
    </Fade>
  );
}

function Controls(props: {
  onPrevious: () => void;
  onNext: () => void;
  onPlayPause: () => void;
  isPlaying: boolean;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <IconButton onClick={props.onPrevious} sx={{ fontSize: 38 }}>
        <IoIosArrowBack />
      </IconButton>
      <IconButton onClick={props.onPlayPause} sx={{ fontSize: 38 }}>
        {props.isPlaying ? <IoPauseCircle /> : <IoPlayCircle />}
      </IconButton>
      <IconButton onClick={props.onNext} sx={{ fontSize: 38 }}>
        <IoIosArrowForward />
      </IconButton>
    </Box>
  );
}

function AutoPlayIndicator(props: {
  isPlaying: boolean;
  onComplete: () => void;
  progressId: number;
}) {
  const { isPlaying, onComplete } = props;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
            setProgress(0);
          }, 120);
          return 100;
        }

        return Math.min(oldProgress + 10, 100);
      });
    }, 300);

    return () => {
      clearInterval(timer);
    };
  }, [isPlaying, onComplete]);

  return (
    <Box sx={{ width: "100%" }}>
      <LinearProgress variant="determinate" value={progress} />
    </Box>
  );
}

function ProgressSlider(props: {
  currentPicIndex: number;
  // eslint-disable-next-line no-unused-vars
  onChange: (event: Event, value: number | number[]) => void;
}) {
  const progress = (props.currentPicIndex / (pictures.length - 1)) * 100;

  return (
    <Stack sx={{ width: "100%" }}>
      <Slider value={progress} onChange={props.onChange} />
      <Box sx={{ width: "100%", textAlign: "center" }}>
        <Typography
          variant="body2"
          sx={{
            color: "gray",
          }}
        >
          {props.currentPicIndex + 1} / {pictures.length}
        </Typography>
      </Box>
    </Stack>
  );
}

function AudioPlayer(props: { isPlaying: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [volume, setVolume] = useState(0.2);
  const [isMuted, setIsMuted] = useState(false);
  const [isVolumeHovered, setIsVolumeHovered] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      if (props.isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [props.isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleVolumeChange = (event: Event, value: number | number[]) => {
    const newVolume = value as number;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <>
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 1,
          width: "100%",
        }}
        onMouseEnter={() => setIsVolumeHovered(true)}
        onMouseLeave={() => setIsVolumeHovered(false)}
      >
        <Fade in={isVolumeHovered} timeout={300}>
          <Box sx={{ overflow: "hidden" }}>
            <Slider
              value={volume}
              onChange={handleVolumeChange}
              min={0}
              max={1}
              step={0.01}
              sx={{
                width: 96,
                height: 8,
              }}
            />
          </Box>
        </Fade>
        <IconButton onClick={toggleMute} sx={{ color: "gray" }}>
          {isMuted || volume === 0 ? <HiSpeakerXMark /> : <HiSpeakerWave />}
        </IconButton>
      </Stack>
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

  const handleSliderChange = (event: Event, value: number | number[]) => {
    const newIndex = Math.round(
      ((value as number) / 100) * (pictures.length - 1)
    );
    setCurrentPicIndex(newIndex);
    setProgressKey((prev) => prev + 1);
  };

  return (
    <Stack
      sx={{
        gap: 1,
        px: 4,
        py: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Stack sx={{ gap: 2, width: "100%" }}>
        <PictureDisplay currentPicIndex={currentPicIndex} />
        <AutoPlayIndicator
          isPlaying={isPlaying}
          onComplete={handleNextPicture}
          key={progressKey}
          progressId={progressKey}
        />
      </Stack>
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
      <AudioPlayer isPlaying={isPlaying} />
    </Stack>
  );
}
