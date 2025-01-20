"use client";

import Link from "next/link";
import { useState } from "react";

import SideBar, { ToggleSideBar } from "./SideBar";

import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);

  return (
    <html lang="en">
      <body className="flex flex-col w-full h-screen bg-background">
        <div className="relative flex items-center h-16 bg-primary p-4 text-white">
          <ToggleSideBar
            isOpen={isSideBarOpen}
            onClick={() => setIsSideBarOpen((prev) => !prev)}
          />
          <Link
            href="/"
            className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold"
          >
            <span>EmZ</span>
          </Link>
        </div>

        <div className="flex flex-grow h-[calc(100vh-64px)]">
          <SideBar isOpen={isSideBarOpen} />
          <div className="flex flex-col items-center flex-grow overflow-y-auto p-8 ">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
