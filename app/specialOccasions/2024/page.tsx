"use client";

import RoutePage from "../../components/RoutePage";
import { FiHeart } from "react-icons/fi";
import { Route } from "../../components/RoutePage";

const ANNIVERSARY_ROUTES: Route[] = [
  {
    route: "/specialOccasions/2024/anniversary",
    label: "Anniversary",
    icon: <FiHeart />,
  },
];

export default function Anniversary() {
  return <RoutePage title="2024" routes={ANNIVERSARY_ROUTES} />;
}
