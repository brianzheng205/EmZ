"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiChevronLeft } from "react-icons/fi";
import { IoArrowBackOutline } from "react-icons/io5";
import {
  TbLayoutSidebarLeftCollapseFilled,
  TbLayoutSidebarLeftExpand,
} from "react-icons/tb";

function ToggleSideBarButton(props: { isOpen: boolean; onClick: () => void }) {
  return (
    <button
      className="w-12 h-12 rounded-md bg-primary hover:bg-secondary text-white"
      onClick={props.onClick}
    >
      {props.isOpen ? (
        <TbLayoutSidebarLeftCollapseFilled className="mx-auto text-2xl" />
      ) : (
        <TbLayoutSidebarLeftExpand className="mx-auto text-2xl" />
      )}
    </button>
  );
}

export default function Header({
  isSideBarOpen,
  setIsSideBarOpen,
}: {
  isSideBarOpen: boolean;
  setIsSideBarOpen: (value: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Count path segments (excluding empty strings from splitting)
  const pathSegments = pathname.split("/").filter(Boolean);
  const showBackButton = pathSegments.length > 1;

  const handleBack = () => {
    // Remove the last segment to go up one level
    const parentPath = "/" + pathSegments.slice(0, -1).join("/");
    router.push(parentPath);
  };

  return (
    <div className="relative flex items-center h-16 bg-primary p-4 text-white">
      <div className="flex items-center gap-2">
        <ToggleSideBarButton
          isOpen={isSideBarOpen}
          onClick={() => setIsSideBarOpen(!isSideBarOpen)}
        />
        {showBackButton && (
          <button
            onClick={handleBack}
            className="w-12 h-12 rounded-md bg-primary hover:bg-secondary text-white"
          >
            <IoArrowBackOutline className="mx-auto" />
          </button>
        )}
      </div>
      <Link
        href="/"
        className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold"
      >
        <span>EmZ</span>
      </Link>
    </div>
  );
}
