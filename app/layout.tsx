import "./globals.css";
import { QueryProvider } from "@/lib/query-provider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cloud Cost Explorer | Atomity",
  description:
    "Interactive multi-level cloud cost telemetry and resource drill-down explorer",
  icons: {
    icon: "/globe.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Cloud Cost Explorer | Atomity</title>
        <link rel="icon" href="/globe.svg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem("theme");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)})()`,
          }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
