import RoutePage from "../../components/RoutePage";
import { BsCake2 } from "react-icons/bs";
import { Route } from "../../components/RoutePage";

const ROUTES: Route[] = [
  {
    route: "/specialOccasions/2025/EmBirthday",
    label: "Birthday",
    icon: <BsCake2 />,
  },
];

export default function SpecialOccasions2025() {
  return <RoutePage title="2025" routes={ROUTES} />;
}
