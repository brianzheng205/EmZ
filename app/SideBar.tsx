"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import "./globals.css";

const links = [
  { route: "/", label: "Home" },
  { route: "/finance", label: "Finance" },
];

export default function SideBar(props: { onClick: () => void }) {
  const pathname = usePathname();

  return (
    <div className="min-w-[200px] flex flex-col h-screen bg-primary text-white">
      <div className="flex items-center h-16 bg-primary p-4">
        <ToggleSideBar isOpen={true} onClick={props.onClick} />
      </div>
      <ul className="flex flex-col gap-2 p-4">
        {links.map(({ route, label }) => (
          <li key={route}>
            {pathname === route ? (
              <span className="block w-full px-4 py-2 rounded-md bg-secondary">
                {label}
              </span>
            ) : (
              <Link
                href={route}
                className="block w-full px-4 py-2 rounded-md hover:bg-secondary"
              >
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
