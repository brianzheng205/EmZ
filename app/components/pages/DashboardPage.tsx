"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, Card, Divider, Stack, Typography } from "@mui/material";
import { ReactNode } from "react";

import StyledLink from "../StyledLink";

export interface DashboardCard {
  label: string;
  route: string;
  icon: ReactNode;
  color: string;
  widget?: ReactNode;
}

export default function DashboardPage(props: {
  title: string;
  cards: DashboardCard[];
}) {
  return (
    <Stack spacing={4} sx={{ px: 4, py: 2, width: "100%" }}>
      <Typography variant="h1" align="center">
        {props.title}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 3,
        }}
      >
        {props.cards.map(({ label, route, icon, color, widget }) => (
          <StyledLink key={route} href={route}>
            <Card
              sx={{
                borderRadius: 6,
                p: 2.5,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: widget ? 1.5 : 0,
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 6,
                  bgcolor: "#e69b7a",
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    flexShrink: 0,
                    borderRadius: 3,
                    bgcolor: color,
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                  }}
                >
                  {icon}
                </Box>
                <Typography variant="h6" sx={{ flex: 1 }}>
                  {label}
                </Typography>
                <ArrowForwardIcon sx={{ color: "text.secondary", fontSize: 18 }} />
              </Stack>

              {widget && (
                <>
                  <Divider />
                  <Box sx={{ minHeight: 48 }}>{widget}</Box>
                </>
              )}
            </Card>
          </StyledLink>
        ))}
      </Box>
    </Stack>
  );
}
