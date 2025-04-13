"use client";

import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { prompts, PromptId } from "./data";

type buttonValue = "Yes" | "No";

const MAX_NO_CLICKS = 30;
const MIN_TIME = 50;
const MAX_TIME = 500;
const TIME_DELTA = 50;
const MAX_POSITION_CHANGE = 200;

export default function Valentines() {
  const [currentPrompt, setCurrentPrompt] = useState<PromptId>("question");
  const [topPosition, setTopPosition] = useState(0);
  const [leftPosition, setLeftPosition] = useState(0);
  const noClicksRef = useRef(0);
  const onVictoryScreen =
    currentPrompt === "victory" || currentPrompt === "reluctantVictory";

  // reset variables
  const restartClick = () => {
    setTopPosition(0);
    setLeftPosition(0);
    noClicksRef.current = 0;
    setCurrentPrompt("question");
  };

  const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const autoChangePosition = (oldNoClicks: number) => {
    if (noClicksRef.current === oldNoClicks) {
      setTopPosition(getRandomInt(-MAX_POSITION_CHANGE, MAX_POSITION_CHANGE));
      setLeftPosition(getRandomInt(-MAX_POSITION_CHANGE, MAX_POSITION_CHANGE));
      noClicksRef.current++;
    }
  };

  const changePrompt = (buttonClicked: buttonValue) => {
    if (currentPrompt === "repeat4" && buttonClicked === "No") {
      noClicksRef.current++;
      setTopPosition(getRandomInt(-MAX_POSITION_CHANGE, MAX_POSITION_CHANGE));
      setLeftPosition(getRandomInt(-MAX_POSITION_CHANGE, MAX_POSITION_CHANGE));
      return;
    }

    const nextPrompt =
      buttonClicked == "Yes"
        ? prompts[currentPrompt].nextPromptYes
        : prompts[currentPrompt].nextPromptNo;

    if (nextPrompt !== undefined) {
      setCurrentPrompt(nextPrompt);
    }
  };

  useEffect(() => {
    if (currentPrompt === "repeat4") {
      if (noClicksRef.current < MAX_NO_CLICKS) {
        const currNoClicks = noClicksRef.current;
        setTimeout(
          () => autoChangePosition(currNoClicks),
          Math.max(MIN_TIME, MAX_TIME - noClicksRef.current * TIME_DELTA)
        );
      }
    }
  }, [noClicksRef.current]);

  const noVisible = noClicksRef.current < MAX_NO_CLICKS;

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      justifyContent="center"
      alignItems="center"
      mb={6}
    >
      <Image
        className="w-[300px] h-[300px] object-contain"
        src={prompts[currentPrompt].image}
        alt="Will You Be My Valentine?"
        height={300}
        width={300}
        priority={true}
      />
      <Typography variant="h4" component="p" m={2} fontWeight="bold">
        {prompts[currentPrompt].text}
      </Typography>
      <Box display="flex" gap={2}>
        {onVictoryScreen ? (
          <Button
            onClick={restartClick}
            variant="contained"
            color="primary"
            sx={{ width: 128 }}
          >
            Restart
          </Button>
        ) : (
          <>
            <Button
              onClick={noVisible ? () => changePrompt("No") : () => {}}
              variant="contained"
              color="error"
              sx={{
                width: 80,
                position: "relative",
                visibility: noVisible ? "visible" : "hidden",
                top: topPosition,
                left: leftPosition,
              }}
            >
              No
            </Button>
            <Button
              onClick={() => changePrompt("Yes")}
              variant="contained"
              color="primary"
              sx={{ width: 80 }}
            >
              Yes
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}
