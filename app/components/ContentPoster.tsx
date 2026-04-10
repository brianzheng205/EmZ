import { Box, Typography, Stack, useTheme } from "@mui/material";
import MovieIcon from "@mui/icons-material/Movie";
import TvIcon from "@mui/icons-material/Tv";
import { motion } from "framer-motion";

interface ContentPosterProps {
  posterPath: string | null | undefined;
  title: string;
  mediaType?: "tv" | "movie";
  height?: number | string;
  width?: number | string;
  sx?: any;
  hideTitle?: boolean;
}

export default function ContentPoster({
  posterPath,
  title,
  mediaType,
  height = 300,
  width = "100%",
  sx,
  hideTitle = false,
}: ContentPosterProps) {
  const theme = useTheme();

  if (posterPath) {
    return (
      <Box
        component={motion.img}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        src={`https://image.tmdb.org/t/p/w500${posterPath}`}
        alt={title}
        sx={{
          width: width,
          height: height,
          objectFit: "cover",
          display: "block",
          ...sx,
        }}
      />
    );
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      sx={{
        width: width,
        height: height,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        color: "white",
        p: 3,
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        ...sx,
      }}
    >
      {/* Dynamic particles or subtle circles in background */}
      <Box
        component={motion.div}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        sx={{
          position: "absolute",
          top: -100,
          left: -100,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.05)",
          zIndex: 0,
        }}
      />

      <Stack
        spacing={height && !isNaN(Number(height)) && Number(height) < 200 ? 1 : 2}
        alignItems="center"
        sx={{ zIndex: 1, width: "100%" }}
      >
        <motion.div
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {mediaType === "tv" ? (
            <TvIcon
              sx={{
                fontSize:
                  height && !isNaN(Number(height)) && Number(height) < 200
                    ? 32
                    : 48,
                opacity: 0.9,
                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
              }}
            />
          ) : (
            <MovieIcon
              sx={{
                fontSize:
                  height && !isNaN(Number(height)) && Number(height) < 200
                    ? 32
                    : 48,
                opacity: 0.9,
                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
              }}
            />
          )}
        </motion.div>

        {!hideTitle && (
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{
              lineHeight: 1.1,
              textShadow: "0 2px 8px rgba(0,0,0,0.4)",
              wordBreak: "break-word",
              px: 1,
              // Dynamic font size and clamping based on height
              fontSize:
                height && !isNaN(Number(height)) && Number(height) < 200
                  ? "0.85rem"
                  : "1.25rem",
              display: "-webkit-box",
              WebkitLineClamp:
                height && !isNaN(Number(height)) && Number(height) < 200 ? 3 : 6,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </Typography>
        )}

        <Box
          sx={{
            py: 0.25,
            px: 1.25,
            borderRadius: 5,
            bgcolor: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(4px)",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              opacity: 1,
              textTransform: "uppercase",
              letterSpacing: 1.2,
              fontWeight: 700,
              fontSize:
                height && !isNaN(Number(height)) && Number(height) < 200
                  ? "0.55rem"
                  : "0.65rem",
            }}
          >
            {mediaType === "tv" ? "TV Series" : "Movie"}
          </Typography>
        </Box>
      </Stack>

      {/* Decorative background element with motion */}
      <Box
        component={motion.div}
        animate={{
          rotate: [-15, -10, -15],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        sx={{
          position: "absolute",
          bottom: -20,
          right: -20,
          opacity: 0.15,
          zIndex: 0,
        }}
      >
        {mediaType === "tv" ? (
          <TvIcon sx={{ fontSize: 180 }} />
        ) : (
          <MovieIcon sx={{ fontSize: 180 }} />
        )}
      </Box>

      {/* Subtle overlay for depth */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.2) 100%)",
          zIndex: 0,
        }}
      />
    </Box>
  );
}
