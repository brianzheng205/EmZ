"use client";

import { Box, Stack, Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Image from "next/image";
import * as R from "ramda";
import { useState } from "react";

import arrow from "public/specialOccasions/2025/brianbday/arrow.png";
import present from "public/specialOccasions/2025/brianbday/present.png";

import CharacterCanvas from "./CharacterCanvas";
import text from "./data";
import "./styles.css";

const stardewTheme = createTheme({
  typography: {
    fontFamily: "'Stardew_Valley', Arial, sans-serif",
    fontSize: 30,
    allVariants: {
      color: "rgb(106, 33, 23)",
    },
  },
});

export default function ZBirthdayPage() {
  const [numPresents, setNumPresents] = useState(3);

  // Overlay Text
  const [overlayTextKey, setOverlayTextKey] =
    useState<keyof typeof text>("intro");
  const overlayTextsList = text[overlayTextKey];
  const [overlayTextIndex, setOverlayTextIndex] = useState(
    overlayTextsList.length
  );
  const overlayText = overlayTextsList[overlayTextIndex];
  const isOverlayVisible = overlayTextIndex < overlayTextsList.length;

  // Gambling
  const [arrowLocation, setArrowLocation] = useState(-1);
  const [wonFirstGamble, setWonFirstGamble] = useState(false);
  const isChoosingColor = overlayTextKey === "startGamble";
  const isGambling = overlayTextKey === "duringGamble";

  const handleNextKey = (index?: number) => {
    if (overlayTextIndex < overlayTextsList.length - 1) return overlayTextKey;

    if (overlayTextKey === "intro") setOverlayTextKey("letter");
    else if (overlayTextKey === "letter") setOverlayTextKey("startGamble");
    else if (overlayTextKey === "startGamble" && index !== undefined) {
      setOverlayTextKey("duringGamble");
      startGambling(index); // takes care of "duringGamble" -> "gpuWin"/"gpuLose" or "mealWinWin"/"mealWinLose"/"mealLose"
      return; // don't set overlayTextIndex bc startGambling will do it after a delay
    } else if (["gpuWin", "gpuLose"].includes(overlayTextKey))
      setOverlayTextKey("startGamble");

    setOverlayTextIndex(0);
  };

  const onStartConvo = () => {
    setNumPresents(3);
    setOverlayTextKey("intro");
    setOverlayTextIndex(0);
    setArrowLocation(-1);
    setWonFirstGamble(false);
  };

  const startGambling = (mod: number) => {
    const target = Math.floor(Math.random() * 8);

    for (let i = 0; i <= target; i++) {
      setTimeout(() => setArrowLocation(i), i * 1000);
    }

    setTimeout(() => {
      if (target % 2 === mod) {
        if (numPresents === 1) setWonFirstGamble(true);
        setOverlayTextKey(
          numPresents === 1
            ? "gpuWin"
            : wonFirstGamble
            ? "mealWinWin"
            : "mealWinLose"
        );
      } else {
        setOverlayTextKey(numPresents === 1 ? "gpuLose" : "mealLose");
      }

      setArrowLocation(-1);
      setOverlayTextIndex(0);
    }, (target + 2) * 1000);
  };

  const onPresentClick = () => {
    if (overlayTextIndex !== overlayTextsList.length - 1 || isGambling) return;

    handleNextKey();
    setNumPresents((prev) => prev - 1);
  };

  const renderPresents = () => {
    return (
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
                "& .hover-img": {
                  transition: "transform 0.3s ease",
                },
                "&:hover .hover-img": {
                  transform: "scale(1.3)",
                },
              }}
              key={index}
            >
              <Image
                className="hover-img"
                src={present}
                alt="present"
                onClick={onPresentClick}
              />
            </Box>
          ),
          R.range(0, numPresents)
        )}
      </Stack>
    );
  };

  const renderGamblingWheel = () => {
    return (
      <Stack
        sx={{
          flexDirection: "row",
          justifyContent: "center",
          visibility: isGambling ? "visible" : "hidden",
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
              {index === arrowLocation && (
                <Image src={arrow} alt="arrow" width={30} height={30} />
              )}
            </Box>
          ),
          R.range(0, 8)
        )}
      </Stack>
    );
  };

  const renderGamblingChoice = (color: string, index: number) => (
    <Typography
      sx={{
        borderRadius: "5px",
        padding: "0 10px",
        "&:hover": {
          border: "3px solid",
        },
      }}
      onClick={() => handleNextKey(index)}
    >
      {color}
    </Typography>
  );

  const renderTextOverlay = () => {
    return (
      <Stack
        sx={{
          alignItems: "center",
          height: "50%",
        }}
        onClick={() =>
          setOverlayTextIndex((prev) =>
            (prev < overlayTextsList.length - 1 || numPresents <= 0) &&
            !isChoosingColor &&
            !isGambling
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
            <Typography sx={{ lineHeight: 1 }}>{overlayText}</Typography>

            {isChoosingColor && (
              <>
                {renderGamblingChoice("Green", 0)}
                {renderGamblingChoice("Orange", 1)}
              </>
            )}
          </Box>
        </Box>
      </Stack>
    );
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
          userSelect: "none",
        }}
      >
        <CharacterCanvas
          onStartConvo={onStartConvo}
          isOverlayVisible={isOverlayVisible}
        />

        {isOverlayVisible && (
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
            {renderPresents()}
            {renderGamblingWheel()}
            {renderTextOverlay()}
          </Stack>
        )}
      </Box>
    </ThemeProvider>
  );
}
