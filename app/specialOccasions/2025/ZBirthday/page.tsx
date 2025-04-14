"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import brian_w_idle from "/public/specialOccasions/2025/brianbday/brian_w_idle.png";
import brian_d_idle from "/public/specialOccasions/2025/brianbday/brian_d_idle.png";
import brian_s_idle from "/public/specialOccasions/2025/brianbday/brian_s_idle.png";
import brian_a_idle from "/public/specialOccasions/2025/brianbday/brian_a_idle.png";
import emily_s_idle from "/public/specialOccasions/2025/brianbday/emily_s_idle.png";
import chatbubble from "/public/specialOccasions/2025/brianbday/chat.png";
import textOverlay from "/public/specialOccasions/2025/brianbday/textOverlay.png";
import present from "/public/specialOccasions/2025/brianbday/present.png";
import arrow from "/public/specialOccasions/2025/brianbday/arrow.png";

import "/app/globals.css";

const stardewTheme = createTheme({
  typography: {
    fontFamily: "'Stardew_Valley', Arial, sans-serif",
    fontSize: 30, // Set the base font size to 20px
  },
});

export default function ZBirthday() {
  const [keyPressed, setKeyPressed] = useState(false);
  const [heldKey, setHeldKey] = useState(null);
  const [lastKey, setLastKey] = useState(null);
  const [top, setTop] = useState<number>(0);
  const [left, setLeft] = useState<number>(0);
  const [hover, setHover] = useState(false);
  const [presents, setPresents] = useState([false, false, false]);
  const [overlayText, setOverlayText] = useState([
    "Happy birthday, Brian!",
    "I've prepared 3 special gifts for this special day!",
    "Choose wisely!",
  ]);
  const [overlayTextIndex, setOverlayTextIndex] = useState(overlayText.length);
  const [gambling, setGambling] = useState(false);
  const [gamblingChoicesVisible, setGamblingChoicesVisible] = useState(false);
  const [arrowLocation, setArrowLocation] = useState(-1);
  const [gamblingChoiceHover, setGamblingChoiceHover] = useState([
    false,
    false,
  ]);
  const [gamblingWon, setGamblingWon] = useState(false);
  const characterHeight = 100;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!keyPressed) {
        setKeyPressed(true);
        if (
          event.key === "a" ||
          event.key === "d" ||
          event.key === "w" ||
          event.key === "s"
        )
          setHeldKey(event.key);
      }
    };

    const handleKeyUp = (event) => {
      setKeyPressed(false);
      setHeldKey(null);
      if (
        event.key === "a" ||
        event.key === "d" ||
        event.key === "w" ||
        event.key === "s"
      )
        setLastKey(event.key);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [keyPressed]);

  useEffect(() => {
    const handle = () => {
      if (heldKey === "w" && top > 0) setTop(top - 5);
      if (heldKey === "a" && left > 0) setLeft(left - 5);
      if (heldKey === "s" && top < window.innerHeight - characterHeight - 70)
        setTop(top + 5);
      if (heldKey === "d" && left < window.innerWidth - 70) setLeft(left + 5);
    };

    const interval = setInterval(handle, 1);
    if (checkProximity()) {
      setHover(true);
    } else setHover(false);
    return () => clearInterval(interval);
  }, [heldKey, top, left]);

  const checkProximity = () => {
    const emilyRect = document.querySelector(".emily")?.getBoundingClientRect();
    if (
      emilyRect &&
      top > emilyRect.top - 100 &&
      top + characterHeight < emilyRect.bottom + 50 &&
      left + 70 > emilyRect.left - 10 &&
      left < emilyRect.right + 10
    ) {
      return true;
    }
    return false;
  };

  const startGambling = (target, mod) => {
    for (let i = 0; i <= target; i++) {
      setTimeout(() => {
        setArrowLocation(i);
      }, i * 1000);
    }

    setTimeout(() => {
      if (target % 2 === mod) {
        setOverlayText((prev) => {
          let newText = [...prev];
          if (presents.length === 1) {
            newText.push(
              ...[
                "Congratulations! You've won the gift!",
                "It's a...",
                "1/2 of a 5090????????",
                "Guess you'll have to wait to find the other half to use it.",
                "What's that? You want to double or nothing?",
                "I guess you can since you're the birthday boy.",
                "Choose the last gift!",
              ]
            );
            setGamblingWon(true);
          } else {
            newText.push("Congratulations! You've won all of the gifts!");
            newText.push("The first was my letter.");
            newText.push(
              gamblingWon
                ? "The second was half of a 5090"
                : "The second gift was..."
            );
            if (!gamblingWon) {
              newText.push("half of a 5090???????");
              newText.push(
                "Guess you'll have to wait to find the other half to use it."
              );
            }
            newText.push("This last one is...");
            newText.push(
              "an all inclusive meal at the restaurant of your choice! (even Wagyu House) "
            );
          }
          return newText;
        });
        setOverlayTextIndex((prev) => {
          setGambling(false);
          return prev + 1;
        });
      } else {
        setOverlayText((prev) => {
          let newText = [...prev];
          newText.push(
            ...[
              "Boohoo! You lose!",
              "Guess you'll never know what the gift was :(",
            ]
          );

          if (presents.length == 1) {
            newText.push("What's that? You want to double or nothing?");
            newText.push("I guess you can since you're the birthday boy.");
            newText.push("Choose the last gift!");
          }
          return newText;
        });
        setOverlayTextIndex((prev) => {
          setGambling(false);
          return prev + 1;
        });
      }
      setArrowLocation(-1);
    }, (target + 1) * 1000);
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
          height: "93vh",
          width: "100vw",
          cursor: "url(/specialOccasions/2025/brianbday/cursor.png) 10 10,auto",
        }}
      >
        {overlayTextIndex < overlayText.length && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              height: "93vh",
              width: "100vw",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              {presents.map((pop, index) => (
                <Image
                  style={{
                    marginTop: "5%",
                    transform: pop ? "scale(1.3)" : "scale(1)",
                  }}
                  key={index}
                  src={present}
                  alt="present"
                  height={300}
                  onMouseOver={() =>
                    setPresents((prev) => {
                      const newPresents = [...prev];
                      newPresents[index] = true;
                      return newPresents;
                    })
                  }
                  onMouseOut={() =>
                    setPresents((prev) => {
                      const newPresents = [...prev];
                      newPresents[index] = false;
                      return newPresents;
                    })
                  }
                  onClick={() => {
                    if (
                      overlayTextIndex === overlayText.length - 1 &&
                      !gambling
                    ) {
                      if (presents.length === 3) {
                        setOverlayText((prev) => {
                          let newText = [...prev];
                          newText.push(
                            ...[
                              "Congratulations! You've chosen Emily's letter <3",
                              "I'll write it in this text box because I'm lazy ;p",
                              "Hi bao bei! Hope you're enjoying your birthday so far <3 I know you're a big fan of Stardew Valley (me too) and it gives you a lot of energy so I themed this year's birthday around it!",
                              "Originally it was a completely different concept but that'll have to wait for a diff year :p",
                              "Anyways, HAPPY 21!! It's time to get wasted (but not without me !!!!!) I can't wait to celebrate with you IRL even if there's a delay.",
                              "Thank you for always being my #1 supporter and for always being there for me! I hope that I can be the same kind of rock for you that you are for me.",
                              "Thanks for always being productive with me, even if you have nothing to do and I love our study hangouts (it truly helps me work B) )",
                              "Thanks for always being willing to sacrifice your sleep and time and money for me. I hope for many more visits in the future (until there's none B) )",
                              "I LOVE YOU AND HAVE A HAPPY BIRTHDAY - EMILY <3",
                              "Wow, wasn't that such a sweet letter? I'm sure you'll cherish it forever!",
                              "What's that? You want to gamble the letter for the other presents?",
                              "Well, alright :( Choose the gift you want to gamble for the letter",
                            ]
                          );
                          return newText;
                        });
                        setOverlayTextIndex((prev) => prev + 1);
                      } else {
                        setOverlayText((prev) => {
                          let newText = [...prev];
                          newText.push(...["Choose a color to gamble on:"]);
                          return newText;
                        });
                        setOverlayTextIndex((prev) => prev + 1);
                        setGambling(true);
                        setGamblingChoicesVisible(true);
                        setGamblingChoiceHover([false, false]);
                      }
                      setPresents((prev) => {
                        const newPresents = Array(prev.length - 1).fill(false);
                        return newPresents;
                      });
                    }
                  }}
                />
              ))}
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                margin: "5% 0",
              }}
            >
              {gambling &&
                [
                  "green",
                  "orange",
                  "green",
                  "orange",
                  "green",
                  "orange",
                  "green",
                  "orange",
                ].map((color, index) => {
                  return (
                    <Box key={`container${index}`}>
                      <Box
                        key={index}
                        sx={{
                          backgroundColor: color,
                          width: 30,
                          height: 30,
                        }}
                      />
                      <Image
                        style={{
                          visibility:
                            index == arrowLocation ? "visible" : "hidden",
                        }}
                        key={`arrow${index}`}
                        src={arrow}
                        alt="arrow"
                        height={30}
                      />
                    </Box>
                  );
                })}
            </Box>
            <Box
              sx={{
                position: "absolute",
                bottom: "10%",
                left: "50%",
                transform: "translateX(-50%)",
              }}
              onClick={() =>
                setOverlayTextIndex((prev) =>
                  prev < overlayText.length - 1 || presents.length <= 0
                    ? prev + 1
                    : prev
                )
              }
            >
              <Image
                src={textOverlay}
                alt="textOverlay"
                height={window.innerHeight * 0.3}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  padding: "3% 5%",
                  fontFamily: "Stardew_Valley",
                  fontSize: "2em",
                  color: "#45110a",
                  width: "100%",
                }}
              >
                <Typography>{overlayText[overlayTextIndex]}</Typography>
                {gamblingChoicesVisible && (
                  <Box>
                    <Typography
                      sx={{
                        width: "100%",
                        border: gamblingChoiceHover[0]
                          ? "3px solid rgb(106, 33, 23)"
                          : "none",
                        borderRadius: "5px",
                        padding: "0 10px",
                      }}
                      onMouseOver={() => setGamblingChoiceHover([true, false])}
                      onMouseOut={() => setGamblingChoiceHover([false, false])}
                      onClick={() => {
                        setGamblingChoicesVisible(false);
                        setOverlayText((prev) => {
                          return [...prev, "*Gulp*"];
                        });
                        setOverlayTextIndex((prev) => {
                          return overlayText.length > 17 ? prev : prev + 1;
                        });
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
                      onMouseOver={() => setGamblingChoiceHover([false, true])}
                      onMouseOut={() => setGamblingChoiceHover([false, false])}
                      onClick={() => {
                        setGamblingChoicesVisible(false);
                        setOverlayText((prev) => {
                          return [...prev, "*Gulp*"];
                        });
                        setOverlayTextIndex((prev) => {
                          return overlayText.length > 17 ? prev : prev + 1;
                        });
                        let target = Math.floor(Math.random() * 8);
                        startGambling(target, 1);
                      }}
                    >
                      Orange
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        )}

        <Box
          sx={{ position: "absolute", top: "60%", left: "80%", zIndex: 0 }}
          className="emily"
          onContextMenu={(e) => {
            if (hover) {
              e.preventDefault();
              setHover(false);
              setOverlayTextIndex(0);

              setPresents([false, false, false]);
              setOverlayText([
                "Happy birthday, Brian!",
                "I've prepared 3 special gifts for this special day!",
                "Choose wisely!",
              ]);
              setGambling(false);
              setGamblingChoicesVisible(false);
              setArrowLocation(-1);
              setGamblingWon(false);
              setGamblingChoiceHover([false, false]);
            }
          }}
        >
          <Image src={emily_s_idle} alt="Emily" height={characterHeight} />
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

        <Image
          style={{
            position: "absolute",
            top: top,
            left: left,
            zIndex: 0,
          }}
          src={
            heldKey
              ? heldKey === "w"
                ? brian_w_idle
                : heldKey === "d"
                ? brian_d_idle
                : heldKey === "a"
                ? brian_a_idle
                : brian_s_idle
              : lastKey === "w"
              ? brian_w_idle
              : lastKey === "d"
              ? brian_d_idle
              : lastKey === "a"
              ? brian_a_idle
              : brian_s_idle
          }
          alt="Brian"
          height={characterHeight}
        />
      </Box>
    </ThemeProvider>
  );
}
