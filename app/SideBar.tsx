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

export const links = [
  { route: "/", label: "Home", icon: <FiHome /> },
  {
    route: "/finance",
    label: "Finance",
    icon: <FiDollarSign />,
  },
];

export default function SideBar(props: { isOpen: boolean }) {
  const pathname = usePathname();

  const styles = {
    routerContainer:
      "block w-full px-4 py-2 rounded-md hover:bg-secondary flex items-center gap-2",
  };

  return (
    <div
      className={`h-full bg-primary text-white transition-all duration-500 overflow-hidden ${
        props.isOpen
          ? "min-w-[200px] max-w-[200px] opacity-100"
          : "min-w-0 max-w-0 opacity-30"
      }`}
    >
      <ul className="flex flex-col gap-2 p-4">
        {links.map(({ route, label, icon }) => (
          <li key={route}>
            {pathname === route ? (
              <div className={`${styles.routerContainer} bg-secondary`}>
                <div className="flex items-center justify-center min-w-6 h-6">
                  {icon}
                </div>
                <span>{label}</span>
              </div>
            ) : (
              <Link href={route} className={styles.routerContainer}>
                <div className="flex items-center justify-center min-w-6 h-6">
                  {icon}
                </div>
                <span>{label}</span>
              </Link>
            )}
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
