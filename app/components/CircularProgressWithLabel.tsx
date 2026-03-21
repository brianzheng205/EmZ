import {
  CircularProgress,
  CircularProgressProps,
  Box,
  Typography,
} from "@mui/material";
import { ContentStatus } from "@shared/tv/types";
export default function CircularProgressWithLabel(
  props: CircularProgressProps & { value: number; status: ContentStatus },
) {
  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="caption"
          component="div"
          sx={{ color: "text.secondary" }}
        >{`${Math.round(props.value) === 100 && props.status !== ContentStatus.COMPLETED ? Math.floor(props.value) : Math.round(props.value) === 0 && props.status !== ContentStatus.NOT_STARTED ? Math.ceil(props.value) : Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}
