import "./globals.css";
import PwaRegistry from "./pwa-registry";

export const metadata = {
  title: "Micro Apps",
  description: "A hub of small personal web apps",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black">
        {children}
        <PwaRegistry />
      </body>
    </html>
  );
}
