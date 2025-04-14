"use client";

import RoutePage from "./components/pages/RoutePage";
import { ROUTES } from "./components/layout/SideBar";

export default function Home() {
  return <RoutePage title="Apps" routes={ROUTES.slice(1)} />;
}
