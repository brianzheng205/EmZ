import { Container } from "@mui/material";
import { ReactNode } from "react";

import CenteredLoader from "./CenteredLoader";

interface LoadingContainerProps {
  loading: boolean;
  children: ReactNode;
}

export default function LoadingContainer({
  loading,
  children,
}: LoadingContainerProps) {
  return (
    <Container sx={{ height: loading ? "100%" : "auto" }}>
      {loading ? <CenteredLoader /> : children}
    </Container>
  );
}
