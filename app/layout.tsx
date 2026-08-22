import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProductMind AI",
  description: "Product discovery intelligence",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
          {children}
      </body>
    </html>
  );
}
