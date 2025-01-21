"use client";

import RoutePage from "../components/RoutePage";
import { FiCalendar } from "react-icons/fi";
import { Route } from "../components/RoutePage";

const ROUTES: Route[] = [
  {
    route: "/specialOccasions/2025",
    label: "2025",
    icon: <FiCalendar />,
  },
  {
    route: "/specialOccasions/2024",
    label: "2024",
    icon: <FiCalendar />,
  },
];

export default function SpecialOccasions() {
  return <RoutePage title="Special Occasions" routes={ROUTES} />;
}
