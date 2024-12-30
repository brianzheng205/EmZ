"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiChevronLeft,
  FiChevronRight,
  FiDollarSign,
  FiHome,
} from "react-icons/fi";

import "./globals.css";

export const routes = [
  { route: "/", label: "Home", icon: <FiHome /> },
  {
    route: "/finance",
    label: "Finance",
    icon: <FiDollarSign />,
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

function Route(props: { route: string; label: string; icon: React.ReactNode }) {
  return (
    <RouterContainer route={props.route}>
      <div>{props.icon}</div>
      <span>{props.label}</span>
    </RouterContainer>
  );
}

export default function SideBar(props: { isOpen: boolean }) {
  return (
    <div
      className={`h-full bg-primary text-white transition-all duration-500 overflow-hidden ${
        props.isOpen
          ? "min-w-[200px] max-w-[200px] opacity-100"
          : "min-w-0 max-w-0 opacity-30"
      }`}
    >
      <ul className="flex flex-col gap-2 p-4">
        {routes.map(({ route, label, icon }) => (
          <li key={route}>
            <Route route={route} label={label} icon={icon} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ToggleSideBar(props: { isOpen: boolean; onClick: () => void }) {
  return (
    <button
      className="w-12 h-12 rounded-md bg-primary hover:bg-secondary text-white"
      onClick={props.onClick}
    >
      {props.isOpen ? (
        <FiChevronLeft className="mx-auto" />
      ) : (
        <FiChevronRight className="mx-auto" />
      )}
    </button>
  );
}
