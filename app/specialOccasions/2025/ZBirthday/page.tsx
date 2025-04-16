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
import textOverlay from "/public/specialOccasions/2025/brianbday/textOverlay.png";
import present from "/public/specialOccasions/2025/brianbday/present.png";
import arrow from "/public/specialOccasions/2025/brianbday/arrow.png";

import "/app/globals.css";

const stardewTheme = createTheme({
  typography: {
    fontFamily: "'Stardew_Valley', Arial, sans-serif",
    fontSize: 30,
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
  const [gamblingWon, setGamblingWon] = useState(false);

  const startGambling = (target: number, mod: number) => {
    for (let i = 0; i <= target; i++) {
      setTimeout(() => setArrowLocation(i), i * 1000);
    }

    setTimeout(() => {
      if (target % 2 === mod) {
        if (numPresents === 1) setGamblingWon(true);
        setGambling(false);
        setOverlayText((prev) =>
          numPresents === 1
            ? [
                ...prev,
                "Congratulations! You've won the gift!",
                "It's a...",
                "1/2 of a 5090????????",
                "Guess you'll have to wait to find the other half to use it.",
                "What's that? You want to double or nothing?",
                "I guess you can since you're the birthday boy.",
                "Choose the last gift!",
              ]
            : [
                ...prev,
                "Congratulations! You've won all of the gifts!",
                "The first was my letter.",
                ...(gamblingWon
                  ? ["The second was half of a 5090"]
                  : [
                      "The second gift was...",
                      "half of a 5090???????",
                      "Guess you'll have to wait to find the other half to use it.",
                    ]),
                "This last one is...",
                "an all inclusive meal at the restaurant of your choice! (even Wagyu House)",
              ]
        );
        setOverlayTextIndex((prev) => prev + 1);
      } else {
        setGambling(false);
        setOverlayText((prev) => [
          ...prev,
          "Boohoo! You lose!",
          "Guess you'll never know what the gift was :(",
          ...(numPresents === 1
            ? [
                "What's that? You want to double or nothing?",
                "I guess you can since you're the birthday boy.",
                "Choose the last gift!",
              ]
            : []),
        ]);
        setOverlayTextIndex((prev) => prev + 1);
      }

      setArrowLocation(-1);
    }, (target + 1) * 1000);
  };

  const onPresentClick = () => {
    if (overlayTextIndex !== overlayText.length - 1 || gambling) return;

    if (numPresents === 3) {
      setOverlayText((prev) => [...prev, ...text.letter.msgs]);
      setOverlayTextIndex((prev) => prev + 1);
    } else {
      setOverlayText((prev) => [...prev, "Choose a color to gamble on:"]);
      setOverlayTextIndex((prev) => prev + 1);
      setGambling(true);
      setGamblingChoicesVisible(true);
      setGamblingChoiceHover([false, false]);
    }

    setNumPresents((prev) => prev - 1);
  };

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
                  width: "50%",
                  height: "auto",
                }}
              >
                <Image
                  src={textOverlay}
                  alt="Text Overlay Background"
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    color: "#530c01",
                    padding: "24px 32px",
                  }}
                >
                  <Typography sx={{ lineHeight: 1.05 }}>
                    {overlayText[overlayTextIndex]}
                  </Typography>

                  {gamblingChoicesVisible && (
                    <>
                      <Typography
                        sx={{
                          width: "100%",
                          border: gamblingChoiceHover[0]
                            ? "3px solid rgb(106, 33, 23)"
                            : "none",
                          borderRadius: "5px",
                          padding: "0 10px",
                        }}
                        onMouseOver={() =>
                          setGamblingChoiceHover([true, false])
                        }
                        onMouseOut={() =>
                          setGamblingChoiceHover([false, false])
                        }
                        onClick={() => {
                          setGamblingChoicesVisible(false);
                          setOverlayText((prev) => [...prev, "*Gulp*"]);
                          setOverlayTextIndex((prev) =>
                            overlayText.length > 17 ? prev : prev + 1
                          );
                          let target = Math.floor(Math.random() * 8);
                          startGambling(target, 0);
                        }}
                      >
                        Green
                      </Typography>
                      <Typography
                        sx={{
                          width: "100%",
                          border: gamblingChoiceHover[1]
                            ? "3px solid rgb(106, 33, 23)"
                            : "none",
                          borderRadius: "5px",
                          padding: "0 10px",
                        }}
                        onMouseOver={() =>
                          setGamblingChoiceHover([false, true])
                        }
                        onMouseOut={() =>
                          setGamblingChoiceHover([false, false])
                        }
                        onClick={() => {
                          setGamblingChoicesVisible(false);
                          setOverlayText((prev) => [...prev, "*Gulp*"]);
                          setOverlayTextIndex((prev) =>
                            overlayText.length > 17 ? prev : prev + 1
                          );
                          let target = Math.floor(Math.random() * 8);
                          startGambling(target, 1);
                        }}
                      >
                        Orange
                      </Typography>
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
              setGamblingWon(false);
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
