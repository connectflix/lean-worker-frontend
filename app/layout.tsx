import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LeanWorker",
  description:
    "LeanWorker helps you turn career uncertainty into clear action with AI-powered coaching, personalized recommendations, and practical next steps.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}