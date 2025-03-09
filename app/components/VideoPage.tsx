import { ReactNode } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function VideoPage(props: {
  videoSrc: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <Box position="relative">
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

      <Box
        display="flex"
        flexDirection="column"
        gap="100vh"
        color="white"
        mx={4}
        flex={1}
      >
        <Box
          display="flex"
          flexDirection="column"
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
        </Box>
        {props.children}
      </Box>
    </Box>
  );
}
