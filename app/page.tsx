"use client";

import Link from "next/link";

import { routes } from "./SideBar";

import "./globals.css";

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-16 w-full">
      <h1 className="text-8xl">Apps</h1>
      <div className="grid grid-cols-2 gap-4 justify-items-stretch w-full">
        {routes.slice(1).map(({ label, route, icon }) => (
          <Link
            key={route}
            href={route}
            className="flex flex-col items-center justify-center gap-2 w-full p-8 rounded-3xl bg-primary hover:bg-secondary text-white"
          >
            <div className="flex items-center text-9xl">{icon}</div>
            <span className="text-2xl">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
