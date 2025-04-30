import { FiCalendar } from "react-icons/fi";

import RoutePage from "../components/pages/RoutePage";
import { Route } from "../components/pages/RoutePage";

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
