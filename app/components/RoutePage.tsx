"use client";

import Link from "next/link";
import { ReactNode } from "react";

export interface Route {
  label: string;
  route: string;
  icon: ReactNode;
}

interface RoutePageProps {
  title: string;
  routes: Route[];
}

export default function RoutePage(props: RoutePageProps) {
  return (
    <div className="flex flex-col items-center gap-16 w-full">
      <h1 className="text-8xl">{props.title}</h1>
      <div className="grid grid-cols-2 gap-4 justify-items-stretch w-full">
        {props.routes.map(({ label, route, icon }) => (
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