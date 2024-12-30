"use client";

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
        <div className="flex items-center h-16 bg-primary p-4">
          <ToggleSideBar
            isOpen={isSideBarOpen}
            onClick={() => setIsSideBarOpen((prev) => !prev)}
          />
        </div>

        <div className="flex flex-grow">
          {isSideBarOpen && <SideBar />}
          <div className="flex flex-col flex-grow p-4">{children}</div>
        </div>
      </body>
    </html>
  );
}
