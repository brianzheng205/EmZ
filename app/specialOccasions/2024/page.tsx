import { FiHeart } from "react-icons/fi";
import { IoRose } from "react-icons/io5";

import RoutePage, { Route } from "@/components/pages/RoutePage";

export const generateMetadata = () => ({
  title: "2024 Special Occasions",
  description: "Page for 2024 special occasions",
});

const ROUTES: Route[] = [
  {
    route: "/specialOccasions/2024/anniversary",
    label: "Anniversary",
    icon: <FiHeart />,
  },
  {
    route: "/specialOccasions/2024/valentines",
    label: "Valentines",
    icon: <IoRose />,
  },
];

export default function SpecialOccasions2024() {
  return <RoutePage title="2024" routes={ROUTES} />;
}
