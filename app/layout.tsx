import { Metadata } from "next";

import ThemeProviderWrapper from "@/components/layout/ThemeProviderWrapper";

interface RootLayoutProps {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: { default: "EmZ", template: "%s | EmZ" },
  description: "an app consolidating all EmZ services",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        {/* TODO: Fix the font loading issue */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProviderWrapper>{children}</ThemeProviderWrapper>
      </body>
    </html>
  );
}
