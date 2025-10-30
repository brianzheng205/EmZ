import {
  Button,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Avatar,
  Typography,
  Stack,
} from "@mui/material";
import { GridRowsProp } from "@mui/x-data-grid";
import { useState } from "react";

import { EmZContent, EmZGenre } from "./utils";
import { applyFilters } from "./utils";
type NextShowProps = {
  rows: GridRowsProp;
  genres: Record<number, EmZGenre> | null;
};
export default function NextShow({ rows, genres }: NextShowProps) {
  const [selectedContent, setSelectedContent] = useState<EmZContent | null>(
    null
  );
  const [open, setOpen] = useState(false);
  return (
    <Box>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        sx={{ width: "50%", justifySelf: "center" }}
      >
        <DialogTitle>Next Show</DialogTitle>
        {selectedContent && (
          <DialogContent>
            <Stack direction={"row"} spacing={2} alignItems={"center"}>
              <Avatar
                src={`https://image.tmdb.org/t/p/w500${selectedContent.poster_path}`}
                variant="square"
                sx={{ width: 100, height: "100%" }}
              />
              <Stack>
                <Typography variant="h4">{selectedContent.name}</Typography>
                <Typography>Selected By: {selectedContent.who}</Typography>
                <Typography>Overview: {selectedContent.overview}</Typography>
                <Typography>
                  Genres:{" "}
                  {selectedContent.genre_ids
                    .map((id) => {
                      if (genres) return genres[id].name;
                    })
                    .join(", ")}
                </Typography>
                <Typography>Episodes: {selectedContent.episodes}</Typography>
              </Stack>
            </Stack>
          </DialogContent>
        )}
      </Dialog>
      <Button
        onClick={() => {
          const content = applyFilters(rows, {
            notStartedFilter: {
              name: "notStartedFilter",
              filter: (items) => items.filter((item) => item.watched === 0),
            },
            tvFilter: {
              name: "tvFilter",
              filter: (items) =>
                items.filter((item) => item.media_type === "tv"),
            },
          });

          const randomIndex = Math.floor(Math.random() * content.length);
          const randomItem = content[randomIndex];
          setSelectedContent(randomItem as EmZContent);
          setOpen(true);
        }}
      >
        Choose Next Show
      </Button>
    </Box>
  );
}
