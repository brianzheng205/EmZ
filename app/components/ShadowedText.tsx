import { ReactNode } from "react";

interface ShadowedTextProps {
  children: ReactNode;
}

export default function ShadowedText({ children }: ShadowedTextProps) {
  return (
    <p className="text-3xl font-bold [text-shadow:-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000]">
      {children}
    </p>
  );
}
