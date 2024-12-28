import SideBar from "./SideBar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex w-full h-screen bg-background">
        <SideBar />
        <div className="flex-grow p-4">{children}</div>
      </body>
    </html>
  );
}
