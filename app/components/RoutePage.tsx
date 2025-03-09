"use client";

import { ReactNode } from "react";

import Card from "@mui/material/Card";
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
            <Link
              href={route}
              // className="flex items-center justify-center p-8 rounded-3xl bg-primary hover:bg-secondary text-white"
            >
              <Card>
                <div className="flex items-center">{icon}</div>
                <Typography variant="h6" align="center">
                  {label}
                </Typography>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
