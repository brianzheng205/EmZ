"use client";

import RoutePage from "../components/RoutePage";
import { FiCalendar } from "react-icons/fi";
import { Route } from "../components/RoutePage";

const SPECIAL_OCCASION_ROUTES: Route[] = [
  {
    route: "/specialOccasions/2024",
    label: "2024",
    icon: <FiCalendar />,
  },
];

export default function Home() {
  return (
    <RoutePage title="Special Occasions" routes={SPECIAL_OCCASION_ROUTES} />
  );
}
