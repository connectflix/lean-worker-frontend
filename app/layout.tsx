import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  title: {
    default: "LeanWorker",
    template: "%s · LeanWorker",
  },
  description:
    "LeanWorker transforme les situations professionnelles complexes en prochaines actions claires grâce à un coaching personnalisé.",
  applicationName: "LeanWorker",
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
    <html lang="fr" suppressHydrationWarning>
      <body>
        <div id="app-root">{children}</div>
      </body>
    </html>
  );
}