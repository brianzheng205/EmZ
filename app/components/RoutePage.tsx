"use client";

import { ReactNode } from "react";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid2";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

export interface Route {
  label: string;
  route: string;
  icon: ReactNode;
}

export default function RoutePage(props: { title: string; routes: Route[] }) {
  return (
    <Stack spacing={4} px={4} py={2}>
      <Typography variant="h1" align="center">
        {props.title}
      </Typography>
      <Grid container columns={3} spacing={2}>
        {props.routes.map(({ label, route, icon }) => (
          <Grid key={route} size={1}>
            <Link href={route} underline="none">
              <Card
                sx={{
                  minHeight: 200,
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 8,
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: 1,
                    "& svg": {
                      fontSize: 120,
                    },
                  }}
                >
                  {icon}
                  <Typography variant="h6" align="center">
                    {label}
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
