"use client";

import Link from "next/link";
import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const links = [
  { route: "/", label: "Home" },
  { route: "/finance", label: "Finance" },
];

export default function SideBar() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className={`${
        isOpen && "min-w-[200px]"
      } h-screen bg-primary p-4 text-white`}
    >
      <div className="h-10 mb-2 flex items-center justify-center">
        <button
          className={
            "w-full h-full rounded-md bg-transparent hover:bg-secondary " +
            (isOpen ? "" : "px-4")
          }
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <FiChevronLeft className="mx-auto" />
          ) : (
            <FiChevronRight className="mx-auto" />
          )}
        </button>
      </div>
      {isOpen && (
        <ul className="space-y-2">
          {links.map(({ route, label }) => (
            <li key={route}>
              <Link href={route} className="w-full">
                <span className="block w-full px-4 py-2 rounded-md bg-transparent hover:bg-secondary">
                  {label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
