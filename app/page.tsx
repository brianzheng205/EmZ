import { FiCalendar } from "react-icons/fi";
import { HiOutlineBanknotes } from "react-icons/hi2";
import { LuTv } from "react-icons/lu";
import { MdOutlineTimer } from "react-icons/md";
import { TbLocationHeart } from "react-icons/tb";

import CountdownWidget from "./countdown/Widget";
import DatesWidget from "./dates/Widget";
import DashboardPage, { DashboardCard } from "./components/pages/DashboardPage";
import FinanceWidget from "./finance/Widget";
import TVWidget from "./tv/Widget";

const CARDS: DashboardCard[] = [
  {
    route: "/finance",
    label: "Finance",
    icon: <HiOutlineBanknotes />,
    color: "#7a9e4a",
    widget: <FinanceWidget />,
  },
  {
    route: "/countdown",
    label: "Countdown",
    icon: <MdOutlineTimer />,
    color: "#b8763a",
    widget: <CountdownWidget />,
  },
  {
    route: "/specialOccasions",
    label: "Special Occasions",
    icon: <FiCalendar />,
    color: "#904C77",
  },
  {
    route: "/tv",
    label: "TV",
    icon: <LuTv />,
    color: "#4a6a9e",
    widget: <TVWidget />,
  },
  {
    route: "/dates",
    label: "Dates",
    icon: <TbLocationHeart />,
    color: "#c25a7c",
    widget: <DatesWidget />,
  },
];

export default function Home() {
  return <DashboardPage title="Apps" cards={CARDS} />;
}
