"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import React, { useState, useEffect } from "react";

import { prompts, PromptId } from "./data";

type buttonValue = "Yes" | "No";

const MAX_NO_CLICKS = 30;
const MIN_TIME = 50;
const MAX_TIME = 500;
const DELTA_TIME = 50;
const MAX_POSITION_CHANGE = 200;

export default function ValentinesPage() {
  const [currentPrompt, setCurrentPrompt] = useState<PromptId>("question");
  const [topPosition, setTopPosition] = useState(0);
  const [leftPosition, setLeftPosition] = useState(0);
  const [numNoClicks, setNumNoClicks] = useState(0);

  const onVictoryScreen =
    currentPrompt === "victory" || currentPrompt === "reluctantVictory";
  const noVisible = numNoClicks < MAX_NO_CLICKS;

  // reset variables
  const restartClick = () => {
    setTopPosition(0);
    setLeftPosition(0);
    setNumNoClicks(0);
    setCurrentPrompt("question");
  };

  const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const changePrompt = (buttonClicked: buttonValue) => {
    if (currentPrompt === "repeat4" && buttonClicked === "No") {
      setNumNoClicks((prev) => prev + 1);
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
    const autoChangePosition = () => {
      setTopPosition(getRandomInt(-MAX_POSITION_CHANGE, MAX_POSITION_CHANGE));
      setLeftPosition(getRandomInt(-MAX_POSITION_CHANGE, MAX_POSITION_CHANGE));
      setNumNoClicks((prev) => prev + 1);
    };

    if (currentPrompt === "repeat4" && noVisible) {
      const timeout = setTimeout(
        autoChangePosition,
        Math.max(MIN_TIME, MAX_TIME - numNoClicks * DELTA_TIME)
      );
      return () => clearTimeout(timeout);
    }
  }, [currentPrompt, noVisible, numNoClicks]);

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
          <Button onClick={restartClick} color="primary" sx={{ width: 128 }}>
            Restart
          </Button>
        ) : (
          <>
            <Button
              onClick={noVisible ? () => changePrompt("No") : () => {}}
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
