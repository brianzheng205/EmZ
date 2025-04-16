"use client";

import Image from "next/image";

import { useState } from "react";

import { Box, Stack, Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import * as R from "ramda";

import Character from "./../../../components/game/Character";

import text from "./data";
import emily_s_idle from "/public/specialOccasions/2025/brianbday/emily_s_idle.png";
import chatbubble from "/public/specialOccasions/2025/brianbday/chat.png";
import present from "/public/specialOccasions/2025/brianbday/present.png";
import arrow from "/public/specialOccasions/2025/brianbday/arrow.png";

import "/app/globals.css";

const stardewTheme = createTheme({
  typography: {
    fontFamily: "'Stardew_Valley', Arial, sans-serif",
    fontSize: 30,
    allVariants: {
      color: "rgb(106, 33, 23)",
    },
  },
});

const CHARACTER_HEIGHT = 100;
const CHARACTER_WIDTH = 70;

export default function ZBirthday() {
  const [hover, setHover] = useState(false);
  const [numPresents, setNumPresents] = useState(3);
  const [selectedPresent, setSelectedPresent] = useState(-1);
  const [overlayText, setOverlayText] = useState(text.intro.msgs);
  const [overlayTextIndex, setOverlayTextIndex] = useState(overlayText.length);
  const [gambling, setGambling] = useState(false);
  const [gamblingChoicesVisible, setGamblingChoicesVisible] = useState(false);
  const [arrowLocation, setArrowLocation] = useState(-1);
  const [gamblingChoiceHover, setGamblingChoiceHover] = useState([
    false,
    false,
  ]);
  const [wonFirstGamble, setWonFirstGamble] = useState(false);

  const startGambling = (target: number, mod: number) => {
    for (let i = 0; i <= target; i++) {
      setTimeout(() => setArrowLocation(i), i * 1000);
    }

    setTimeout(() => {
      if (target % 2 === mod) {
        if (numPresents === 1) setWonFirstGamble(true);
        setOverlayText(
          numPresents === 1
            ? text.gpuWin.msgs
            : wonFirstGamble
            ? text.mealWinWin.msgs
            : text.mealWinLose.msgs
        );
      } else {
        setOverlayText(
          numPresents === 1 ? text.gpuLose.msgs : text.mealLose.msgs
        );
      }

      setGambling(false);
      setArrowLocation(-1);
      setOverlayTextIndex(0);
    }, (target + 2) * 1000);
  };

  const onPresentClick = () => {
    if (overlayTextIndex !== overlayText.length - 1 || gambling) return;

    if (numPresents === 3) {
      setOverlayText(text.letter.msgs);
    } else {
      setOverlayText(text.startGamble.msgs);
      setGambling(true);
      setGamblingChoicesVisible(true);
      setGamblingChoiceHover([false, false]);
    }

    setOverlayTextIndex(0);
    setNumPresents((prev) => prev - 1);
  };

  const renderGamblingChoice = (color: string, index: number) => (
    <Typography
      sx={{
        border: gamblingChoiceHover[index] ? `3px solid` : "none",
        borderRadius: "5px",
        padding: "0 10px",
      }}
      onMouseOver={() =>
        setGamblingChoiceHover(index === 0 ? [true, false] : [false, true])
      }
      onMouseOut={() => setGamblingChoiceHover([false, false])}
      onClick={(e) => {
        e.stopPropagation();
        setGamblingChoicesVisible(false);
        setOverlayText(text.duringGamble.msgs);
        setOverlayTextIndex(0);
        let target = Math.floor(Math.random() * 8);
        startGambling(target, index);
      }}
    >
      {color}
    </Typography>
  );

  return (
    <ThemeProvider theme={stardewTheme}>
      <Box
        sx={{
          position: "relative",
          backgroundImage:
            "url(/specialOccasions/2025/brianbday/stardewvalleybg.avif)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          width: "100%",
          height: "100%",
          cursor: "url(/specialOccasions/2025/brianbday/cursor.png) 10 10,auto",
        }}
      >
        {overlayTextIndex < overlayText.length && (
          <Stack
            sx={{
              padding: "4% 2% 1% 2%",
              justifyContent: "space-between",
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              width: "100%",
              height: "100%",
            }}
          >
            <Stack
              sx={{
                flexDirection: "row",
                justifyContent: "space-around",
                marginBottom: "3%",
                height: "40%",
              }}
            >
              {R.map(
                (index) => (
                  <Box
                    sx={{
                      minWidth: "10%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    key={index}
                  >
                    <Image
                      style={{
                        transform:
                          index === selectedPresent ? "scale(1.3)" : "scale(1)",
                      }}
                      src={present}
                      alt="present"
                      onMouseOver={() => setSelectedPresent(index)}
                      onMouseOut={() => setSelectedPresent(-1)}
                      onClick={onPresentClick}
                    />
                  </Box>
                ),
                R.range(0, numPresents)
              )}
            </Stack>

            <Stack
              sx={{
                flexDirection: "row",
                justifyContent: "center",
                visibility: gambling ? "visible" : "hidden",
                height: "10%",
              }}
            >
              {R.map(
                (index) => (
                  <Box key={index}>
                    <Box
                      sx={{
                        backgroundColor: index % 2 === 0 ? "green" : "orange",
                        width: 30,
                        height: 30,
                      }}
                    />
                    <Image
                      style={{
                        visibility:
                          index == arrowLocation ? "visible" : "hidden",
                      }}
                      src={arrow}
                      alt="arrow"
                      width={30}
                      height={30}
                    />
                  </Box>
                ),
                R.range(0, 8)
              )}
            </Stack>

            <Stack
              sx={{
                alignItems: "center",
                height: "50%",
              }}
              onClick={() =>
                setOverlayTextIndex((prev) =>
                  prev < overlayText.length - 1 || numPresents <= 0
                    ? prev + 1
                    : prev
                )
              }
            >
              <Box
                sx={{
                  position: "relative",
                  display: "inline-block",
                  height: "100%",
                  aspectRatio: "579/180",
                  backgroundImage: `url(/specialOccasions/2025/brianbday/textOverlay.png)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    padding: "24px 36px",
                  }}
                >
                  <Typography sx={{ lineHeight: 1 }}>
                    {overlayText[overlayTextIndex]}
                  </Typography>

                  {gamblingChoicesVisible && (
                    <>
                      {renderGamblingChoice("Green", 0)}
                      {renderGamblingChoice("Orange", 1)}
                    </>
                  )}
                </Box>
              </Box>
            </Stack>
          </Stack>
        )}

        <Box
          sx={{ position: "absolute", top: "60%", left: "80%", zIndex: 0 }}
          className="emily"
          onContextMenu={(e) => {
            if (hover) {
              e.preventDefault();
              setHover(false);
              setOverlayTextIndex(0);
              setNumPresents(3);
              setSelectedPresent(-1);
              setOverlayText(text.intro.msgs);
              setGambling(false);
              setGamblingChoicesVisible(false);
              setArrowLocation(-1);
              setWonFirstGamble(false);
              setGamblingChoiceHover([false, false]);
            }
          }}
        >
          <Image src={emily_s_idle} alt="Emily" height={CHARACTER_HEIGHT} />
          {hover && (
            <Image
              src={chatbubble}
              alt="bubble"
              height={40}
              style={{
                position: "absolute",
                top: "70%",
                transform: "translateX(60%) translateY(-50%)",
              }}
            />
          )}
        </Box>

        <Character
          height={CHARACTER_HEIGHT}
          width={CHARACTER_WIDTH}
          movementSpeed={5}
          setHover={setHover}
        />
      </Box>
    </ThemeProvider>
  );
}
