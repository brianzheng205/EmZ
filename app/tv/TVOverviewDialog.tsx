import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Chip,
  Stack,
} from "@mui/material";

import { EmZContent, NextEpisodeToAir, getGenreColor } from "./utils";

interface TVOverviewDialogProps {
  item: EmZContent;
  open: boolean;
  onClose: () => void;
}

export default function TVOverviewDialog({
  item,
  open,
  onClose,
}: TVOverviewDialogProps) {
  const title = item.media_type === "movie" ? item.title : item.name;
  const date =
    item.media_type === "movie" ? item.release_date : item.first_air_date;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, bgcolor: "background.default" },
      }}
    >
      {item.backdrop_path && (
        <Box
          component="img"
          src={`https://image.tmdb.org/t/p/w780${item.backdrop_path}`}
          alt={title}
          sx={{ width: "100%", height: 220, objectFit: "cover" }}
        />
      )}

      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 1,
        }}
      >
        <Typography variant="h6" fontWeight="bold" sx={{ color: "primary.main" }}>
          {title}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          {date && (
            <Typography variant="body2" color="text.secondary">
              {new Date(date + "T00:00:00").getFullYear()}
            </Typography>
          )}
          {item.vote_average > 0 && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <StarIcon sx={{ fontSize: 18, color: "warning.main" }} />
              <Typography variant="body2">
                {item.vote_average.toFixed(1)} ({item.vote_count})
              </Typography>
            </Stack>
          )}
          {item.media_type === "tv" && item.next_episode_to_air && (
            <Typography variant="body2" color="text.secondary">
              Next: {(item.next_episode_to_air as NextEpisodeToAir).air_date}
            </Typography>
          )}
        </Stack>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {item.genres?.map((g) => (
            <Chip
              key={g.id}
              label={g.name}
              size="small"
              sx={{ bgcolor: getGenreColor(g.id), fontSize: "0.7rem" }}
            />
          ))}
        </Box>

        <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
          {item.overview || "No overview available."}
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
