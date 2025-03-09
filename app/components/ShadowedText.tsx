import { ReactNode } from "react";
import Typography from "@mui/material/Typography";

export default function ShadowedText(props: { children: ReactNode }) {
  return (
    <Typography
      variant="h4"
      component="p"
      sx={{
        fontWeight: "bold",
        textShadow:
          "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
      }}
    >
      {props.children}
    </Typography>
  );
}
