"use client";

import { useState } from "react";
import SideBar from "./SideBar";
import Header from "./Header";

import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);

  return (
    <html lang="en">
      <body className="flex flex-col w-full h-screen bg-background">
        <Header
          isSideBarOpen={isSideBarOpen}
          setIsSideBarOpen={setIsSideBarOpen}
        />
        <div className="flex flex-grow h-[calc(100vh-64px)]">
          <SideBar isOpen={isSideBarOpen} />
          <div className="flex-grow">{children}</div>
        </div>
      </body>
    </html>
  );
}
