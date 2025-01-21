"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiCalendar } from "react-icons/fi";
import { MdOutlineTimer } from "react-icons/md";
import { HiOutlineBanknotes } from "react-icons/hi2";
import { Route } from "./components/RoutePage";

import "./globals.css";

export const ROUTES: Route[] = [
  { route: "/", label: "Home", icon: <FiHome /> },
  {
    route: "/finance",
    label: "Finance",
    icon: <HiOutlineBanknotes />,
  },
  {
    route: "/countdown",
    label: "Countdown",
    icon: <MdOutlineTimer />,
  },
  {
    route: "/specialOccasions",
    label: "Special Occasions",
    icon: <FiCalendar />,
  },
];

const styles = {
  routerContainer:
    "block w-full min-h-10 px-4 py-2 rounded-md hover:bg-secondary flex items-center gap-2",
};

function RouterContainer(props: { route: string; children: React.ReactNode }) {
  const pathname = usePathname();

  return pathname === props.route ? (
    <div className={`${styles.routerContainer} bg-secondary`}>
      {props.children}
    </div>
  ) : (
    <Link href={props.route} className={styles.routerContainer}>
      {props.children}
    </Link>
  );
}

function SideBarRoute(props: {
  route: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <RouterContainer route={props.route}>
      <div>{props.icon}</div>
      <span className="whitespace-nowrap">{props.label}</span>
    </RouterContainer>
  );
}

export default function SideBar(props: { isOpen: boolean }) {
  return (
    <div
      className={`h-full bg-primary text-white transition-all duration-500 overflow-hidden ${
        props.isOpen
          ? "min-w-[200px] max-w-[400px] opacity-100"
          : "min-w-0 max-w-0 opacity-30"
      }`}
    >
      <ul className="flex flex-col gap-2 p-4">
        {ROUTES.map(({ route, label, icon }) => (
          <li key={route}>
            <SideBarRoute route={route} label={label} icon={icon} />
          </li>
        ))}
      </ul>
    </div>
  );
}
