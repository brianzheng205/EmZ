import { Box, Stack, Typography } from "@mui/material";
import { ReactNode } from "react";

export default function VideoPage(props: {
  videoSrc: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <Box position="relative" sx={{ height: "100%" }}>
      <Box
        component="video"
        autoPlay
        loop
        playsInline
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "100vh",
          objectFit: "cover",
          zIndex: -10,
        }}
      >
        <source src={props.videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </Box>

      <Stack spacing="100vh" color="white" mx={4}>
        <Stack
          justifyContent="center"
          alignItems="center"
          height="calc(100vh - 128px)"
        >
          <Typography
            variant="h1"
            align="center"
            fontWeight="bold"
            sx={{
              fontSize: "15rem",
              textShadow:
                "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
            }}
          >
            {props.title}
          </Typography>
        </Stack>
        {props.children}
      </Stack>
    </Box>
  );
}
