"use client";

import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";

import { prompts, PromptId } from "./data";

type buttonValue = "Yes" | "No";

const maxNoClicks = 30;
const minTime = 50;
const maxTime = 500;
const timeDelta = 50;
const maxPositionChange = 200;

const styles = {
  button:
    "h-full px-5 py-2.5 text-xl text-white font-bold rounded bg-primary hover:bg-secondary cursor-pointer",
};

export default function Page() {
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
      setTopPosition(getRandomInt(-maxPositionChange, maxPositionChange));
      setLeftPosition(getRandomInt(-maxPositionChange, maxPositionChange));
      noClicksRef.current++;
    }
  };

  const changePrompt = (buttonClicked: buttonValue) => {
    if (currentPrompt === "repeat4" && buttonClicked === "No") {
      noClicksRef.current++;
      setTopPosition(getRandomInt(-maxPositionChange, maxPositionChange));
      setLeftPosition(getRandomInt(-maxPositionChange, maxPositionChange));
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
      if (noClicksRef.current < maxNoClicks) {
        const currNoClicks = noClicksRef.current;
        setTimeout(
          () => autoChangePosition(currNoClicks),
          Math.max(minTime, maxTime - noClicksRef.current * timeDelta)
        );
      }
    }
  }, [noClicksRef.current]);

  const noVisible = noClicksRef.current < maxNoClicks;

  return (
    <div className="flex flex-col flex-grow justify-center items-center mb-24">
      <Image
        className="w-[300px] h-[300px] object-contain"
        src={prompts[currentPrompt].image}
        alt="Will You Be My Valentine?"
        height={300}
        width={300}
        priority={true}
      />
      <p className="m-5 text-4xl font-bold">{prompts[currentPrompt].text}</p>
      <div className="flex gap-2">
        {onVictoryScreen ? (
          <button onClick={restartClick} className={`${styles.button} w-32`}>
            Restart
          </button>
        ) : (
          <>
            <button
              onClick={noVisible ? () => changePrompt("No") : () => {}}
              className={`${
                styles.button
              } w-20 bg-muted hover:bg-accent relative ${
                noVisible ? "visible" : "invisible"
              }`}
              style={{
                top: topPosition,
                left: leftPosition,
              }}
            >
              No
            </button>
            <button
              onClick={() => changePrompt("Yes")}
              className={`${styles.button} w-20`}
            >
              Yes
            </button>
          </>
        )}
      </div>
    </div>
  );
}
