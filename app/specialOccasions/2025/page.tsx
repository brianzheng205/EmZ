import RoutePage from "../../components/RoutePage";
import { FiHeart, FiGift } from "react-icons/fi";
import { BsCake2 } from "react-icons/bs";
import { Route } from "../../components/RoutePage";

const ROUTES: Route[] = [
  {
    route: "/specialOccasions/2025/valentines",
    label: "Valentines",
    icon: <FiHeart />,
  },
  {
    route: "/specialOccasions/2025/EmBirthday",
    label: "Em Birthday",
    icon: <BsCake2 />,
  },
  {
    route: "/specialOccasions/2025/ZBirthday",
    label: "Z Birthday",
    icon: <FiGift />,
  },
];

export default function SpecialOccasions2025() {
  return <RoutePage title="2025" routes={ROUTES} />;
}
