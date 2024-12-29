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
      <body className="flex w-full h-screen bg-background">
        {isSideBarOpen && <SideBar onClick={() => setIsSideBarOpen(false)} />}

        <div className="flex flex-col flex-grow">
          <div className="flex items-center h-16 bg-primary p-4">
            {!isSideBarOpen && (
              <ToggleSideBar
                isOpen={false}
                onClick={() => setIsSideBarOpen(true)}
              />
            )}
          </div>
          <div className="flex flex-col flex-grow p-4">{children}</div>
        </div>
      </body>
    </html>
  );
}
