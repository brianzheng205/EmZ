"use client";

import { ROUTES } from "./components/layout/SideBar";
import RoutePage from "./components/pages/RoutePage";

export default function Home() {
  return <RoutePage title="Apps" routes={ROUTES.slice(1)} />;
}
