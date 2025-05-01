import Typography from "@mui/material/Typography";
import { ReactNode } from "react";

interface ShadowedTextProps {
  children: ReactNode;
}

export default function ShadowedText({ children }: ShadowedTextProps) {
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
      {children}
    </Typography>
  );
}
