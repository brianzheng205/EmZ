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

const links = [
  { route: "/", label: "Home", icon: <FiHome /> },
  {
    route: "/finance",
    label: "Finance",
    icon: <FiDollarSign />,
  },
];

export default function SideBar() {
  const pathname = usePathname();

  return (
    <div className="min-w-[200px] flex flex-col h-screen bg-primary text-white">
      <ul className="flex flex-col gap-2 p-4">
        {links.map(({ route, label, icon }) => (
          <li key={route}>
            {pathname === route ? (
              <div className="block w-full px-4 py-2 rounded-md bg-secondary flex flex-row items-center gap-2">
                {icon}
                <span>{label}</span>
              </div>
            ) : (
              <Link
                href={route}
                className="block w-full px-4 py-2 rounded-md hover:bg-secondary flex items-center gap-2"
              >
                {icon}
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
