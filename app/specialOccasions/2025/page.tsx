import RoutePage from "../../components/RoutePage";
import { FiHeart } from "react-icons/fi";
import { Route } from "../../components/RoutePage";

const ROUTES: Route[] = [
  {
    route: "/specialOccasions/2025/EmBirthday",
    label: "Birthday",
    icon: <FiHeart />,
  },
];

export default function SpecialOccasions2025() {
  return <RoutePage title="2025" routes={ROUTES} />;
}
