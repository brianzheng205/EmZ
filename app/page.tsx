"use client";

import RoutePage from "./components/RoutePage";
import { ROUTES } from "./SideBar";
import "./globals.css";

export default function Home() {
  return <RoutePage title="Apps" routes={ROUTES.slice(1)} />;
}
