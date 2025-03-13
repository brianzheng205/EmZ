"use client";

import RoutePage from "./components/RoutePage";
import { ROUTES } from "./components/layout/SideBar";
import "./globals.css";

export default function Home() {
  return <RoutePage title="Apps" routes={ROUTES.slice(1)} />;
}
