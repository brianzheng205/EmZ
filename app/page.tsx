import { ROUTES_WITHOUT_HOME } from "./components/layout/SideBar";
import RoutePage from "./components/pages/RoutePage";

export default function Home() {
  return <RoutePage title="Apps" routes={ROUTES_WITHOUT_HOME} />;
}
